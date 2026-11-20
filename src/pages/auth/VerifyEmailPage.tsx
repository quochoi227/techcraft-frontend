import React, { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home, LogIn } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/api/authService"

type VerifyStatus = "verifying" | "success" | "already_verified" | "error"

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [status, setStatus] = useState<VerifyStatus>("verifying")
  const [message, setMessage] = useState<string>("")
  const [countdown, setCountdown] = useState<number>(3)

  // Ngăn chặn gọi trùng lặp 2 lần do React 18 StrictMode mount/remount
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus("error")
      setMessage("Liên kết xác thực không hợp lệ hoặc thiếu mã xác thực (token).")
      return
    }

    if (hasRequestedRef.current) return
    hasRequestedRef.current = true

    const doVerify = async () => {
      try {
        const response = await authService.verifyEmail(token.trim())
        const successMsg =
          response?.message ||
          "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ."

        setStatus("success")
        setMessage(successMsg)
        toast.success(successMsg, { id: "verify-email-success" })
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Xác thực tài khoản thất bại. Vui lòng kiểm tra lại liên kết."

        // Xử lý trường hợp token đã được kích hoạt trước đó
        if (
          errorMsg.toLowerCase().includes("đã được sử dụng") ||
          errorMsg.toLowerCase().includes("already used")
        ) {
          setStatus("already_verified")
          setMessage(
            "Tài khoản của bạn đã được xác thực trước đó. Bạn có thể tiến hành đăng nhập ngay."
          )
          toast.info("Tài khoản đã được xác thực trước đó.", {
            id: "verify-email-info",
          })
        } else {
          setStatus("error")
          setMessage(errorMsg)
        }
      }
    }

    doVerify()
  }, [token])

  // Đếm ngược tự động điều hướng về trang đăng nhập khi xác thực thành công
  useEffect(() => {
    if (status !== "success" && status !== "already_verified") return

    if (countdown <= 0) {
      navigate("/login", {
        replace: true,
        state: { verified: true },
      })
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [status, countdown, navigate])

  return (
    <div className="flex-1 py-16 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-center transition-all">
        {/* Trạng thái 1: Đang xác thực */}
        {status === "verifying" && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Đang xác thực email...
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Vui lòng đợi trong giây lát, TechCraft PC đang kiểm tra mã token và
                kích hoạt tài khoản của bạn.
              </p>
            </div>
          </div>
        )}

        {/* Trạng thái 2: Xác thực thành công */}
        {status === "success" && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Xác thực thành công!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {message}
              </p>
              <p className="text-xs text-slate-400">
                Tự động chuyển về trang đăng nhập sau{" "}
                <span className="font-semibold text-emerald-600">{countdown}s</span>...
              </p>
            </div>

            <Button
              onClick={() =>
                navigate("/login", {
                  replace: true,
                  state: { verified: true },
                })
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-11 rounded-lg flex items-center justify-center gap-2 mt-4 transition"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Trạng thái 3: Token đã xác thực trước đó */}
        {status === "already_verified" && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Tài khoản đã được kích hoạt
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {message}
              </p>
              <p className="text-xs text-slate-400">
                Tự động chuyển về trang đăng nhập sau{" "}
                <span className="font-semibold text-blue-600">{countdown}s</span>...
              </p>
            </div>

            <Button
              onClick={() =>
                navigate("/login", {
                  replace: true,
                  state: { verified: true },
                })
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-11 rounded-lg flex items-center justify-center gap-2 mt-4 transition"
            >
              <span>Đến trang đăng nhập</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Trạng thái 4: Lỗi xác thực */}
        {status === "error" && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Xác thực thất bại
              </h1>
              <p className="text-sm text-red-600 leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                asChild
                className="flex-1 h-11 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
              >
                <Link to="/">
                  <Home className="w-4 h-4" />
                  <span>Trang chủ</span>
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
