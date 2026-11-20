import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type {
  Order,
  OrderStatus,
  CreateOrderPayload,
  OrderFilterParams,
  AdminOrderFilterParams,
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
    const cleanParams: any = { ...params }
    if (cleanParams.status === "ALL") {
      delete cleanParams.status
    }
    return axiosClient.get("/orders", { params: cleanParams })
  },

  /**
   * Xem thông tin chi tiết một đơn hàng theo ID (User / Admin)
   * Endpoint: GET /api/orders/:id
   */
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosClient.get(`/orders/${id}`)
  },

  /**
   * Hủy đơn hàng (User chỉ hủy khi đơn hàng đang ở trạng thái PENDING)
   * Endpoint: PUT /api/orders/:id/cancel
   */
  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosClient.put(`/orders/${id}/cancel`)
  },

  // =========================================================================
  // ADMIN ORDER ENDPOINTS
  // =========================================================================

  /**
   * Lấy danh sách tất cả đơn hàng hệ thống (Admin)
   * Endpoint: GET /api/admin/orders
   */
  getAllOrders: async (
    params?: AdminOrderFilterParams
  ): Promise<ApiResponse<PageResponse<Order>>> => {
    const cleanParams: any = { ...params }
    if (cleanParams.status === "ALL") {
      delete cleanParams.status
    }
    if (cleanParams.paymentMethod === "ALL") {
      delete cleanParams.paymentMethod
    }
    return axiosClient.get("/admin/orders", { params: cleanParams })
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   * Endpoint: PUT /api/admin/orders/:id/status
   */
  updateOrderStatus: async (
    id: string,
    status: OrderStatus
  ): Promise<ApiResponse<Order>> => {
    return axiosClient.put(`/admin/orders/${id}/status`, { status })
  },

  /**
   * Xem chi tiết đơn hàng quản trị (Admin)
   * Endpoint: GET /api/admin/orders/:id
   */
  adminGetOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosClient.get(`/admin/orders/${id}`)
  },
}

export default orderService
