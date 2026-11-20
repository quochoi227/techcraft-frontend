import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types/review"

export const reviewService = {
  /**
   * Tạo đánh giá mới cho linh kiện máy tính (Yêu cầu đã mua và nhận hàng thành công)
   * Endpoint: POST /api/products/:id/reviews
   */
  createProductReview: async (
    productId: string,
    payload: CreateReviewPayload
  ): Promise<ApiResponse<Review>> => {
    return axiosClient.post(`/products/${productId}/reviews`, payload)
  },

  /**
   * Cập nhật đánh giá linh kiện máy tính
   * Endpoint: PUT /api/products/:id/reviews/:reviewId
   */
  updateProductReview: async (
    productId: string,
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<ApiResponse<Review>> => {
    return axiosClient.put(`/products/${productId}/reviews/${reviewId}`, payload)
  },

  /**
   * Xoá đánh giá linh kiện máy tính
   * Endpoint: DELETE /api/products/:id/reviews/:reviewId
   */
  deleteProductReview: async (
    productId: string,
    reviewId: string
  ): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/products/${productId}/reviews/${reviewId}`)
  },

  /**
   * Tạo đánh giá mới cho cấu hình PC (Yêu cầu đã mua và nhận hàng thành công)
   * Endpoint: POST /api/pc-cases/:id/reviews
   */
  createPcCaseReview: async (
    pcCaseId: string,
    payload: CreateReviewPayload
  ): Promise<ApiResponse<Review>> => {
    return axiosClient.post(`/pc-cases/${pcCaseId}/reviews`, payload)
  },

  /**
   * Cập nhật đánh giá cấu hình PC
   * Endpoint: PUT /api/pc-cases/:id/reviews/:reviewId
   */
  updatePcCaseReview: async (
    pcCaseId: string,
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<ApiResponse<Review>> => {
    return axiosClient.put(`/pc-cases/${pcCaseId}/reviews/${reviewId}`, payload)
  },

  /**
   * Xoá đánh giá cấu hình PC
   * Endpoint: DELETE /api/pc-cases/:id/reviews/:reviewId
   */
  deletePcCaseReview: async (
    pcCaseId: string,
    reviewId: string
  ): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/pc-cases/${pcCaseId}/reviews/${reviewId}`)
  },
}
