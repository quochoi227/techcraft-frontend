import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type {
  CartResponse,
  CartItem,
  AddCartItemPayload,
  AddCartPcCasePayload,
  UpdateCartItemPayload,
  UpdateCartPcCasePayload,
} from "@/types/cart"

export const cartService = {
  /**
   * Lấy toàn bộ thông tin giỏ hàng của người dùng hiện tại
   * Endpoint: GET /api/cart
   */
  getCart: async (): Promise<ApiResponse<CartResponse>> => {
    return axiosClient.get("/cart")
  },

  /**
   * Thêm một linh kiện lẻ vào giỏ hàng
   * Endpoint: POST /api/cart/items
   */
  addCartItem: async (
    payload: AddCartItemPayload
  ): Promise<ApiResponse<CartItem>> => {
    return axiosClient.post("/cart/items", payload)
  },

  /**
   * Cập nhật số lượng của linh kiện trong giỏ hàng
   * Endpoint: PUT /api/cart/items/:id (id có thể là cartItem.id hoặc productId)
   */
  updateCartItemQuantity: async (
    id: string,
    payload: UpdateCartItemPayload
  ): Promise<ApiResponse<CartItem>> => {
    return axiosClient.put(`/cart/items/${id}`, payload)
  },

  /**
   * Xoá linh kiện khỏi giỏ hàng
   * Endpoint: DELETE /api/cart/items/:id
   */
  deleteCartItem: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/cart/items/${id}`)
  },

  /**
   * Thêm một cấu hình PC (PC Case) vào giỏ hàng
   * Endpoint: POST /api/cart/pc-cases
   */
  addPcCaseToCart: async (
    payload: AddCartPcCasePayload
  ): Promise<ApiResponse<CartItem>> => {
    return axiosClient.post("/cart/pc-cases", payload)
  },

  /**
   * Cập nhật số lượng của cấu hình PC trong giỏ hàng
   * Endpoint: PUT /api/cart/pc-cases/:id (id có thể là cartItem.id hoặc pcCaseId)
   */
  updateCartPcCaseQuantity: async (
    id: string,
    payload: UpdateCartPcCasePayload
  ): Promise<ApiResponse<CartItem>> => {
    return axiosClient.put(`/cart/pc-cases/${id}`, payload)
  },

  /**
   * Xoá cấu hình PC khỏi giỏ hàng
   * Endpoint: DELETE /api/cart/pc-cases/:id
   */
  deleteCartPcCase: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/cart/pc-cases/${id}`)
  },
}
