import type { OrderStatus } from "./order"

export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_CANCELLED_BY_USER"
  | "ORDER_STATUS_CHANGED"

export interface OrderNotification {
  id: string
  type: NotificationType
  orderId: string
  orderCode: string
  title: string
  message: string
  status?: OrderStatus
  totalAmount?: number
  customerName?: string
  customerEmail?: string
  read: boolean
  createdAt: string
}
