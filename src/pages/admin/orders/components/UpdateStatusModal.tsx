import React, { useState, useEffect } from "react"
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import type { Order, OrderStatus } from "@/types/order"
import {
  ORDER_STATUS_META,
  getNextValidStatuses,
  getStatusActionLabel,
} from "@/types/order"
import { Button } from "@/components/ui/button"

interface UpdateStatusModalProps {
  isOpen: boolean
  order: Order | null
  targetStatus?: OrderStatus | null
  onClose: () => void
  onConfirm: (orderId: string, newStatus: OrderStatus) => Promise<void>
  isSubmitting?: boolean
}

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  SHIPPING: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  order,
  targetStatus: initialTargetStatus,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)

  useEffect(() => {
    if (!order) return
    const validStatuses = getNextValidStatuses(order.status)
    if (initialTargetStatus && validStatuses.includes(initialTargetStatus)) {
      setSelectedStatus(initialTargetStatus)
    } else if (validStatuses.length > 0) {
      setSelectedStatus(validStatuses[0])
    } else {
      setSelectedStatus(null)
    }
  }, [order, initialTargetStatus, isOpen])

  if (!isOpen || !order) return null

  const validStatuses = getNextValidStatuses(order.status)
  const currentMeta = ORDER_STATUS_META[order.status]
  const CurrentIcon = STATUS_ICONS[order.status] || Clock

  const handleConfirm = async () => {
    if (!selectedStatus) return
    await onConfirm(order.id, selectedStatus)
  }

  const isCancelling = selectedStatus === "CANCELLED"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isCancelling ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isCancelling ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isCancelling ? "Xác nhận hủy đơn hàng" : "Cập nhật trạng thái đơn"}
              </h3>
              <p className="text-xs text-slate-400">
                Đơn hàng #{order.id.slice(0, 8).toUpperCase()} • {order.userFullName || order.userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-200/80 shadow-2xs disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Transition Visualizer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            {/* Current */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentMeta.badgeClass}`}
              >
                <CurrentIcon className="w-3.5 h-3.5" />
                {currentMeta.label}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Target */}
            <div className="flex items-center gap-2 min-w-0">
              {selectedStatus ? (
                (() => {
                  const targetMeta = ORDER_STATUS_META[selectedStatus]
                  const TargetIcon = STATUS_ICONS[selectedStatus]
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${targetMeta.badgeClass}`}
                    >
                      <TargetIcon className="w-3.5 h-3.5" />
                      {targetMeta.label}
                    </span>
                  )
                })()
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa chọn</span>
              )}
            </div>
          </div>

          {/* Valid Status Choices */}
          {validStatuses.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs text-center font-medium">
              Đơn hàng này đã kết thúc ({currentMeta.label}), không thể chuyển đổi trạng thái thêm.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Chọn trạng thái mới
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {validStatuses.map((status) => {
                  const meta = ORDER_STATUS_META[status]
                  const Icon = STATUS_ICONS[status]
                  const isChecked = selectedStatus === status
                  const isCancel = status === "CANCELLED"

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                        isChecked
                          ? isCancel
                            ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/30 text-rose-900"
                            : "bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/30 text-blue-900"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCancel ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold">
                            {getStatusActionLabel(status)} ({meta.label})
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{meta.description}</p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? isCancel
                              ? "border-rose-600 bg-rose-600 text-white"
                              : "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancellation Notice Alert */}
          {isCancelling && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Cảnh báo hoàn kho tự động:</span>
              </div>
              <p className="pl-6 text-[11px] leading-relaxed text-rose-700">
                Khi hủy đơn hàng này, Backend sẽ tự động cộng lại toàn bộ số lượng các linh kiện trong đơn vào tồn kho (`stock_quantity`). Hành động hủy đơn là cuối cùng và không thể hoàn tác!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl text-xs font-semibold"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedStatus || isSubmitting || validStatuses.length === 0}
            className={`rounded-xl text-xs font-bold px-5 ${
              isCancelling
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </span>
            ) : isCancelling ? (
              "Xác nhận hủy đơn"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
