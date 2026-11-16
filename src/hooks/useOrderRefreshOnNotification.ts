import { useEffect, useRef } from "react"
import { useNotificationStore } from "@/stores/notificationStore"

/**
 * Hook cho phép các component/trang đơn hàng tự động tải lại dữ liệu khi có thông báo liên quan
 * @param onRefresh Hàm callback để reload danh sách đơn hàng
 */
export const useOrderRefreshOnNotification = (onRefresh: () => void) => {
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    const unsubscribe = useNotificationStore.getState().subscribeOrderUpdate(() => {
      if (onRefreshRef.current) {
        onRefreshRef.current()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])
}
