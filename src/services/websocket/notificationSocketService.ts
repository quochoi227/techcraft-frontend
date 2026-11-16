import { Client, type StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"
import type { User } from "@/types/auth"
import type { OrderNotification } from "@/types/notification"
import { useNotificationStore } from "@/stores/notificationStore"

class NotificationSocketService {
  private client: Client | null = null
  private activeSubscription: StompSubscription | null = null
  private currentChannel: string | null = null
  private currentUserId: string | null = null
  private isConnecting: boolean = false

  public connect(user: User, accessToken: string) {
    if (!user || !user.id || !accessToken) {
      return
    }

    const targetChannel =
      user.role === "ADMIN"
        ? "/topic/admin/notifications"
        : `/topic/users/${user.id}/notifications`

    // Đã kết nối đúng kênh của người dùng hiện tại -> không làm gì thêm (tránh duplicate)
    if (
      this.client &&
      this.client.active &&
      this.currentChannel === targetChannel &&
      this.currentUserId === user.id
    ) {
      return
    }

    if (this.isConnecting) {
      return
    }

    // Nếu đã có kết nối cũ nhưng đổi user hoặc đổi role -> ngắt kết nối cũ
    if (this.client) {
      this.disconnect()
    }

    this.isConnecting = true
    this.currentUserId = user.id
    this.currentChannel = targetChannel

    const backendUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080"
    const wsUrl = `${backendUrl}/ws`

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnecting = false
        console.log(`[WebSocket] Đã kết nối STOMP thành công tới: ${targetChannel}`)

        // Đảm bảo chỉ có DUY NHẤT 1 subscription hoạt động
        if (this.activeSubscription) {
          this.activeSubscription.unsubscribe()
          this.activeSubscription = null
        }

        if (this.client && this.client.connected) {
          this.activeSubscription = this.client.subscribe(
            targetChannel,
            (message) => {
              try {
                const payload: OrderNotification = JSON.parse(message.body)
                this.handleIncomingNotification(payload)
              } catch (err) {
                console.error("[WebSocket] Lỗi parse notification payload:", err)
              }
            }
          )
        }
      },
      onStompError: (frame) => {
        this.isConnecting = false
        console.warn("[WebSocket] STOMP Error:", frame.headers["message"])
      },
      onWebSocketClose: () => {
        this.isConnecting = false
      },
    })

    this.client.activate()
  }

  private handleIncomingNotification(payload: OrderNotification) {
    console.log("[WebSocket] Nhận thông báo:", payload)

    // 1. Thêm vào Store và cập nhật số lượng chưa đọc
    useNotificationStore.getState().addNotification(payload)

    // 2. Hiển thị Toast Popup (Sonner)
    if (payload.type === "ORDER_CREATED") {
      toast.info(payload.title, {
        description: payload.message,
        duration: 7000,
      })
    } else if (payload.type === "ORDER_CANCELLED_BY_USER") {
      toast.warning(payload.title, {
        description: payload.message,
        duration: 7000,
      })
    } else if (payload.type === "ORDER_STATUS_CHANGED") {
      toast.success(payload.title, {
        description: payload.message,
        duration: 7000,
      })
    } else {
      toast.info(payload.title, {
        description: payload.message,
        duration: 6000,
      })
    }

    // 3. Trigger reload data cho các trang đang mount (OrderHistoryPage hoặc OrderListPage)
    useNotificationStore.getState().triggerOrderUpdate()
  }

  public disconnect() {
    if (this.activeSubscription) {
      try {
        this.activeSubscription.unsubscribe()
      } catch {
        // Bỏ qua lỗi khi unsubscribe
      }
      this.activeSubscription = null
    }

    if (this.client) {
      try {
        this.client.deactivate()
      } catch {
        // Bỏ qua lỗi khi deactivate
      }
      this.client = null
    }

    this.currentChannel = null
    this.currentUserId = null
    this.isConnecting = false
    console.log("[WebSocket] Đã ngắt kết nối STOMP")
  }
}

export const notificationSocketService = new NotificationSocketService()
