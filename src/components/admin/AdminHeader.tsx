import React from "react"
import { Bell } from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
}

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Admin Portal",
  "/admin/products": "Quản lý sản phẩm",
  "/admin/dashboard": "Tổng quan & Thống kê",
  "/admin/orders": "Quản lý đơn hàng",
  "/admin/pc-cases": "Quản lý PC Cases",
  "/admin/rag-ai": "Tài liệu RAG & AI",
  "/admin/users": "Quản lý người dùng",
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ breadcrumbs }) => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  // Tự động nhận diện breadcrumbs từ URL hiện tại nếu không truyền props
  const effectiveBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs

    const path = location.pathname
    const currentLabel = ROUTE_LABELS[path] || "Quản lý hệ thống"

    if (path === "/admin") {
      return [{ label: "Admin Portal", href: "/admin" }]
    }

    return [
      { label: "Admin Portal", href: "/admin" },
      { label: currentLabel },
    ]
  }, [breadcrumbs, location.pathname])

  const displayName = user?.fullName || "Trần Minh Quản Trị"
  const displayRole = user?.role || "SUPER_ADMIN"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "TM"

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium">
        {effectiveBreadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.label}>
            {idx > 0 && <span className="mx-2 text-slate-400">/</span>}
            {idx === effectiveBreadcrumbs.length - 1 ? (
              <span className="text-slate-800 font-semibold">{crumb.label}</span>
            ) : crumb.href ? (
              <Link to={crumb.href} className="text-slate-400 hover:text-slate-600 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Thông báo mới"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            5
          </span>
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {displayName}
            </span>
            <div className="mt-0.5">
              <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                {displayRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

