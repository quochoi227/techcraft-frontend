import React, { useState } from "react"
import { Link } from "react-router-dom"
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info("Trang đăng nhập đang sẵn sàng kết nối API.")
  }

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Địa chỉ Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Mật khẩu</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-11 rounded-lg flex items-center justify-center gap-2 mt-2"
          >
            <span>Đăng nhập</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

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
