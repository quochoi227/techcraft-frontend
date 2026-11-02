import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type {
  Order,
  CreateOrderPayload,
  OrderFilterParams,
  PageResponse,
} from "@/types/order"

export const orderService = {
  /**
   * Tạo đơn hàng mới (linh kiện lẻ hoặc PC Case hoặc cả hai)
   * Endpoint: POST /api/orders
   */
  createOrder: async (
    payload: CreateOrderPayload
  ): Promise<ApiResponse<Order>> => {
    return axiosClient.post("/orders", payload)
  },

  /**
   * Lấy lịch sử đơn hàng của người dùng hiện tại
   * Endpoint: GET /api/orders
   */
  getUserOrders: async (
    params?: OrderFilterParams
  ): Promise<ApiResponse<PageResponse<Order>>> => {
    // If status is "ALL", omit it from params sent to backend
    const cleanParams: any = { ...params }
    if (cleanParams.status === "ALL") {
      delete cleanParams.status
    }
    return axiosClient.get("/orders", { params: cleanParams })
  },

  /**
   * Xem thông tin chi tiết một đơn hàng theo ID
   * Endpoint: GET /api/orders/:id
   */
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosClient.get(`/orders/${id}`)
  },

  /**
   * Hủy đơn hàng (khi đơn hàng đang ở trạng thái PENDING)
   * Endpoint: PUT /api/orders/:id/cancel
   */
  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosClient.put(`/orders/${id}/cancel`)
  },
}
