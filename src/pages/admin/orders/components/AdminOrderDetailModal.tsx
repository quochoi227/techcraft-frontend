import React, { useEffect, useState } from "react"
import {
  X,
  Package,
  Calendar,
  MapPin,
  Banknote,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Cpu,
  ChevronDown,
  Layers,
  User,
  Mail,
  Phone,
  FileText,
  Printer,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import type { Order, OrderStatus } from "@/types/order"
import {
  ORDER_STATUS_META,
  getNextValidStatuses,
  getNextRecommendedStatus,
  getStatusActionLabel,
} from "@/types/order"
import { CATEGORIES_META } from "@/pages/products/constants"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AdminOrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onRequestStatusChange: (order: Order, newStatus: OrderStatus) => void
  isSubmitting?: boolean
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

const formatVND = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) return "0 ₫"
  return `${price.toLocaleString("vi-VN")} ₫`
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onRequestStatusChange,
  isSubmitting = false,
}) => {
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false)
  const [expandedPcCases, setExpandedPcCases] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !order) return null

  const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.PENDING
  const isCancelled = order.status === "CANCELLED"
  const isDelivered = order.status === "DELIVERED"
  const nextRecommended = getNextRecommendedStatus(order.status)
  const validStatuses = getNextValidStatuses(order.status)

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    setCopiedOrderId(true)
    toast.success("Đã sao chép mã đơn hàng!")
    setTimeout(() => setCopiedOrderId(false), 2000)
  }

  const togglePcCaseDetails = (itemId: string) => {
    setExpandedPcCases((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const formattedCreatedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Vừa xong"

  const formattedUpdatedAt = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null

  const getStepStatus = (step: number) => {
    if (isCancelled) return "cancelled"
    const status = order.status
    if (step === 1) return "completed" // Created
    if (step === 2) {
      if (["CONFIRMED", "SHIPPING", "DELIVERED"].includes(status)) return "completed"
      return "current"
    }
    if (step === 3) {
      if (["SHIPPING", "DELIVERED"].includes(status)) return "completed"
      if (status === "CONFIRMED") return "current"
      return "upcoming"
    }
    if (step === 4) {
      if (status === "DELIVERED") return "completed"
      if (status === "SHIPPING") return "current"
      return "upcoming"
    }
    return "upcoming"
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Chi tiết đơn hàng quản trị
                </h2>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                  title="Sao chép toàn bộ UUID"
                >
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đặt lúc: {formattedCreatedAt}</span>
                </span>
                {formattedUpdatedAt && (
                  <span className="text-slate-300">• Cập nhật: {formattedUpdatedAt}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-2xs hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="In đơn hàng"
            >
              <Printer className="w-4 h-4" />
              <span>In đơn</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-200/80 shadow-2xs"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Admin Status Management Action Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Trạng thái hiện tại của đơn hàng
              </span>
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass} animate-pulse`} />
                  {statusMeta.label}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {statusMeta.description}
                </span>
              </div>
            </div>

            {/* Quick Status Action Buttons for Admin */}
            {!isCancelled && !isDelivered && (
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {nextRecommended && (
                  <Button
                    type="button"
                    onClick={() => onRequestStatusChange(order, nextRecommended)}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 px-4"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{getStatusActionLabel(nextRecommended)}</span>
                  </Button>
                )}

                {validStatuses.includes("CANCELLED") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onRequestStatusChange(order, "CANCELLED")}
                    disabled={isSubmitting}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-semibold"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    Hủy đơn
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Timeline Visualizer */}
          {!isCancelled ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-0" />

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(1) === "completed"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">1. Đặt hàng</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(2) === "completed"
                        ? "bg-blue-600 text-white shadow-xs"
                        : getStepStatus(2) === "current"
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {getStepStatus(2) === "completed" ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">2. Xác nhận</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(3) === "completed"
                        ? "bg-blue-600 text-white shadow-xs"
                        : getStepStatus(3) === "current"
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-300"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {getStepStatus(3) === "completed" ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">3. Vận chuyển</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(4) === "completed"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {getStepStatus(4) === "completed" ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">4. Đã giao</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Đơn hàng này đã bị hủy. Toàn bộ số lượng tồn kho của linh kiện đã được tự động hoàn lại vào kho.
              </span>
            </div>
          )}

          {/* Customer & Delivery Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Contact */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông tin khách hàng</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs">Họ và tên:</span>
                  <p className="font-bold text-slate-900">
                    {order.userFullName || "Chưa cập nhật tên"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{order.userEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{order.userPhone || "Chưa có số điện thoại"}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Method */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giao hàng & Thanh toán</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs">Địa chỉ nhận hàng:</span>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </div>
                {order.note && (
                  <div className="pt-1 text-slate-600 italic">
                    <span className="text-slate-400 font-medium not-italic text-xs flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Ghi chú từ khách:
                    </span>
                    <p className="mt-0.5">"{order.note}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Sản phẩm trong đơn ({order.items?.length || 0} món)</span>
              <span className="text-xs font-semibold text-slate-400">
                Tổng cộng: {order.totalQuantity || order.items?.reduce((s, i) => s + i.quantity, 0)} chiếc
              </span>
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl p-4 bg-white">
              {order.items?.map((item) => {
                const isPcCase = item.itemType === "PC_CASE" || !!item.pcCaseId
                const isExpanded = expandedPcCases[item.id] || false
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
                  : item.productName || item.product?.name || "Linh kiện máy tính"

                return (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
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

                        {/* Title & Info */}
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPcCase ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Cpu className="w-2.5 h-2.5" />
                                Cấu hình PC • {item.useCase || item.pcCase?.useCase || "Đa năng"}
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                                  categoryMeta?.badgeClass ||
                                  "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                {CategoryIcon && <CategoryIcon className="w-2.5 h-2.5" />}
                                {categoryMeta?.shortLabel || item.category || "Linh kiện"}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {title}
                          </h4>

                          <p className="text-xs text-slate-400">
                            {item.quantity} cái × {formatVND(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-black text-slate-900">
                          {formatVND(item.subtotal || item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>

                    {/* PC Case component breakdown */}
                    {isPcCase && item.pcCase?.items && item.pcCase.items.length > 0 && (
                      <div className="pl-16">
                        <button
                          type="button"
                          onClick={() => togglePcCaseDetails(item.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 transition-colors"
                        >
                          <Layers className="w-3 h-3" />
                          <span>
                            {isExpanded
                              ? "Thu gọn linh kiện dàn máy"
                              : `Xem ${item.pcCase.items.length} linh kiện cấu thành dàn máy`}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-2 bg-purple-50/50 rounded-xl p-3 border border-purple-100 text-xs space-y-1.5 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.pcCase.items.map((comp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-100/80 text-[11px]"
                                >
                                  <span className="font-bold text-purple-700 shrink-0">
                                    [{comp.category}]
                                  </span>
                                  <span className="text-slate-800 font-medium truncate">
                                    {comp.product?.name || `Linh kiện #${comp.productId}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold text-slate-800">
                {formatVND(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Phí giao hàng:</span>
              <span className="font-bold text-emerald-600">0 ₫ (Miễn phí)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-slate-800">COD (Thu tiền tận nơi)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-black text-slate-900">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-600 text-lg">
                {formatVND(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold"
          >
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </div>
  )
}
