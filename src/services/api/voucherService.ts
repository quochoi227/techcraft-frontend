import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { PageResponse } from "@/types/order"
import type {
  Voucher,
  VoucherDetail,
  ValidateVoucherRequest,
  ValidateVoucherResponse,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  AdminVoucherFilterParams,
  VoucherFilterParams,
} from "@/types/voucher"

export const voucherService = {
  // =========================================================================
  // CLIENT / PUBLIC ENDPOINTS
  // =========================================================================

  /**
   * Lấy danh sách mã giảm giá công khai (phân trang, tìm kiếm)
   * Endpoint: GET /api/vouchers
   */
  getPublicVouchers: async (
    params?: VoucherFilterParams
  ): Promise<ApiResponse<PageResponse<Voucher>>> => {
    const cleanParams: any = { ...params }
    if (cleanParams.discountType === "ALL") {
      delete cleanParams.discountType
    }
    return axiosClient.get("/vouchers", { params: cleanParams })
  },

  /**
   * Lấy danh sách các mã giảm giá đang khả dụng để người dùng áp dụng khi checkout
   * Endpoint: GET /api/vouchers/available
   */
  getAvailableVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return axiosClient.get("/vouchers/available")
  },

  /**
   * Lấy chi tiết thông tin mã giảm giá theo Code
   * Endpoint: GET /api/vouchers/:code
   */
  getVoucherByCode: async (code: string): Promise<ApiResponse<Voucher>> => {
    return axiosClient.get(`/vouchers/${encodeURIComponent(code)}`)
  },

  /**
   * Kiểm tra tính hợp lệ của voucher với số tiền đơn hàng
   * Endpoint: POST /api/vouchers/validate
   */
  validateVoucher: async (
    payload: ValidateVoucherRequest
  ): Promise<ApiResponse<ValidateVoucherResponse>> => {
    return axiosClient.post("/vouchers/validate", payload)
  },

  // =========================================================================
  // ADMIN VOUCHER ENDPOINTS
  // =========================================================================

  /**
   * Lấy danh sách tất cả mã giảm giá hệ thống (Admin, phân trang, lọc)
   * Endpoint: GET /api/admin/vouchers
   */
  getAllVouchers: async (
    params?: AdminVoucherFilterParams
  ): Promise<ApiResponse<PageResponse<Voucher>>> => {
    const cleanParams: any = { ...params }
    if (cleanParams.discountType === "ALL") {
      delete cleanParams.discountType
    }
    return axiosClient.get("/admin/vouchers", { params: cleanParams })
  },

  /**
   * Xem chi tiết voucher kèm thống kê và lịch sử sử dụng (Admin)
   * Endpoint: GET /api/admin/vouchers/:id
   */
  getVoucherDetail: async (id: string): Promise<ApiResponse<VoucherDetail>> => {
    return axiosClient.get(`/admin/vouchers/${id}`)
  },

  /**
   * Tạo mã giảm giá mới (Admin)
   * Endpoint: POST /api/admin/vouchers
   */
  createVoucher: async (
    payload: CreateVoucherPayload
  ): Promise<ApiResponse<Voucher>> => {
    return axiosClient.post("/admin/vouchers", payload)
  },

  /**
   * Cập nhật thông tin mã giảm giá (Admin)
   * Endpoint: PUT /api/admin/vouchers/:id
   */
  updateVoucher: async (
    id: string,
    payload: UpdateVoucherPayload
  ): Promise<ApiResponse<Voucher>> => {
    return axiosClient.put(`/admin/vouchers/${id}`, payload)
  },

  /**
   * Xóa mã giảm giá (Admin)
   * Endpoint: DELETE /api/admin/vouchers/:id
   */
  deleteVoucher: async (id: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/admin/vouchers/${id}`)
  },

  /**
   * Bật / tắt trạng thái kích hoạt mã giảm giá (Admin)
   * Endpoint: PATCH /api/admin/vouchers/:id/status
   */
  toggleVoucherStatus: async (id: string): Promise<ApiResponse<Voucher>> => {
    return axiosClient.patch(`/admin/vouchers/${id}/status`)
  },
}

export default voucherService
