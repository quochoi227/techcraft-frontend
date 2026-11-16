import React from "react"
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import type { OrderStatistics, RevenueStatistics, UserStatistics } from "@/types/statistics"

const formatVND = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫"
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`
}

interface StatOverviewCardsProps {
  revenueStats: RevenueStatistics | null
  orderStats: OrderStatistics | null
  userStats: UserStatistics | null
  loading?: boolean
}

export const StatOverviewCards: React.FC<StatOverviewCardsProps> = ({
  revenueStats,
  orderStats,
  userStats,
  loading = false,
}) => {
  // Tính tỷ lệ đơn giao thành công
  const deliverySuccessRate =
    orderStats && orderStats.totalOrders > 0
      ? Math.round((orderStats.deliveredCount / orderStats.totalOrders) * 100 * 10) / 10
      : 0

  // Tính tỷ lệ user đã xác thực email
  const verifiedRate =
    userStats && userStats.totalUsers > 0
      ? Math.round((userStats.verifiedUsers / userStats.totalUsers) * 100 * 10) / 10
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Doanh thu thực tế (Từ các đơn ĐÃ GIAO) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tổng Doanh Thu
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4"></div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatVND(revenueStats?.totalRevenue ?? 0)}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              {revenueStats?.totalOrders ?? 0} đơn
            </span>
            <span>đã giao thành công</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      </div>

      {/* 2. Giá trị đơn hàng trung bình (AOV) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Giá Trị Đơn TB (AOV)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4"></div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatVND(revenueStats?.averageOrderValue ?? 0)}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Trung bình trên mỗi đơn hàng thành công</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      </div>

      {/* 3. Tổng đơn hàng & Tỷ lệ giao thành công */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tổng Đơn Hàng
          </span>
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/2"></div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {orderStats?.totalOrders ?? 0}{" "}
              <span className="text-sm font-normal text-slate-500">đơn</span>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              {deliverySuccessRate}% giao đạt
            </span>
            {orderStats && orderStats.pendingCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                <AlertCircle className="w-3 h-3" />
                {orderStats.pendingCount} chờ duyệt
              </span>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
      </div>

      {/* 4. Khách hàng & Thành viên */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Người Dùng Hệ Thống
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/2"></div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {userStats?.totalUsers ?? 0}{" "}
              <span className="text-sm font-normal text-slate-500">tài khoản</span>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
              +{userStats?.newUsersInPeriod ?? 0} mới
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">{verifiedRate}% đã xác thực</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
      </div>
    </div>
  )
}
