import React, { useEffect } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { Voucher } from "@/types/voucher"
import { Button } from "@/components/ui/button"

interface VoucherDeleteModalProps {
  isOpen: boolean
  voucher: Voucher | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
  isDeleting?: boolean
}

export const VoucherDeleteModal: React.FC<VoucherDeleteModalProps> = ({
  isOpen,
  voucher,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !voucher) return null

  const hasUsage = (voucher.usedCount || 0) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-extrabold text-lg text-slate-900">
            Xác nhận xóa mã giảm giá?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Bạn có chắc chắn muốn xóa mã giảm giá{" "}
            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {voucher.code}
            </span>{" "}
            ({voucher.name})?
          </p>

          {hasUsage && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left">
              <strong>Lưu ý:</strong> Mã này đã có{" "}
              <strong>{voucher.usedCount} lượt sử dụng</strong> trong các đơn hàng trước đây.
              Hành động xóa vĩnh viễn có thể ảnh hưởng đến dữ liệu báo cáo lịch sử.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs font-bold rounded-xl h-11"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 rounded-xl h-11 shadow-sm"
            onClick={() => onConfirm(voucher.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <span>Xác nhận xóa</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
