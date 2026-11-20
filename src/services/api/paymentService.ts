import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { PaymentInfo, PaymentMethod, PaymentStatus } from "@/types/order"

export interface PaymentStatusResponse {
  orderId: string
  orderCode: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
}

export const paymentService = {
  /**
   * Lấy chi tiết thông tin thanh toán (bao gồm VietQR, STK, cú pháp) của đơn hàng
   * Endpoint: GET /api/payment/orders/:orderId/info
   */
  getPaymentInfo: async (orderId: string): Promise<ApiResponse<PaymentInfo>> => {
    return axiosClient.get(`/payment/orders/${orderId}/info`)
  },

  /**
   * Tra cứu trạng thái thanh toán nhanh của đơn hàng
   * Endpoint: GET /api/payment/orders/:orderId/status
   */
  getPaymentStatus: async (orderId: string): Promise<ApiResponse<PaymentStatusResponse>> => {
    return axiosClient.get(`/payment/orders/${orderId}/status`)
  },
}
