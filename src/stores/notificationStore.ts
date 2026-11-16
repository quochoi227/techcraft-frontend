import { create } from "zustand"
import type { OrderNotification } from "@/types/notification"
import type { UserRole } from "@/types/auth"
import { notificationService } from "@/services/api/notificationService"

interface NotificationState {
  notifications: OrderNotification[]
  unreadCount: number
  isLoading: boolean
  orderUpdateListeners: Set<() => void>

  // Actions
  fetchNotifications: (role: UserRole) => Promise<void>
  fetchUnreadCount: (role: UserRole) => Promise<void>
  addNotification: (notification: OrderNotification) => void
  markAsRead: (id: string, role: UserRole) => Promise<void>
  markAllAsRead: (role: UserRole) => Promise<void>

  // Event bus cho Order Reload
  subscribeOrderUpdate: (listener: () => void) => () => void
  triggerOrderUpdate: () => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  orderUpdateListeners: new Set<() => void>(),

  fetchNotifications: async (role: UserRole) => {
    set({ isLoading: true })
    try {
      const res =
        role === "ADMIN"
          ? await notificationService.getAdminNotifications(0, 20)
          : await notificationService.getUserNotifications(0, 20)

      const pageData = res?.data || res
      const content = (pageData as any)?.content || []
      set({ notifications: content, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async (role: UserRole) => {
    try {
      const res =
        role === "ADMIN"
          ? await notificationService.getAdminUnreadCount()
          : await notificationService.getUserUnreadCount()

      const data = (res?.data || res) as any
      const count = typeof data?.unreadCount === "number" ? data.unreadCount : 0
      set({ unreadCount: count })
    } catch {
      // Bỏ qua lỗi
    }
  },

  addNotification: (notification: OrderNotification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: async (id: string, role: UserRole) => {
    try {
      if (role === "ADMIN") {
        await notificationService.markAdminNotificationAsRead(id)
      } else {
        await notificationService.markUserNotificationAsRead(id)
      }

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (err) {
      console.warn("Lỗi khi đánh dấu thông báo đã đọc:", err)
    }
  },

  markAllAsRead: async (role: UserRole) => {
    try {
      if (role === "ADMIN") {
        await notificationService.markAllAdminNotificationsAsRead()
      } else {
        await notificationService.markAllUserNotificationsAsRead()
      }

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch (err) {
      console.warn("Lỗi khi đánh dấu tất cả thông báo đã đọc:", err)
    }
  },

  subscribeOrderUpdate: (listener: () => void) => {
    const listeners = get().orderUpdateListeners
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  triggerOrderUpdate: () => {
    const listeners = get().orderUpdateListeners
    listeners.forEach((listener) => {
      try {
        listener()
      } catch (err) {
        console.error("Lỗi khi trigger order listener:", err)
      }
    })
  },

  clear: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
    })
  },
}))
