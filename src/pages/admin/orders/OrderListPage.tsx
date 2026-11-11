import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Search,
  RotateCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  AlertTriangle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  PackageCheck,
  Cpu,
  Layers,
  SlidersHorizontal,
  Ticket,
} from "lucide-react"
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  AdminOrderFilterParams,
} from "@/types/order"
import {
  ORDER_STATUS_META,
  getNextValidStatuses,
  getNextRecommendedStatus,
  getStatusActionLabel,
} from "@/types/order"
import { MOCK_ADMIN_ORDERS, MOCK_ADMIN_ORDERS_PAGE } from "./mockData"
import { AdminOrderDetailModal } from "./components/AdminOrderDetailModal"
import { UpdateStatusModal } from "./components/UpdateStatusModal"
import { getPcCaseThumbnail } from "@/pages/pc-cases/constants"
import { orderService } from "@/services/api/orderService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const formatVND = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) return "0 ₫"
  return `${price.toLocaleString("vi-VN")} ₫`
}

interface StatusTabConfig {
  label: string
  value: OrderStatus | "ALL"
  icon: React.ElementType
}

const STATUS_TABS: StatusTabConfig[] = [
  { label: "Tất cả đơn hàng", value: "ALL", icon: ShoppingBag },
  { label: "Chờ xác nhận", value: "PENDING", icon: Clock },
  { label: "Đã xác nhận", value: "CONFIRMED", icon: CheckCircle2 },
  { label: "Đang giao hàng", value: "SHIPPING", icon: Truck },
  { label: "Đã giao thành công", value: "DELIVERED", icon: PackageCheck },
  { label: "Đã hủy", value: "CANCELLED", icon: XCircle },
]

