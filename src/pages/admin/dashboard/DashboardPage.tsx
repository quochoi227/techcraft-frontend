import React, { useState, useEffect, useCallback } from "react"
import { LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import type {
  RevenueStatistics,
  OrderStatistics,
  UserStatistics,
  TimePeriod,
} from "@/types/statistics"
import { statisticsService } from "@/services/api/statisticsService"
import {
  MOCK_REVENUE_STATS_DAILY,
  MOCK_REVENUE_STATS_MONTHLY,
  MOCK_REVENUE_STATS_YEARLY,
  MOCK_ORDER_STATS,
  MOCK_USER_STATS,
} from "./mockData"
import { StatOverviewCards } from "./components/StatOverviewCards"
import { RevenueChart } from "./components/RevenueChart"
import { OrderStatusCard } from "./components/OrderStatusCard"
import { UserGrowthCard } from "./components/UserGrowthCard"
import { StatisticsDateFilter } from "./components/StatisticsDateFilter"
import { useOrderRefreshOnNotification } from "@/hooks/useOrderRefreshOnNotification"

export const DashboardPage: React.FC = () => {
  // Khoảng thời gian mặc định: 14 ngày qua
  const defaultDates = React.useMemo(() => {
    const now = new Date()
    const past = new Date()
    past.setDate(past.getDate() - 13)
    return {
      start: past.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    }
  }, [])

  const [startDate, setStartDate] = useState<string>(defaultDates.start)
  const [endDate, setEndDate] = useState<string>(defaultDates.end)
  const [revenuePeriod, setRevenuePeriod] = useState<TimePeriod>("DAY")

  // Dữ liệu thống kê
  const [revenueStats, setRevenueStats] = useState<RevenueStatistics | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null)
  const [userStats, setUserStats] = useState<UserStatistics | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Hàm tải toàn bộ số liệu thống kê từ API backend
  const fetchAllStatistics = useCallback(async () => {
    setLoading(true)

    const dateParams = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }

    try {
      const [revRes, orderRes, userRes] = await Promise.allSettled([
        statisticsService.getRevenueStatistics({
          period: revenuePeriod,
          ...dateParams,
        }),
        statisticsService.getOrderStatistics(dateParams),
        statisticsService.getUserStatistics({
          period: revenuePeriod,
          ...dateParams,
        }),
      ])

      let hasAnySuccess = false

      // 1. Doanh thu
      if (revRes.status === "fulfilled" && revRes.value?.data) {
        setRevenueStats(revRes.value.data)
        hasAnySuccess = true
      } else {
        const mockRev =
          revenuePeriod === "YEAR"
            ? MOCK_REVENUE_STATS_YEARLY
            : revenuePeriod === "MONTH"
            ? MOCK_REVENUE_STATS_MONTHLY
            : MOCK_REVENUE_STATS_DAILY
        setRevenueStats(mockRev)
      }

      // 2. Trạng thái đơn hàng
      if (orderRes.status === "fulfilled" && orderRes.value?.data) {
        setOrderStats(orderRes.value.data)
        hasAnySuccess = true
      } else {
        setOrderStats(MOCK_ORDER_STATS)
      }

      // 3. Người dùng
      if (userRes.status === "fulfilled" && userRes.value?.data) {
        setUserStats(userRes.value.data)
        hasAnySuccess = true
      } else {
        setUserStats(MOCK_USER_STATS)
      }

      setIsUsingFallback(!hasAnySuccess)
    } catch (err: any) {
      console.warn("Lỗi khi tải dữ liệu thống kê, sử dụng dữ liệu mẫu:", err)
      setIsUsingFallback(true)
      setRevenueStats(MOCK_REVENUE_STATS_DAILY)
      setOrderStats(MOCK_ORDER_STATS)
      setUserStats(MOCK_USER_STATS)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, revenuePeriod])

  useEffect(() => {
    fetchAllStatistics()
  }, [fetchAllStatistics])

  // Tự động reload khi có thông báo đặt hàng mới từ WebSocket
  useOrderRefreshOnNotification(() => {
    fetchAllStatistics()
  })

  // Đổi khoảng ngày từ bộ lọc
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Xuất file CSV báo cáo thống kê
  const handleExportCsv = () => {
    try {
      const rows: string[] = []
      rows.push("BÁO CÁO TỔNG QUAN DOANH THU & ĐƠN HÀNG TECHCRAFT")
      rows.push(`Thời gian kết xuất: ${new Date().toLocaleString("vi-VN")}`)
      rows.push(`Giai đoạn thống kê: Từ [${startDate || "Đầu"}] đến [${endDate || "Hiện tại"}]`)
      rows.push("")

      // Phần 1: Doanh thu theo timeline
      rows.push("--- 1. CHI TIẾT DOANH THU THEO THỜI GIAN ---")
      rows.push("Mốc thời gian,Nhãn,Doanh thu (VND),Số đơn hoàn thành")
      revenueStats?.timeline.forEach((pt) => {
        rows.push(`"${pt.date}","${pt.label}",${pt.revenue},${pt.orderCount}`)
      })
      rows.push("")

      // Phần 2: Phân bổ trạng thái đơn hàng
      rows.push("--- 2. CƠ CẤU TRẠNG THÁI ĐƠN HÀNG ---")
      rows.push("Mã trạng thái,Tên trạng thái,Số lượng đơn,Tỷ lệ (%)")
      orderStats?.breakdown.forEach((item) => {
        rows.push(`"${item.status}","${item.statusName}",${item.count},${item.percentage}%`)
      })

      // BOM utf-8 (\uFEFF) giúp Excel mở không bị lỗi font Tiếng Việt
      const csvContent = "\uFEFF" + rows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `TechCraft_ThongKe_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Đã xuất file báo cáo thống kê CSV thành công!")
    } catch (e: any) {
      toast.error("Không thể xuất file báo cáo: " + e?.message)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-blue-600" />
            Tổng Quan & Thống Kê Quản Trị
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi doanh thu bán linh kiện, tiến trình đơn hàng và tăng trưởng khách hàng
          </p>
        </div>
      </div>

      {/* Date Filter & Actions Toolbar */}
      <StatisticsDateFilter
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onRefresh={fetchAllStatistics}
        onExportCsv={handleExportCsv}
        loading={loading}
        isUsingFallback={isUsingFallback}
      />

      {/* 4 Stat Overview Cards */}
      <StatOverviewCards
        revenueStats={revenueStats}
        orderStats={orderStats}
        userStats={userStats}
        loading={loading}
      />

      {/* Row 2: Biểu đồ doanh thu toàn màn hình */}
      <div>
        <RevenueChart
          timeline={revenueStats?.timeline ?? []}
          currentPeriod={revenuePeriod}
          onPeriodChange={(period) => setRevenuePeriod(period)}
          loading={loading}
        />
      </div>

      {/* Row 3: Cơ cấu đơn hàng & Tăng trưởng người dùng (2 cột cân đối) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <OrderStatusCard orderStats={orderStats} loading={loading} />
        </div>

        <div>
          <UserGrowthCard userStats={userStats} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
