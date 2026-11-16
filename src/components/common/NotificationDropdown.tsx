import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  PackageCheck,
  Clock,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotificationStore } from "@/stores/notificationStore"
import type { UserRole } from "@/types/auth"
import type { OrderNotification } from "@/types/notification"

interface NotificationDropdownProps {
  role: UserRole
  align?: "start" | "end"
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  role,
  align = "end",
}) => {
  const navigate = useNavigate()
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)

  const handleItemClick = async (item: OrderNotification) => {
    if (!item.read) {
      await markAsRead(item.id, role)
    }

    if (role === "ADMIN") {
      navigate("/admin/orders")
    } else {
      navigate("/orders")
    }
  }

  const renderIcon = (type: OrderNotification["type"]) => {
    switch (type) {
      case "ORDER_CREATED":
        return <ShoppingBag className="w-4 h-4 text-blue-600" />
      case "ORDER_CANCELLED_BY_USER":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      case "ORDER_STATUS_CHANGED":
        return <PackageCheck className="w-4 h-4 text-emerald-600" />
      default:
        return <Bell className="w-4 h-4 text-slate-500" />
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
    } catch {
      return ""
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
          title="Thông báo mới"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-80 sm:w-96 p-0 shadow-xl border border-slate-200 bg-white rounded-xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Thông báo</span>
            {unreadCount > 0 && (
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                {unreadCount} mới
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead(role)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đã đọc tất cả
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Clock className="w-7 h-7 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 text-left cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                  !item.read ? "bg-blue-50/40" : ""
                }`}
              >
                <div
                  className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                    item.type === "ORDER_CREATED"
                      ? "bg-blue-100/70"
                      : item.type === "ORDER_CANCELLED_BY_USER"
                      ? "bg-amber-100/70"
                      : "bg-emerald-100/70"
                  }`}
                >
                  {renderIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        !item.read ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
          <button
            onClick={() => {
              if (role === "ADMIN") navigate("/admin/orders")
              else navigate("/orders")
            }}
            className="text-xs text-slate-600 hover:text-blue-600 font-medium py-1 transition"
          >
            {role === "ADMIN" ? "Xem tất cả đơn hàng" : "Xem lịch sử đơn hàng"}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