export const OrderListPage: React.FC = () => {
  // Data State
  const [orders, setOrders] = useState<Order[]>(MOCK_ADMIN_ORDERS_PAGE.content)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Pagination (Spring Data JPA 0-based)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [pageSize] = useState<number>(10)
  const [totalElements, setTotalElements] = useState<number>(MOCK_ADMIN_ORDERS_PAGE.totalElements)
  const [totalPages, setTotalPages] = useState<number>(MOCK_ADMIN_ORDERS_PAGE.totalPages)

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "AMOUNT_DESC" | "AMOUNT_ASC">("NEWEST")

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Debounce search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(0)
    }, 400)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  /**
   * Gọi API GET /api/admin/orders
   */
  const fetchOrders = useCallback(
    async (pageToFetch: number = currentPage) => {
      setIsLoading(true)

      let apiSortBy: "createdAt" | "totalAmount" | "status" = "createdAt"
      let apiSortDir: "asc" | "desc" = "desc"

      switch (sortBy) {
        case "OLDEST":
          apiSortBy = "createdAt"
          apiSortDir = "asc"
          break
        case "AMOUNT_DESC":
          apiSortBy = "totalAmount"
          apiSortDir = "desc"
          break
        case "AMOUNT_ASC":
          apiSortBy = "totalAmount"
          apiSortDir = "asc"
          break
        case "NEWEST":
        default:
          apiSortBy = "createdAt"
          apiSortDir = "desc"
          break
      }

      const params: AdminOrderFilterParams = {
        page: pageToFetch,
        size: pageSize,
        status: statusFilter,
        search: debouncedSearch.trim() || undefined,
        paymentMethod: paymentFilter !== "ALL" ? paymentFilter : undefined,
        sortBy: apiSortBy,
        sortDir: apiSortDir,
      }

      try {
        const response = await orderService.getAllOrders(params)
        const pageData = response?.data || (response as any)

        if (pageData && Array.isArray(pageData.content)) {
          setOrders(pageData.content)
          setTotalElements(pageData.totalElements ?? pageData.content.length)
          setTotalPages(pageData.totalPages ?? 1)
          setCurrentPage(pageData.page ?? pageToFetch)
          setIsUsingFallback(false)
        } else {
          throw new Error("Phản hồi API đơn hàng không hợp lệ")
        }
      } catch (err: any) {
        console.warn(
          "Không thể kết nối đến API /api/admin/orders. Chuyển sang mock data dự phòng:",
          err?.message
        )
        setIsUsingFallback(true)

        // Lọc mock data cục bộ
        let filtered = [...MOCK_ADMIN_ORDERS]
        if (statusFilter !== "ALL") {
          filtered = filtered.filter((o) => o.status === statusFilter)
        }
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase().trim()
          filtered = filtered.filter((o) => {
            const matchId = o.id.toLowerCase().includes(q)
            const matchEmail = o.userEmail?.toLowerCase().includes(q)
            const matchName = o.userFullName?.toLowerCase().includes(q)
            const matchPhone = o.userPhone?.toLowerCase().includes(q)
            const matchAddress = o.shippingAddress?.toLowerCase().includes(q)
            const matchVoucher = o.voucherCode?.toLowerCase().includes(q)
            return matchId || matchEmail || matchName || matchPhone || matchAddress || matchVoucher
          })
        }
        if (paymentFilter !== "ALL") {
          filtered = filtered.filter((o) => o.paymentMethod === paymentFilter)
        }

        // Sắp xếp
        filtered.sort((a, b) => {
          if (sortBy === "AMOUNT_DESC") return b.totalAmount - a.totalAmount
          if (sortBy === "AMOUNT_ASC") return a.totalAmount - b.totalAmount
          if (sortBy === "OLDEST") {
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })

        setOrders(filtered)
        setTotalElements(filtered.length)
        setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)))
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, pageSize, statusFilter, paymentFilter, debouncedSearch, sortBy]
  )

  useEffect(() => {
    fetchOrders(currentPage)
  }, [fetchOrders, currentPage])

  // KPI Calculations
  const stats = useMemo(() => {
    const source = isUsingFallback ? MOCK_ADMIN_ORDERS : orders
    const total = source.length
    const pending = source.filter((o) => o.status === "PENDING").length
    const confirmed = source.filter((o) => o.status === "CONFIRMED").length
    const shipping = source.filter((o) => o.status === "SHIPPING").length
    const delivered = source.filter((o) => o.status === "DELIVERED").length
    const cancelled = source.filter((o) => o.status === "CANCELLED").length
    const revenue = source
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    return { total, pending, confirmed, shipping, delivered, cancelled, revenue }
  }, [orders, isUsingFallback])

  // Copy UUID
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success("Đã sao chép mã đơn hàng!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Open Detail Modal
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  // Open Update Status Modal
  const handleOpenUpdateModal = (order: Order, desiredStatus?: OrderStatus) => {
    setOrderToUpdate(order)
    setTargetStatus(desiredStatus || null)
    setIsUpdateModalOpen(true)
  }

  // Execute Status Update
  const handleConfirmStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true)
    try {
      if (isUsingFallback) {
        // Cập nhật mock state khi chạy offline
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null
          )
        }
        toast.success(`Đã cập nhật trạng thái đơn hàng sang ${ORDER_STATUS_META[newStatus].label}`)
      } else {
        const response = await orderService.updateOrderStatus(orderId, newStatus)
        const updated = response?.data || (response as any)
        toast.success(response?.message || "Cập nhật trạng thái đơn hàng thành công!")

        // Cập nhật lại list và selectedOrder
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updated, status: newStatus } : o))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...updated, status: newStatus } : null))
        }
      }

      setIsUpdateModalOpen(false)
      setOrderToUpdate(null)
    } catch (err: any) {
      console.error("Lỗi cập nhật trạng thái đơn:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleResetFilters = () => {
    setStatusFilter("ALL")
    setPaymentFilter("ALL")
    setSearchQuery("")
    setSortBy("NEWEST")
    setCurrentPage(0)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Quản lý đơn hàng</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {totalElements} đơn
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, kiểm tra chi tiết và điều phối trạng thái giao nhận đơn hàng trên toàn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage)}
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-10 px-4"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            <span className="font-semibold text-xs">Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* Fallback Notice Banner */}
      {isUsingFallback && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-800 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ dự phòng (Offline Mock):</strong> Không kết nối được Backend API hoặc đang khởi động server. Hệ thống đang hiển thị dữ liệu mẫu để bạn thử nghiệm trọn vẹn các thao tác.
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders(currentPage)}
            className="text-amber-900 underline font-semibold shrink-0 hover:text-amber-950"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng đơn hàng</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400">Toàn bộ đơn phát sinh</p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => {
            setStatusFilter("PENDING")
            setCurrentPage(0)
          }}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${
            statusFilter === "PENDING"
              ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20"
              : "border-slate-200/80 hover:border-amber-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Chờ xác nhận</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
            <span>{stats.pending}</span>
            {stats.pending > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                Cần xử lý
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Đơn mới chưa tiếp nhận</p>
        </div>

        {/* Shipping Orders */}
        <div
          onClick={() => {
            setStatusFilter("SHIPPING")
            setCurrentPage(0)
          }}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${
            statusFilter === "SHIPPING"
              ? "border-purple-400 ring-2 ring-purple-400/20 bg-purple-50/20"
              : "border-slate-200/80 hover:border-purple-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold uppercase tracking-wider">Đang giao hàng</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{stats.shipping}</div>
          <p className="text-[11px] text-slate-400">Đang trên đường giao</p>
        </div>

        {/* Delivered Orders */}
        <div
          onClick={() => {
            setStatusFilter("DELIVERED")
            setCurrentPage(0)
          }}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${
            statusFilter === "DELIVERED"
              ? "border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20"
              : "border-slate-200/80 hover:border-emerald-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Đã hoàn tất</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.delivered}</div>
          <p className="text-[11px] text-slate-400">Giao thành công & thu tiền</p>
        </div>

        {/* Revenue */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh số đơn</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black truncate">{formatVND(stats.revenue)}</div>
          <p className="text-[11px] text-blue-200 truncate">Tổng giá trị đơn khả dụng</p>
        </div>
      </div>

      {/* Main Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value)
                  setCurrentPage(0)
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter Toolbar: Search, Sort, Payment Method */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="relative lg:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo Mã đơn, Mã voucher, Khách hàng, Email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <div className="lg:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as any)
                setCurrentPage(0)
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="COD">Thanh toán khi nhận (COD)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any)
                  setCurrentPage(0)
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEWEST">Ngày đặt: Mới nhất trước</option>
                <option value="OLDEST">Ngày đặt: Cũ nhất trước</option>
                <option value="AMOUNT_DESC">Giá trị đơn: Cao xuống thấp</option>
                <option value="AMOUNT_ASC">Giá trị đơn: Thấp lên cao</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="h-10 w-full lg:w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center p-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 rounded-lg w-1/4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy đơn hàng nào
              </h3>
              <p className="text-xs text-slate-500">
                Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc trạng thái bạn đang chọn.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl text-xs font-semibold"
            >
              Xóa bộ lọc tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã đơn</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Mặt hàng</th>
                  <th className="py-3.5 px-4">Tổng tiền</th>
                  <th className="py-3.5 px-4">Thanh toán</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((order) => {
                  const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.PENDING
                  const nextRecommended = getNextRecommendedStatus(order.status)
                  const validStatuses = getNextValidStatuses(order.status)
                  const hasPcCase = order.items?.some(
                    (i) => i.itemType === "PC_CASE" || !!i.pcCaseId
                  )

                  const formattedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleViewDetail(order)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(order.id, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                            title="Sao chép toàn bộ UUID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 truncate">
                            {order.userFullName || "Khách vãng lai"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {order.userEmail}
                          </p>
                          {order.userPhone && (
                            <p className="text-[11px] text-slate-500 font-mono">
                              {order.userPhone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{formattedDate}</span>
                      </td>

                      {/* Items Summary */}
                      <td className="py-4 px-4 min-w-[170px]">
                        {(() => {
                          const pcCaseItem = order.items?.find((i) => i.itemType === "PC_CASE" || !!i.pcCaseId)
                          const firstItem = pcCaseItem || order.items?.[0]
                          const isPc = firstItem?.itemType === "PC_CASE" || !!firstItem?.pcCaseId
                          const thumbImg = isPc
                            ? getPcCaseThumbnail(firstItem?.pcCase)
                            : firstItem?.productImage || firstItem?.product?.images?.[0]?.imageUrl

                          return (
                            <div className="flex items-center gap-2.5">
                              {thumbImg ? (
                                <div className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/90 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                  <img
                                    src={thumbImg}
                                    alt="Thumbnail"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      ;(e.target as HTMLElement).style.display = "none"
                                    }}
                                  />
                                  {hasPcCase && (
                                    <span className="absolute top-0.5 left-0.5 text-[8px] font-extrabold bg-purple-600 text-white px-1 rounded leading-tight">
                                      PC
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                  {hasPcCase ? (
                                    <Cpu className="w-4 h-4 text-purple-600" />
                                  ) : (
                                    <Layers className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-800">
                                  {order.items?.length || 0} mục
                                </span>
                                <span className="text-slate-400 text-[11px] block">
                                  Tổng: {order.totalQuantity || order.items?.reduce((s, i) => s + i.quantity, 0)} cái
                                </span>
                              </div>
                            </div>
                          )
                        })()}
                      </td>

                      {/* Total Amount + Voucher Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="font-black text-slate-900 text-sm block">
                            {formatVND(order.totalAmount)}
                          </span>
                          {order.voucherCode && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Ticket className="w-2.5 h-2.5" />
                              <span>{order.voucherCode}</span>
                              {order.discountAmount !== undefined && order.discountAmount > 0 && (
                                <span className="font-semibold">(-{formatVND(order.discountAmount)})</span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {order.paymentMethod || "COD"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusMeta.dotClass} animate-pulse`}
                          />
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td
                        className="py-4 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Next Transition Button */}
                          {nextRecommended && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenUpdateModal(order, nextRecommended)}
                              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs"
                            >
                              {getStatusActionLabel(nextRecommended)}
                            </Button>
                          )}

                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => handleViewDetail(order)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Cancel Button */}
                          {validStatuses.includes("CANCELLED") && (
                            <button
                              type="button"
                              onClick={() => handleOpenUpdateModal(order, "CANCELLED")}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Hủy đơn hàng"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Hiển thị trang <strong className="text-slate-800">{currentPage + 1}</strong> trên{" "}
              <strong className="text-slate-800">{totalPages}</strong> ({totalElements} đơn)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </Button>

              {[...Array(totalPages)].map((_, idx) => {
                if (
                  idx === 0 ||
                  idx === totalPages - 1 ||
                  (idx >= currentPage - 1 && idx <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                        currentPage === idx
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                }
                if (idx === currentPage - 2 || idx === currentPage + 2) {
                  return (
                    <span key={idx} className="px-1 text-slate-400 text-xs">
                      ...
                    </span>
                  )
                }
                return null
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || isLoading}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold"
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Order Detail Modal */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedOrder(null)
        }}
        onRequestStatusChange={(order, status) => {
          handleOpenUpdateModal(order, status)
        }}
        isSubmitting={isUpdatingStatus}
      />

      {/* Update Status Confirmation Modal */}
      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        order={orderToUpdate}
        targetStatus={targetStatus}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setOrderToUpdate(null)
          setTargetStatus(null)
        }}
        onConfirm={handleConfirmStatusUpdate}
        isSubmitting={isUpdatingStatus}
      />
    </div>
  )
}

export default OrderListPage
