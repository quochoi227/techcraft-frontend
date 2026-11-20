import React, { useEffect } from "react"
import {
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Loader2,
  ShieldAlert,
} from "lucide-react"
import type { User } from "@/types/auth"
import { Button } from "@/components/ui/button"

interface UserStatusModalProps {
  user: User | null
  nextStatus: boolean
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isSubmitting?: boolean
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  user,
  nextStatus,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
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

  if (!isOpen || !user) return null

  const isLocking = !nextStatus

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isLocking
                ? "bg-rose-50 text-rose-600 shadow-inner"
                : "bg-emerald-50 text-emerald-600 shadow-inner"
            }`}
          >
            {isLocking ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-lg text-slate-900">
            {isLocking ? "Vô hiệu hóa tài khoản này?" : "Mở khóa tài khoản này?"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Bạn đang yêu cầu {isLocking ? "khóa" : "mở khóa"} người dùng{" "}
            <strong className="text-slate-900 font-semibold">
              {user.fullName || user.email}
            </strong>{" "}
            ({user.email}).
          </p>

          {isLocking ? (
            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Khi bị khóa, tài khoản này sẽ bị thu hồi toàn bộ phiên đăng nhập (Refresh Tokens)
                và không thể đăng nhập vào hệ thống TechCraft cho đến khi được mở lại.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Sau khi mở khóa, người dùng có thể đăng nhập bình thường vào hệ thống để mua sắm.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs font-bold"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className={`flex-1 text-xs font-bold gap-2 ${
              isLocking
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : isLocking ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Xác nhận khóa</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Xác nhận mở</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
