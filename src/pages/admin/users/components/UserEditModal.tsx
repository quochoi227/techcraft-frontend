import React, { useState, useEffect } from "react"
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  Loader2,
  Check,
  AlertCircle,
  Lock,
} from "lucide-react"
import type { User, UserRole, AdminUpdateUserPayload } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface UserEditModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, payload: AdminUpdateUserPayload) => Promise<boolean | void>
  currentAdminId?: string
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  currentAdminId,
}) => {
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [role, setRole] = useState<UserRole>("USER")
  const [active, setActive] = useState<boolean>(true)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isSelf = Boolean(user && currentAdminId && user.id === currentAdminId)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
      setRole(user.role || "USER")
      setActive(user.active !== false)
      setEmailVerified(Boolean(user.emailVerified))
      setErrors({})
    }
  }, [user])

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống"
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = "Họ và tên tối đa 100 ký tự"
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Định dạng email không hợp lệ"
      }
    }

    if (phone.trim()) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin chưa hợp lệ")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: AdminUpdateUserPayload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        role: isSelf ? undefined : role,
        active: isSelf ? undefined : active,
        emailVerified,
      }

      await onSave(user.id, payload)
      onClose()
    } catch {
      // toast is handled in parent or API interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedCreated = user.createdAt
    ? new Date(user.createdAt).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Không rõ"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-2xs">
              {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Chỉnh sửa người dùng
                </h3>
                {isSelf && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Tài khoản của bạn
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mã tài khoản: <span className="font-mono">{user.id}</span>
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-fullName"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Họ và tên <span className="text-rose-500">*</span>
                </span>
              </Label>
              <Input
                id="edit-fullName"
                type="text"
                placeholder="Nhập họ và tên..."
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) {
                    setErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.fullName
                      return updated
                    })
                  }
                }}
                className={`h-11 rounded-xl text-sm ${
                  errors.fullName ? "border-rose-400 focus:ring-rose-200" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-email"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.email
                      return updated
                    })
                  }
                }}
                className={`h-11 rounded-xl text-sm ${
                  errors.email ? "border-rose-400 focus:ring-rose-200" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-phone"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại</span>
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) {
                    setErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.phone
                      return updated
                    })
                  }
                }}
                className={`h-11 rounded-xl text-sm ${
                  errors.phone ? "border-rose-400 focus:ring-rose-200" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-role"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Phân quyền vai trò</span>
              </Label>
              <select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting || isSelf}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="USER">USER (Khách hàng thông thường)</option>
                <option value="ADMIN">ADMIN (Quản trị viên toàn quyền)</option>
              </select>
              {isSelf && (
                <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Không thể tự thay đổi vai trò của chính bạn</span>
                </p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label
                htmlFor="edit-address"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Địa chỉ nhận hàng</span>
              </Label>
              <Input
                id="edit-address"
                type="text"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 rounded-xl text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Account Status Flags */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trạng thái & Xác thực tài khoản
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Active Toggle Card */}
              <label
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  active
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-rose-50/40 border-rose-200"
                } ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <Checkbox
                  checked={active}
                  disabled={isSubmitting || isSelf}
                  onCheckedChange={(checked) => setActive(Boolean(checked))}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Trạng thái hoạt động</span>
                    {active ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                        Đã khóa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isSelf
                      ? "Không thể tự vô hiệu hóa tài khoản của chính mình."
                      : active
                      ? "Người dùng có thể đăng nhập và đặt hàng."
                      : "Người dùng bị chặn đăng nhập và thu hồi token."}
                  </p>
                </div>
              </label>

              {/* Email Verified Card */}
              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={emailVerified}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) => setEmailVerified(Boolean(checked))}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Xác thực email</span>
                    {emailVerified ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                        Chưa xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Đánh dấu tài khoản đã hoàn tất xác nhận liên kết qua email.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Account Metadata */}
          <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày đăng ký tài khoản: {formattedCreated}</span>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
