import type { Product, ProductCategory } from "./product"
import type { PcCase } from "./pcCase"

export type CartItemType = "PRODUCT" | "PC_CASE"

export interface CartItem {
  id: string
  itemType: CartItemType

  // Thông tin linh kiện lẻ (nếu item là Product)
  productId?: string
  productName?: string
  productPrice?: number
  productImage?: string
  category?: ProductCategory
  product?: Product

  // Thông tin cấu hình PC (nếu item là PcCase)
  pcCaseId?: string
  pcCaseName?: string
  useCase?: string
  pcCase?: PcCase

  // Thông tin thanh toán & số lượng chung
  unitPrice: number
  stockQuantity: number
  quantity: number
  subtotal: number
  createdAt?: string
  updatedAt?: string
}

export interface CartResponse {
  items: CartItem[]
  totalItems: number
  totalQuantity: number
  totalAmount: number
}

export interface AddCartItemPayload {
  productId: string
  quantity?: number
}

export interface AddCartPcCasePayload {
  pcCaseId: string
  quantity?: number
}

export interface UpdateCartItemPayload {
  quantity: number
}

export interface UpdateCartPcCasePayload {
  quantity: number
}
