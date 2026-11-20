import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Headphones,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authService } from "@/services/api/authService"

// Schema validate form đăng ký
const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập họ và tên" })
      .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập địa chỉ email" })
      .email({ message: "Địa chỉ email không đúng định dạng" }),
    phone: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập số điện thoại" })
      .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
        message: "Số điện thoại không hợp lệ (gồm 10 số, ví dụ 0912345678)",
      }),
    password: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu" })
      .min(8, { message: "Mật khẩu phải có tối thiểu 8 ký tự" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng nhập lại mật khẩu xác nhận" }),
    agreeTerms: z.literal(true, {
      errorMap: () => ({
        message: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false as unknown as true,
    },
    mode: "onSubmit",
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Gọi API đăng ký tài khoản đến backend: POST /api/auth/register
      const response = await authService.register({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,
      })

      const successMessage =
        response?.message ||
        "Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực tài khoản."

      toast.success(successMessage, {
        duration: 5000,
        id: "register-success",
      })

      // Điều hướng người dùng sang trang đăng nhập và gửi kèm email đã đăng ký
      navigate("/login", {
        replace: true,
        state: {
          email: data.email.trim(),
          registered: true,
        },
      })
    } catch (error: any) {
      const errorData = error.response?.data
      const errorMsg =
        errorData?.message ||
        error.message ||
        "Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin!"

      // Gắn lỗi cụ thể vào trường tương ứng nếu backend trả về chi tiết lỗi validation
      if (
        errorData?.data &&
        typeof errorData.data === "object" &&
        !Array.isArray(errorData.data)
      ) {
        Object.entries(errorData.data).forEach(([field, msg]) => {
          if (field in data) {
            setError(field as keyof RegisterFormData, {
              type: "server",
              message: String(msg),
            })
          }
        })
      } else if (
        errorMsg.toLowerCase().includes("email đã được sử dụng") ||
        errorMsg.toLowerCase().includes("email đã tồn tại") ||
        errorMsg.toLowerCase().includes("duplicate")
      ) {
        setError("email", {
          type: "server",
          message: errorMsg,
        })
      }

      toast.error(errorMsg, { id: "register-error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Main Card */}
      <div className="w-full max-w-[540px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 transition-all">
        {/* Header Icon & Title */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <UserPlus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
            Tạo tài khoản TechCraft PC
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Gia nhập cộng đồng công nghệ, lưu cấu hình PC AI và nhận đặc quyền bảo
            hành chính hãng.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Họ và tên */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs sm:text-sm font-semibold text-slate-700">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              icon={<User className="w-4 h-4" />}
              {...register("fullName")}
              className={errors.fullName ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Địa chỉ Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-slate-700">
              Địa chỉ Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
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

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-slate-700">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="0912 345 678"
              icon={<Phone className="w-4 h-4" />}
              {...register("phone")}
              className={errors.phone ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-slate-700">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 8 ký tự"
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

          {/* Xác nhận mật khẩu */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs sm:text-sm font-semibold text-slate-700"
            >
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              icon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-400 focus-visible:border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Điều khoản dịch vụ checkbox */}
          <div className="pt-1">
            <div className="flex items-start gap-2.5">
              <Controller
                name="agreeTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="agreeTerms"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-1"
                  />
                )}
              />
              <label
                htmlFor="agreeTerms"
                className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none"
              >
                Tôi đồng ý với{" "}
                <Link
                  to="/policies/terms"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link
                  to="/policies/privacy"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Chính sách bảo mật
                </Link>{" "}
                của TechCraft PC.
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.agreeTerms.message}
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
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        {/* Footer login link */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Bạn đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>

      {/* 3 Feature Cards */}
      <div className="w-full max-w-[540px] grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col items-start">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
            <Cpu className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 mb-1">
            Lưu & Quản lý PC AI
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Lưu cấu hình từ Chatbot & PC Builder không giới hạn.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col items-start">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 mb-1">
            Bảo hành 1 đổi 1 30 ngày
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Áp dụng đổi mới tức thì linh kiện chính hãng.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col items-start">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
            <Headphones className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 mb-1">
            Hỗ trợ kỹ thuật 24/7
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Kiểm tra tương thích & tư vấn trực tuyến.
          </p>
        </div>
      </div>
    </div>
  )
}
