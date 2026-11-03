import type { Product, ProductCategory } from "./product"
import type { PcCase } from "./pcCase"

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED"

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string
    badgeClass: string
    dotClass: string
    description: string
  }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    description: "Đơn hàng đang chờ nhân viên TechCraft tiếp nhận và xác nhận.",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    description: "Đơn hàng đã được xác nhận và đang tiến hành đóng gói linh kiện.",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
    description: "Đơn hàng đã bàn giao cho đối tác vận chuyển và đang trên đường giao.",
  },
  DELIVERED: {
    label: "Đã giao thành công",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    description: "Đơn hàng đã giao thành công và hoàn tất thanh toán.",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
    description: "Đơn hàng đã bị hủy.",
  },
}

export type PaymentMethod = "COD"

export interface CreateOrderItemPayload {
  productId?: string
  pcCaseId?: string
  quantity: number
}

export interface CreateOrderPayload {
  shippingAddress: string
  paymentMethod?: PaymentMethod
  note?: string
  items?: CreateOrderItemPayload[]
}

export interface OrderItem {
  id: string
  itemType?: "PRODUCT" | "PC_CASE" | string
  productId?: string
  productName?: string
  productImage?: string
  category?: ProductCategory
  product?: Product
  pcCaseId?: string
  pcCaseName?: string
  useCase?: string
  pcCase?: PcCase
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  userFullName?: string
  userPhone?: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  shippingAddress: string
  note?: string
  totalAmount: number
  totalQuantity: number
  items: OrderItem[]
  createdAt: string
  updatedAt?: string
}

export interface OrderFilterParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
  status?: OrderStatus | "ALL"
  search?: string
  keyword?: string
  paymentMethod?: PaymentMethod
}

export interface AdminOrderFilterParams extends OrderFilterParams {}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
}

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
]

/**
 * Trả về danh sách các trạng thái hợp lệ tiếp theo theo quy tắc của Backend OrderServiceImpl
 */
export const getNextValidStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"]
    case "CONFIRMED":
      return ["SHIPPING", "CANCELLED"]
    case "SHIPPING":
      return ["DELIVERED", "CANCELLED"]
    case "DELIVERED":
    case "CANCELLED":
    default:
      return []
  }
}

/**
 * Trạng thái tiến trình tiếp theo tự nhiên (không tính Cancel)
 */
export const getNextRecommendedStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  switch (currentStatus) {
    case "PENDING":
      return "CONFIRMED"
    case "CONFIRMED":
      return "SHIPPING"
    case "SHIPPING":
      return "DELIVERED"
    default:
      return null
  }
}

/**
 * Nhãn thao tác nhanh ứng với trạng thái tiếp theo
 */
export const getStatusActionLabel = (nextStatus: OrderStatus): string => {
  switch (nextStatus) {
    case "CONFIRMED":
      return "Xác nhận đơn"
    case "SHIPPING":
      return "Bàn giao vận chuyển"
    case "DELIVERED":
      return "Giao thành công"
    case "CANCELLED":
      return "Hủy đơn"
    default:
      return "Cập nhật"
  }
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CheckoutItem {
  id?: string // cart item id nếu đến từ giỏ hàng
  itemType: "PRODUCT" | "PC_CASE"
  productId?: string
  productName?: string
  productPrice?: number
  productImage?: string
  category?: ProductCategory
  product?: Product
  pcCaseId?: string
  pcCaseName?: string
  useCase?: string
  pcCase?: PcCase
  unitPrice: number
  quantity: number
  stockQuantity?: number
}
