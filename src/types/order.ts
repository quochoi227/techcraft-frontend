import type { Product, ProductCategory } from "./product"
import type { PcCase } from "./pcCase"

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED"

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
  status?: OrderStatus
  search?: string
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
