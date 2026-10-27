import React, { useState } from "react"
import { Link } from "react-router-dom"
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

  const {
    register,
    handleSubmit,
    control,
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
    // Giả lập gửi request (chưa kết nối backend)
    setTimeout(() => {
      setIsLoading(false)
      toast.success(
        `Chúc mừng ${data.fullName}! Đăng ký tài khoản TechCraft PC thành công. Vui lòng kiểm tra email để xác thực.`,
        { duration: 5000 }
      )
    }, 1200)
  }

  const handleGoogleSignup = () => {
    toast.info("Tính năng đăng ký qua Google đang được chuẩn bị kết nối.")
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

        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-2.5 transition"
        >
          {/* Google 4-Color SVG Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng ký với Google</span>
        </button>

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
