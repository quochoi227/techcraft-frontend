import React from "react"
import { Bell } from "lucide-react"

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  breadcrumbs = [
    { label: "Admin Portal", href: "/admin" },
    { label: "Quản lý sản phẩm" },
  ],
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.label}>
            {idx > 0 && <span className="mx-2 text-slate-400">/</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-slate-800 font-semibold">{crumb.label}</span>
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
          <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            5
          </span>
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            TM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              Trần Minh Quản Trị
            </span>
            <div className="mt-0.5">
              <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                SUPER_ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
