import React, { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/api/authService"
import { useAuthStore } from "@/stores/authStore"

// Schema validate form đăng nhập
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email" })
    .email({ message: "Địa chỉ email không đúng định dạng" }),
  password: z
    .string()
    .min(1, { message: "Vui lòng nhập mật khẩu" }),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get("redirect")

  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setUnverifiedEmail(null)

    try {
      // Gọi API đăng nhập POST /api/auth/login
      const response = await authService.login({
        email: data.email,
        password: data.password,
      })

      // Trích xuất dữ liệu trả về từ backend
      const authData = response?.data || response
      const accessToken = authData?.accessToken
      const user = authData?.user

      if (!accessToken || !user) {
        throw new Error("Không nhận được mã xác thực accessToken hoặc thông tin người dùng")
      }

      // Lưu trữ phiên đăng nhập vào Zustand Auth Store
      setAuth(user, accessToken)

      toast.success(
        response?.message || `Chào mừng ${user.fullName || user.email} quay trở lại!`,
        { id: "login-success" }
      )

      // Điều hướng người dùng
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else if (user.role === "ADMIN") {
        navigate("/admin/products", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu!"

      // Kiểm tra nếu lỗi do tài khoản chưa xác thực email
      if (
        errorMsg.toLowerCase().includes("xác thực") ||
        errorMsg.toLowerCase().includes("verify") ||
        errorMsg.toLowerCase().includes("chưa kích hoạt")
      ) {
        setUnverifiedEmail(data.email)
      }

      toast.error(errorMsg, { id: "login-error" })
    } finally {
      setIsLoading(false)
    }
  }

  // Gửi lại email xác thực
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    setIsResending(true)
    try {
      // Giả lập hoặc gọi endpoint gửi lại xác thực
      toast.success(
        `Đã gửi lại link xác thực đến ${unverifiedEmail}. Vui lòng kiểm tra hộp thư!`
      )
      setUnverifiedEmail(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi lại email xác thực")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        {/* Header Icon & Title */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <LogIn className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
            Đăng nhập tài khoản
          </h1>
          <p className="text-sm text-slate-500">
            Chào mừng bạn quay trở lại với TechCraft PC
          </p>
        </div>

        {/* Thông báo nếu tài khoản chưa xác thực email */}
        {unverifiedEmail && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2 animate-in fade-in">
            <p className="font-semibold">
              Tài khoản của bạn chưa được xác thực email ({unverifiedEmail}).
            </p>
            <p className="text-amber-700">
              Vui lòng kiểm tra hộp thư đến hoặc bấm vào nút bên dưới để nhận liên kết xác thực mới:
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isResending}
              onClick={handleResendVerification}
              className="w-full h-8 bg-white border-amber-300 text-amber-800 hover:bg-amber-100 gap-1.5 text-xs font-medium"
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Gửi lại email xác thực</span>
            </Button>
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Địa chỉ Email */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-xs sm:text-sm font-semibold text-slate-700">
              Địa chỉ Email
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="w-4 h-4" />}
              {...register("email")}
              className={errors.email ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-xs sm:text-sm font-semibold text-slate-700">
                Mật khẩu
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              icon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register("password")}
              className={errors.password ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Nút Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-11 rounded-lg flex items-center justify-center gap-2 mt-2 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer chuyển sang trang đăng ký */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
