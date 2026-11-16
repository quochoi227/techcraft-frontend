import React, { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/api/authService"

// Schema validate form đặt lại mật khẩu (tối thiểu 6 ký tự theo backend)
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu mới" })
      .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận lại mật khẩu mới" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu mới",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(4)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPasswordValue = watch("newPassword", "")
  const isLengthValid = newPasswordValue.length >= 6
  const confirmPasswordValue = watch("confirmPassword", "")
  const isMatch = Boolean(
    newPasswordValue && confirmPasswordValue && newPasswordValue === confirmPasswordValue
  )

  // Kiểm tra token có tồn tại trên URL hay không
  useEffect(() => {
    if (!token || !token.trim()) {
      setTokenError("Liên kết không hợp lệ hoặc thiếu mã token đặt lại mật khẩu.")
    }
  }, [token])

  // Đếm ngược tự động chuyển hướng về trang đăng nhập khi thành công
  useEffect(() => {
    if (!isSuccess) return

    if (countdown <= 0) {
      navigate("/login", {
        replace: true,
        state: { passwordReset: true },
      })
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isSuccess, countdown, navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !token.trim()) {
      setTokenError("Mã token không hợp lệ hoặc đã bị thiếu.")
      return
    }

    setIsLoading(true)
    setTokenError(null)

    try {
      const response = await authService.resetPassword({
        token: token.trim(),
        newPassword: data.newPassword,
      })

      const successMsg =
        response?.message ||
        "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới."

      setIsSuccess(true)
      toast.success(successMsg, { id: "reset-password-success" })
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Đặt lại mật khẩu thất bại. Mã đặt lại có thể đã hết hạn hoặc đã được sử dụng."

      // Nếu lỗi liên quan đến token hết hạn hoặc không hợp lệ
      if (
        errorMsg.toLowerCase().includes("token") ||
        errorMsg.toLowerCase().includes("hết hạn") ||
        errorMsg.toLowerCase().includes("không tồn tại") ||
        errorMsg.toLowerCase().includes("đã được sử dụng")
      ) {
        setTokenError(errorMsg)
      }

      toast.error(errorMsg, { id: "reset-password-error" })
    } finally {
      setIsLoading(false)
    }
  }

  // Trường hợp 1: Mã token bị lỗi / hết hạn / không tồn tại
  if (tokenError) {
    return (
      <div className="flex-1 py-14 px-4 sm:px-6 flex flex-col justify-center items-center bg-slate-50/50">
        <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Liên kết không hợp lệ hoặc đã hết hạn
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            {tokenError}
          </p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm gap-2"
            >
              <Link to="/forgot-password">
                <RotateCcw className="w-4 h-4" />
                <span>Gửi lại yêu cầu đặt lại mật khẩu</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm"
            >
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Trường hợp 2: Đã đặt lại mật khẩu thành công
  if (isSuccess) {
    return (
      <div className="flex-1 py-14 px-4 sm:px-6 flex flex-col justify-center items-center bg-slate-50/50">
        <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Đặt lại mật khẩu thành công!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Mật khẩu mới của bạn đã được cập nhật an toàn. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-6 font-medium">
            Tự động chuyển về trang đăng nhập sau <strong>{countdown} giây</strong>...
          </div>

          <Button
            asChild
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm gap-2"
          >
            <Link to="/login">
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Trường hợp 3: Form nhập mật khẩu mới
  return (
    <div className="flex-1 py-14 px-4 sm:px-6 flex flex-col justify-center items-center bg-slate-50/50">
      <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo mật khẩu mới
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn để hoàn tất quá trình khôi phục.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Mật khẩu mới */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reset-new-password"
              className="text-xs sm:text-sm font-semibold text-slate-700"
            >
              Mật khẩu mới
            </Label>
            <Input
              id="reset-new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              icon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register("newPassword")}
              className={
                errors.newPassword
                  ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500"
                  : ""
              }
              autoComplete="new-password"
              autoFocus
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reset-confirm-password"
              className="text-xs sm:text-sm font-semibold text-slate-700"
            >
              Xác nhận mật khẩu mới
            </Label>
            <Input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              icon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register("confirmPassword")}
              className={
                errors.confirmPassword
                  ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500"
                  : ""
              }
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Gợi ý tiêu chuẩn mật khẩu */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isLengthValid
                    ? "bg-emerald-100 text-emerald-700 font-bold"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isLengthValid ? <Check className="w-3 h-3 stroke-[3]" /> : "•"}
              </div>
              <span className={isLengthValid ? "text-emerald-700 font-medium" : ""}>
                Độ dài tối thiểu 6 ký tự
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isMatch
                    ? "bg-emerald-100 text-emerald-700 font-bold"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isMatch ? <Check className="w-3 h-3 stroke-[3]" /> : "•"}
              </div>
              <span className={isMatch ? "text-emerald-700 font-medium" : ""}>
                Hai mật khẩu trùng khớp nhau
              </span>
            </div>
          </div>

          {/* Nút gửi form */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm gap-2 transition-all mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang cập nhật mật khẩu...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Xác nhận đặt lại mật khẩu</span>
              </>
            )}
          </Button>
        </form>

        {/* Link quay lại */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs sm:text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <span>Hủy bỏ và quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
