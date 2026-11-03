import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { User, UpdateProfilePayload } from "@/types/auth"

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
}
