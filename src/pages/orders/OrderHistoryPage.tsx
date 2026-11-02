import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  Search,
  Calendar,
  MapPin,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Home,
  Copy,
  Check,
  Eye,
  Loader2,
  Box,
  Cpu,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useCheckoutStore } from "@/stores/checkoutStore"
import { orderService } from "@/services/api/orderService"
import { formatPrice, CATEGORIES_META } from "@/pages/products/constants"
import type { Order, OrderStatus, CheckoutItem } from "@/types/order"
import { ORDER_STATUS_META } from "@/types/order"
import { Button } from "@/components/ui/button"
import { OrderDetailModal } from "./components/OrderDetailModal"
import { toast } from "sonner"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

const STATUS_TABS: Array<{ id: OrderStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "CONFIRMED", label: "Đã xác nhận" },
  { id: "SHIPPING", label: "Đang giao hàng" },
  { id: "DELIVERED", label: "Đã giao thành công" },
  { id: "CANCELLED", label: "Đã hủy" },
]

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const setCheckoutItems = useCheckoutStore((state) => state.setCheckoutItems)

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Pagination
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalElements, setTotalElements] = useState<number>(0)

  // Modals & Action States
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Redirect if guest
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn!")
      navigate("/login?redirect=/orders", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await orderService.getUserOrders({
        status: activeTab === "ALL" ? undefined : activeTab,
        page,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc",
      })

      const pageData = response?.data || response
      if (pageData && Array.isArray((pageData as any).content)) {
        setOrders((pageData as any).content)
        setTotalPages((pageData as any).totalPages || 1)
        setTotalElements((pageData as any).totalElements || 0)
      } else {
        setOrders([])
        setTotalPages(1)
        setTotalElements(0)
      }
    } catch (err: any) {
      console.warn("Lỗi khi tải lịch sử đơn hàng:", err?.message)
      toast.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại!")
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, activeTab, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success("Đã sao chép mã đơn hàng!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return

    setCancellingOrderId(orderToCancel.id)
    try {
      await orderService.cancelOrder(orderToCancel.id)
      toast.success(`Đã hủy thành công đơn hàng #${orderToCancel.id.slice(0, 8).toUpperCase()}`)
      setOrderToCancel(null)
      if (selectedOrderForDetail?.id === orderToCancel.id) {
        setSelectedOrderForDetail(null)
      }
      // Reload order list
      await fetchOrders()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể hủy đơn hàng"
      toast.error(msg)
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Handle Re-order: load items into checkout and navigate
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("Không có thông tin sản phẩm để đặt lại")
      return
    }

    const checkoutItems: CheckoutItem[] = order.items.map((item) => {
      const isPcCase = item.itemType === "PC_CASE" || !!item.pcCaseId
      return {
        itemType: isPcCase ? "PC_CASE" : "PRODUCT",
        productId: item.productId,
        productName: item.productName || item.product?.name,
        productPrice: item.unitPrice,
        productImage: item.productImage || item.product?.images?.[0]?.imageUrl || PLACEHOLDER_IMAGE,
        category: item.category || item.product?.category,
        product: item.product,
        pcCaseId: item.pcCaseId,
        pcCaseName: item.pcCaseName || item.pcCase?.name,
        useCase: item.useCase || item.pcCase?.useCase,
        pcCase: item.pcCase,
        unitPrice: item.unitPrice,
        quantity: item.quantity || 1,
      }
    })

    setCheckoutItems(checkoutItems)
    toast.success("Đã chuyển các món trong đơn sang trang đặt hàng!")
    navigate("/checkout")
  }

  // Filter orders by local search query if provided
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const query = searchQuery.toLowerCase().trim()
    return orders.filter((order) => {
      const matchId = order.id.toLowerCase().includes(query)
      const matchAddress = (order.shippingAddress || "").toLowerCase().includes(query)
      const matchItem = (order.items || []).some(
        (i) =>
          (i.productName || i.product?.name || "").toLowerCase().includes(query) ||
          (i.pcCaseName || i.pcCase?.name || "").toLowerCase().includes(query)
      )
      return matchId || matchAddress || matchItem
    })
  }, [orders, searchQuery])

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-20">
      {/* 1. Header Banner & Breadcrumbs */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-transparent border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Lịch sử đơn hàng</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Lịch sử đơn hàng của bạn
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Theo dõi tiến trình xử lý, kiểm tra thông tin chi tiết và quản lý các đơn hàng đã mua.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                <Link to="/products">
                  <Box className="w-4 h-4" />
                  <span>Mua thêm linh kiện</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Status Filter Tabs & Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setPage(0)
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Box & Quick Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc tên linh kiện..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Tổng số đơn: <strong className="text-slate-900">{totalElements}</strong> đơn hàng
            </div>
          </div>
        </div>

        {/* 3. Orders List */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="h-5 w-48 bg-slate-200 rounded" />
                  <div className="h-6 w-28 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="h-14 w-full bg-slate-100 rounded-xl" />
                  <div className="h-14 w-full bg-slate-100 rounded-xl" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-extrabold text-lg text-slate-900">
                {searchQuery ? "Không tìm thấy đơn hàng phù hợp" : "Bạn chưa có đơn hàng nào"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {searchQuery
                  ? "Vui lòng thử tìm kiếm lại với mã đơn hàng hoặc từ khóa khác."
                  : "Khám phá ngay hàng trăm linh kiện máy tính chính hãng và các bộ PC tối ưu tại TechCraft!"}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs"
              >
                <Link to="/products">
                  <Box className="w-4 h-4" />
                  <span>Mua sắm linh kiện ngay</span>
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold gap-2 text-xs"
              >
                <Link to="/pc-cases">
                  <Cpu className="w-4 h-4" />
                  <span>Xem cấu hình PC</span>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* List of Order Cards */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.PENDING
              const canCancel = order.status === "PENDING"
              const isCopied = copiedId === order.id

              const formattedOrderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Gần đây"

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Card Header: Order ID, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">Mã đơn:</span>
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(order.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                        title="Sao chép toàn bộ mã đơn"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedOrderDate}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Items Preview */}
                  <div className="divide-y divide-slate-100/80">
                    {(order.items || []).map((item, idx) => {
                      const isPcCase = item.itemType === "PC_CASE" || !!item.pcCaseId
                      const categoryMeta =
                        !isPcCase && item.category ? CATEGORIES_META[item.category] : null
                      const CategoryIcon = categoryMeta?.icon

                      const displayImage = isPcCase
                        ? "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"
                        : item.productImage ||
                          item.product?.images?.[0]?.imageUrl ||
                          PLACEHOLDER_IMAGE

                      const title = isPcCase
                        ? item.pcCaseName || item.pcCase?.name
                        : item.productName || item.product?.name || "Linh kiện"

                      return (
                        <div
                          key={item.id || idx}
                          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={displayImage}
                                alt={title}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                                }}
                              />
                              {isPcCase && (
                                <span className="absolute top-0.5 left-0.5 text-[8px] font-extrabold bg-purple-600 text-white px-1 rounded">
                                  PC
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {isPcCase ? (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                    Cấu hình PC • {item.useCase || "Đa năng"}
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                      categoryMeta?.badgeClass ||
                                      "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    {CategoryIcon && <CategoryIcon className="w-2.5 h-2.5 inline mr-1" />}
                                    {categoryMeta?.shortLabel || item.category || "Linh kiện"}
                                  </span>
                                )}
                              </div>

                              <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                                {title}
                              </p>

                              <p className="text-xs text-slate-400">
                                Số lượng: <strong className="text-slate-700">{item.quantity}</strong> × {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs sm:text-sm font-black text-slate-900">
                              {formatPrice(item.subtotal || item.unitPrice * item.quantity)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Card Footer: Address, Total & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-md">{order.shippingAddress}</span>
                      </div>
                      <div className="text-slate-400">
                        Thanh toán khi nhận hàng (COD) • Miễn phí vận chuyển toàn quốc
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Tổng thanh toán
                        </div>
                        <div className="text-base sm:text-lg font-black text-blue-600">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canCancel && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={cancellingOrderId === order.id}
                            onClick={() => setOrderToCancel(order)}
                            className="text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9"
                          >
                            Hủy đơn
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5 h-9"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 h-9 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Mua lại</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0 || isLoading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-xs font-bold"
            >
              Trang trước
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="text-xs font-bold"
            >
              Trang sau
            </Button>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        isOpen={Boolean(selectedOrderForDetail)}
        onClose={() => setSelectedOrderForDetail(null)}
        onCancelOrder={(ord) => {
          setOrderToCancel(ord)
        }}
        isCancelling={Boolean(cancellingOrderId)}
      />

      {/* Cancel Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Xác nhận hủy đơn hàng?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn hủy đơn hàng{" "}
                <strong className="text-slate-800 font-mono">
                  #{orderToCancel.id.slice(0, 8).toUpperCase()}
                </strong>{" "}
                với tổng thanh toán{" "}
                <strong className="text-blue-600">
                  {formatPrice(orderToCancel.totalAmount)}
                </strong>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs font-bold"
                onClick={() => setOrderToCancel(null)}
                disabled={Boolean(cancellingOrderId)}
              >
                Giữ lại đơn hàng
              </Button>
              <Button
                type="button"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2"
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingOrderId)}
              >
                {cancellingOrderId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
