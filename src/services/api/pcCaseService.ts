import axiosClient from './axiosClient'
import type { ApiResponse, PageData } from '@/types/product'
import type {
  PcCase,
  CreatePcCasePayload,
  UpdatePcCasePayload,
  ValidatePcCasePayload,
  CompatibilityResult,
  PcCaseQueryParams,
} from '@/types/pcCase'

export const pcCaseService = {
  /**
   * Lấy danh sách PC Case cho trang quản trị (Admin)
   * Endpoint: GET /admin/pc-cases (hoặc GET /pc-cases)
   */
  getAdminPcCases: async (
    params?: PcCaseQueryParams
  ): Promise<ApiResponse<PageData<PcCase>>> => {
    return axiosClient.get('/admin/pc-cases', { params })
  },

  /**
   * Lấy danh sách PC Case công khai (Public)
   * Endpoint: GET /pc-cases
   */
  getPcCases: async (
    params?: PcCaseQueryParams
  ): Promise<ApiResponse<PageData<PcCase>>> => {
    return axiosClient.get('/pc-cases', { params })
  },

  /**
   * Lấy thông tin chi tiết một bộ PC Case
   * Endpoint: GET /admin/pc-cases/:id hoặc GET /pc-cases/:id
   */
  getPcCaseById: async (id: string): Promise<ApiResponse<PcCase>> => {
    return axiosClient.get(`/pc-cases/${id}`)
  },

  /**
   * Tạo mới cấu hình PC Case (Admin)
   * Endpoint: POST /admin/pc-cases
   */
  createPcCase: async (
    payload: CreatePcCasePayload
  ): Promise<ApiResponse<PcCase>> => {
    return axiosClient.post('/admin/pc-cases', payload)
  },

  /**
   * Cập nhật cấu hình PC Case (Admin)
   * Endpoint: PUT /admin/pc-cases/:id
   */
  updatePcCase: async (
    id: string,
    payload: UpdatePcCasePayload
  ): Promise<ApiResponse<PcCase>> => {
    return axiosClient.put(`/admin/pc-cases/${id}`, payload)
  },

  /**
   * Xoá cấu hình PC Case (Admin)
   * Endpoint: DELETE /admin/pc-cases/:id
   */
  deletePcCase: async (id: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/admin/pc-cases/${id}`)
  },

  /**
   * Kiểm tra 8 ràng buộc tương thích phần cứng (Admin)
   * Endpoint: POST /admin/pc-cases/validate
   */
  validatePcCase: async (
    payload: ValidatePcCasePayload
  ): Promise<ApiResponse<CompatibilityResult>> => {
    return axiosClient.post('/admin/pc-cases/validate', payload)
  },
}
