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
  Ticket,
} from "lucide-react"
import type { Order } from "@/types/order"
import { ORDER_STATUS_META } from "@/types/order"
import { CATEGORIES_META, formatPrice } from "@/pages/products/constants"
import { getPcCaseThumbnail } from "@/pages/pc-cases/constants"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onCancelOrder: (order: Order) => void
  isCancelling?: boolean
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  isCancelling = false,
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
  const canCancel = order.status === "PENDING"

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

  // Format date time
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Vừa xong"

  // Order Timeline Steps
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

  const calculatedSubtotal =
    order.subtotalAmount ||
    (order.items?.reduce((s, i) => s + (i.subtotal || i.unitPrice * i.quantity), 0) ??
      order.totalAmount + (order.discountAmount || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
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
                  Chi tiết đơn hàng
                </h2>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                  title="Sao chép toàn bộ ID"
                >
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Đặt ngày {formattedDate}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-200/80 shadow-2xs"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Order Status Banner & Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass} animate-pulse`} />
                  {statusMeta.label}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {statusMeta.description}
              </span>
            </div>

            {/* Timeline Tracking */}
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
                    <span className="text-[11px] font-bold text-slate-800">Đặt hàng</span>
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
                    <span className="text-[11px] font-bold text-slate-800">Xác nhận</span>
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
                    <span className="text-[11px] font-bold text-slate-800">Vận chuyển</span>
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
                    <span className="text-[11px] font-bold text-slate-800">Thành công</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  Đơn hàng này đã bị hủy. Toàn bộ số lượng tồn kho của linh kiện và lượt dùng voucher đã được hoàn lại.
                </span>
              </div>
            )}
          </div>

          {/* Delivery & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Địa chỉ nhận hàng:</span>
              </span>
              <p className="font-semibold text-slate-800 leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phương thức thanh toán:</span>
              </span>
              <p className="font-bold text-slate-800">
                Thanh toán tiền mặt khi nhận hàng (COD)
              </p>
            </div>

            {order.voucherCode && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <Ticket className="w-4 h-4" />
                  <span>Mã giảm giá đã áp dụng:</span>
                  <span className="font-mono bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    {order.voucherCode}
                  </span>
                </div>
                {order.discountAmount !== undefined && order.discountAmount > 0 && (
                  <span className="text-xs font-black text-emerald-600">
                    -{formatPrice(order.discountAmount)}
                  </span>
                )}
              </div>
            )}

            {order.note && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 space-y-0.5">
                <span className="text-slate-400 font-medium">Ghi chú từ bạn:</span>
                <p className="font-medium text-slate-700 italic">"{order.note}"</p>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Danh sách sản phẩm trong đơn ({order.items?.length || 0} món)</span>
              <span className="text-xs font-semibold text-slate-400">
                Tổng số lượng: {order.totalQuantity || order.items?.reduce((s, i) => s + i.quantity, 0)} cái
              </span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => {
                const isPcCase = item.itemType === "PC_CASE" || !!item.pcCaseId
                const isExpanded = expandedPcCases[item.id] || false
                const categoryMeta =
                  !isPcCase && item.category ? CATEGORIES_META[item.category] : null
                const CategoryIcon = categoryMeta?.icon

                const displayImage = isPcCase
                  ? getPcCaseThumbnail(item.pcCase)
                  : item.productImage ||
                    item.product?.images?.[0]?.imageUrl ||
                    PLACEHOLDER_IMAGE

                const title = isPcCase
                  ? item.pcCaseName || item.pcCase?.name
                  : item.productName || item.product?.name || "Linh kiện"

                return (
                  <div key={item.id} className="py-3.5 space-y-2">
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

                        {/* Title & Specs */}
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
                            {item.quantity} cái × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-black text-slate-900">
                          {formatPrice(item.subtotal || item.unitPrice * item.quantity)}
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
                              ? "Thu gọn danh sách linh kiện"
                              : `Xem ${item.pcCase.items.length} linh kiện trong dàn máy`}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-2 bg-purple-50/50 rounded-xl p-2.5 border border-purple-100 text-xs space-y-1.5 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {item.pcCase.items.map((comp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-purple-100/80 text-[11px]"
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
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-bold text-slate-800">
                {formatPrice(calculatedSubtotal)}
              </span>
            </div>

            {order.discountAmount !== undefined && order.discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Giảm giá voucher ({order.voucherCode || "Ưu đãi"}):</span>
                </span>
                <span className="font-bold">
                  -{formatPrice(order.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>Phí vận chuyển toàn quốc:</span>
              <span className="font-bold text-emerald-600">Miễn phí 100%</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Hỗ trợ lắp đặt & kiểm tra:</span>
              <span className="font-bold text-emerald-600">Miễn phí</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-base">
              <span className="font-bold text-slate-800">Tổng thanh toán COD:</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            {canCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => onCancelOrder(order)}
                className="text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                Hủy đơn hàng này
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
