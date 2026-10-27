import React from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import {
  Cpu,
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Boxes,
  Database,
  Users,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { authService } from "@/services/api/authService"
import { toast } from "sonner"

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      clearAuth()
      toast.success("Đã đăng xuất khỏi phiên làm việc quản trị viên")
      navigate("/login")
    }
  }
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <span className="font-bold text-base text-slate-900 tracking-tight">
          TechCraft Admin
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        <div>
          <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Phân hệ quản trị
          </h4>
          <nav className="space-y-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tổng quan & Thống kê</span>
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Quản lý sản phẩm</span>
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Quản lý đơn hàng</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-600">
                3 mới
              </span>
            </NavLink>

            <NavLink
              to="/admin/pc-cases"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Cấu hình PC Cases</span>
            </NavLink>

            <NavLink
              to="/admin/rag-ai"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Tài liệu RAG & AI</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Quản lý người dùng</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Quay về Cửa hàng</span>
          </div>
          <span className="text-slate-400 text-xs">↗</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
