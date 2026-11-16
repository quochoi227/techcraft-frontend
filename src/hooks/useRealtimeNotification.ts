import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { notificationSocketService } from "@/services/websocket/notificationSocketService"

export const useRealtimeNotification = () => {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications)
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount)
  const clearNotifications = useNotificationStore((state) => state.clear)

  useEffect(() => {
    if (isAuthenticated && user && accessToken) {
      // 1. Tải số lượng chưa đọc & danh sách thông báo ban đầu
      fetchUnreadCount(user.role)
      fetchNotifications(user.role)

      // 2. Khởi tạo kết nối STOMP duy nhất
      notificationSocketService.connect(user, accessToken)
    } else {
      // Ngắt kết nối và dọn dẹp state khi đăng xuất
      notificationSocketService.disconnect()
      clearNotifications()
    }

    return () => {
      // Khi unmount toàn bộ layout
      // notificationSocketService.disconnect()
    }
  }, [isAuthenticated, user, accessToken, fetchUnreadCount, fetchNotifications, clearNotifications])
}
