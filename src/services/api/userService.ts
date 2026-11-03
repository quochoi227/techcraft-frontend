import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { PageResponse } from "@/types/order"
import type {
  User,
  UpdateProfilePayload,
  AdminUserFilterParams,
  AdminUpdateUserPayload,
} from "@/types/auth"

export const userService = {
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   * Endpoint: GET /api/users/profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return axiosClient.get("/users/profile")
  },

  /**
   * Cập nhật thông tin cá nhân của người dùng hiện tại
   * Endpoint: PUT /api/users/profile
   */
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<User>> => {
    return axiosClient.put("/users/profile", payload)
  },

  /**
   * [ADMIN] Lấy danh sách tất cả người dùng kèm bộ lọc & phân trang
   * Endpoint: GET /api/admin/users
   */
  getAdminUsers: async (
    params?: AdminUserFilterParams
  ): Promise<ApiResponse<PageResponse<User>>> => {
    const cleanParams: any = { ...params }
    if (cleanParams.role === "ALL") {
      delete cleanParams.role
    }
    if (cleanParams.active === "ALL" || cleanParams.active === undefined) {
      delete cleanParams.active
    }
    return axiosClient.get("/admin/users", { params: cleanParams })
  },

  /**
   * [ADMIN] Lấy thông tin chi tiết một người dùng theo ID
   * Endpoint: GET /api/admin/users/:id
   */
  getAdminUserById: async (id: string): Promise<ApiResponse<User>> => {
    return axiosClient.get(`/admin/users/${id}`)
  },

  /**
   * [ADMIN] Cập nhật thông tin người dùng (họ tên, email, sđt, địa chỉ, role, active, emailVerified)
   * Endpoint: PUT /api/admin/users/:id
   */
  adminUpdateUser: async (
    id: string,
    payload: AdminUpdateUserPayload
  ): Promise<ApiResponse<User>> => {
    return axiosClient.put(`/admin/users/${id}`, payload)
  },

  /**
   * [ADMIN] Cập nhật trạng thái hoạt động (kích hoạt / khóa tài khoản)
   * Endpoint: PATCH /api/admin/users/:id/status
   */
  updateUserStatus: async (
    id: string,
    active: boolean
  ): Promise<ApiResponse<User>> => {
    return axiosClient.patch(`/admin/users/${id}/status`, { active })
  },
}
