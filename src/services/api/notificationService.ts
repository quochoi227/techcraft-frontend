import { axiosClient } from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { PageResponse } from "@/types/order"
import type { OrderNotification } from "@/types/notification"

interface UnreadCountResponse {
  unreadCount: number
}

export const notificationService = {
  // ==================== Dành cho User ====================

  getUserNotifications: (page: number = 0, size: number = 10) => {
    return axiosClient.get<any, ApiResponse<PageResponse<OrderNotification>>>(
      "/notifications",
      { params: { page, size } }
    )
  },

  getUserUnreadCount: () => {
    return axiosClient.get<any, ApiResponse<UnreadCountResponse>>(
      "/notifications/unread-count"
    )
  },

  markUserNotificationAsRead: (id: string) => {
    return axiosClient.put<any, ApiResponse<void>>(`/notifications/${id}/read`)
  },

  markAllUserNotificationsAsRead: () => {
    return axiosClient.put<any, ApiResponse<void>>("/notifications/read-all")
  },

  // ==================== Dành cho Admin ====================

  getAdminNotifications: (page: number = 0, size: number = 10) => {
    return axiosClient.get<any, ApiResponse<PageResponse<OrderNotification>>>(
      "/admin/notifications",
      { params: { page, size } }
    )
  },

  getAdminUnreadCount: () => {
    return axiosClient.get<any, ApiResponse<UnreadCountResponse>>(
      "/admin/notifications/unread-count"
    )
  },

  markAdminNotificationAsRead: (id: string) => {
    return axiosClient.put<any, ApiResponse<void>>(`/admin/notifications/${id}/read`)
  },

  markAllAdminNotificationsAsRead: () => {
    return axiosClient.put<any, ApiResponse<void>>("/admin/notifications/read-all")
  },
}
