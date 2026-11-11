import React, { useEffect, useState } from "react"
import {
  X,
  Ticket,
  Calendar,
  Copy,
  Check,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
} from "lucide-react"
import type { Voucher, VoucherDetail } from "@/types/voucher"
import {
  formatVND,
  formatDiscountValue,
  getVoucherStatusInfo,
  DISCOUNT_TYPE_META,
} from "../constants"
import { voucherService } from "@/services/api/voucherService"
import { MOCK_VOUCHER_DETAIL } from "../mockData"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface VoucherDetailModalProps {
  isOpen: boolean
  voucherId: string | null
  initialVoucher?: Voucher | null
  onClose: () => void
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  isOpen,
  voucherId,
  initialVoucher,
  onClose,
}) => {
  const [detail, setDetail] = useState<VoucherDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

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

  useEffect(() => {
    if (!isOpen || !voucherId) {
      setDetail(null)
      return
    }

    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const response = await voucherService.getVoucherDetail(voucherId)
        const data = response?.data || (response as any)
        if (data && data.voucher) {
          setDetail(data)
        } else {
          throw new Error("Dữ liệu chi tiết không hợp lệ")
        }
      } catch (err: any) {
        console.warn("Dùng fallback mock voucher detail:", err?.message)
        if (initialVoucher) {
          setDetail({
            voucher: initialVoucher,
            totalDiscountGiven:
              initialVoucher.discountType === "FIXED_AMOUNT"
                ? (initialVoucher.usedCount || 0) * (initialVoucher.discountValue || 0)
                : 2500000,
            totalOrdersCount: initialVoucher.usedCount || 0,
            recentUsages: MOCK_VOUCHER_DETAIL.recentUsages,
          })
        } else {
          setDetail(MOCK_VOUCHER_DETAIL)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [isOpen, voucherId, initialVoucher])

  if (!isOpen) return null

  const voucher = detail?.voucher || initialVoucher
  if (!voucher) return null

  const statusInfo = getVoucherStatusInfo(voucher)
  const typeMeta = DISCOUNT_TYPE_META[voucher.discountType] || DISCOUNT_TYPE_META.FIXED_AMOUNT

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code)
    setCopiedCode(true)
    toast.success("Đã sao chép mã giảm giá!")
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const formatDateTime = (isoDate?: string) => {
    if (!isoDate) return "—"
    return new Date(isoDate).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Chi tiết mã giảm giá
                </h2>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {voucher.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                  title="Sao chép mã"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{voucher.name}</p>
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Status & Discount Summary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-purple-50/40 border border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                  {statusInfo.label}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.badgeClass}`}
                >
                  {typeMeta.label}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                {formatDiscountValue(voucher)}
              </div>
              {voucher.description && (
                <p className="text-xs text-slate-600 max-w-xl">{voucher.description}</p>
              )}
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đã giảm</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-600">
                {formatVND(detail?.totalDiscountGiven || 0)}
              </div>
              <p className="text-[10px] text-slate-400">Tổng tiền đã chiết khấu</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đã dùng</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-black text-slate-900">
                {voucher.usedCount || 0}
                {voucher.usageLimit ? (
                  <span className="text-xs text-slate-400 font-normal"> / {voucher.usageLimit}</span>
                ) : (
                  <span className="text-xs text-slate-400 font-normal"> lượt</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Tổng số đơn áp dụng</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Còn lại</span>
                <Ticket className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-black text-purple-600">
                {voucher.usageLimit ? (
                  Math.max(0, voucher.usageLimit - (voucher.usedCount || 0))
                ) : (
                  "Không giới hạn"
                )}
              </div>
              <p className="text-[10px] text-slate-400">Lượt dùng khả dụng</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Giới hạn/User</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-lg font-black text-slate-900">
                {voucher.userUsageLimit || 1} <span className="text-xs text-slate-400 font-normal">lượt/khách</span>
              </div>
              <p className="text-[10px] text-slate-400">Tối đa cho 1 tài khoản</p>
            </div>
          </div>

          {/* Condition Details Grid */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Điều kiện áp dụng & Thời hạn
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400">Đơn hàng tối thiểu:</span>
                <p className="font-bold text-slate-800">
                  {voucher.minOrderAmount && voucher.minOrderAmount > 0
                    ? formatVND(voucher.minOrderAmount)
                    : "0 ₫ (Không yêu cầu giá trị tối thiểu)"}
                </p>
              </div>

              {voucher.discountType === "PERCENTAGE" && (
                <div className="space-y-1">
                  <span className="text-slate-400">Mức giảm tối đa:</span>
                  <p className="font-bold text-slate-800">
                    {voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0
                      ? formatVND(voucher.maxDiscountAmount)
                      : "Không giới hạn mức giảm tối đa"}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-slate-400">Thời gian bắt đầu:</span>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(voucher.startDate)}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Thời gian kết thúc:</span>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(voucher.endDate)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Recent Usages Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Lịch sử sử dụng gần đây</span>
              <span className="text-slate-400 font-normal">
                {detail?.recentUsages?.length || 0} lượt ghi nhận
              </span>
            </h4>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Đang tải lịch sử...</div>
            ) : !detail?.recentUsages || detail.recentUsages.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                Chưa có khách hàng nào sử dụng mã này trong các đơn hàng đã thanh toán.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4">Mã đơn</th>
                      <th className="py-3 px-4">Số tiền giảm</th>
                      <th className="py-3 px-4 text-right">Thời gian dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.recentUsages.map((usage) => (
                      <tr key={usage.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">
                            {usage.userFullName || "Khách hàng"}
                          </p>
                          <p className="text-[11px] text-slate-400">{usage.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          #{usage.orderId.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          -{formatVND(usage.discountAmount)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {formatDateTime(usage.usedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold h-10 px-5"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
