import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Package,
  ShoppingCart,
  Bot,
  ChevronRight,
  Home,
  Sparkles,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để xem thông tin tài khoản!")
      navigate("/login?redirect=/profile", { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!user) return null

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Thành viên"

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-20">
      {/* 1. Header Banner & Breadcrumbs */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-transparent border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Thông tin cá nhân</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tài khoản của bạn
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Xem lại thông tin cá nhân và quản lý các hoạt động mua sắm tại TechCraft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Profile Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: User Avatar & Role Badge Card (4 cols) */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Đã xác thực">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-extrabold text-lg text-slate-900">
                {user.fullName || "Khách hàng TechCraft"}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
                {user.email}
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                {user.role === "ADMIN" ? "Quản trị viên (Admin)" : "Khách hàng thành viên"}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tham gia từ {formattedJoinDate}</span>
            </div>
          </div>

          {/* Right: Personal Info Details (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>Chi tiết thông tin cá nhân</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Họ và tên:</span>
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {user.fullName || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Địa chỉ Email:</span>
                  </span>
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Số điện thoại:</span>
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vai trò hệ thống:</span>
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {user.role}
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1 pt-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Địa chỉ nhận hàng mặc định:</span>
                  </span>
                  <p className="font-semibold text-slate-800 text-sm leading-relaxed">
                    {user.address || "Chưa cập nhật địa chỉ giao hàng"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/orders"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Lịch sử đơn hàng
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Xem và theo dõi tất cả đơn hàng đã đặt
                  </p>
                </div>
              </Link>

              <Link
                to="/cart"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Giỏ hàng của bạn
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kiểm tra các linh kiện đang lưu
                  </p>
                </div>
              </Link>

              <Link
                to="/ai-consultant"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                    Tư vấn AI thông minh
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gợi ý cấu hình PC chuẩn tương thích
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
