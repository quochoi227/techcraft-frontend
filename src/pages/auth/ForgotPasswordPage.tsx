import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  KeyRound,
  Mail,
  ArrowLeft,
  Loader2,
  Send,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/api/authService"

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email của bạn" })
    .email({ message: "Địa chỉ email không đúng định dạng" }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // Đếm ngược thời gian cho phép gửi lại email
  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [resendCountdown])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await authService.forgotPassword({
        email: data.email,
      })

      const successMsg =
        response?.message ||
        "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn."

      setSubmittedEmail(data.email)
      setIsSuccess(true)
      setResendCountdown(60) // Cooldown 60s
      toast.success(successMsg, { id: "forgot-password-success" })
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra lại email hoặc thử lại sau."

      toast.error(errorMsg, { id: "forgot-password-error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0 || !submittedEmail || isLoading) return

    setIsLoading(true)
    try {
      const response = await authService.forgotPassword({
        email: submittedEmail,
      })

      const successMsg =
        response?.message ||
        "Liên kết đặt lại mật khẩu mới đã được gửi lại vào email của bạn."

      setResendCountdown(60)
      toast.success(successMsg, { id: "resend-forgot-password-success" })
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Gửi lại email thất bại. Vui lòng thử lại sau ít phút."

      toast.error(errorMsg, { id: "resend-forgot-password-error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 py-14 px-4 sm:px-6 flex flex-col justify-center items-center bg-slate-50/50">
      <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 transition-all">
        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Quên mật khẩu?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Đừng lo lắng! Hãy nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi cho bạn liên kết an toàn để tạo mật khẩu mới.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label
                  htmlFor="forgot-email"
                  className="text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Địa chỉ Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  {...register("email")}
                  className={
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500"
                      : ""
                  }
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm gap-2 transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi liên kết đặt lại mật khẩu</span>
                  </>
                )}
              </Button>
            </form>

            {/* Quay lại đăng nhập */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs sm:text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
                <span>Quay lại trang đăng nhập</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Trạng thái đã gửi email thành công */
          <div className="text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Kiểm tra hộp thư của bạn
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm mb-5 break-all flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{submittedEmail}</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 text-left mb-6 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Lưu ý quan trọng:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 pl-1">
                <li>Liên kết này chỉ có hiệu lực trong vòng <strong>1 giờ</strong>.</li>
                <li>Nếu không thấy trong Hộp thư đến, vui lòng kiểm tra thêm mục <strong>Thư rác (Spam/Junk)</strong>.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || resendCountdown > 0}
                onClick={handleResend}
                className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>
                  {resendCountdown > 0
                    ? `Gửi lại sau (${resendCountdown}s)`
                    : "Chưa nhận được? Gửi lại email"}
                </span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSuccess(false)
                  setResendCountdown(0)
                }}
                className="w-full h-9 text-xs text-slate-500 hover:text-slate-800"
              >
                Nhập địa chỉ email khác
              </Button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <Link
                to="/login"
                className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
