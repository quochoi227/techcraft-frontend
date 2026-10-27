import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { AuthResponseData, RefreshTokenResponseData } from "@/types/auth"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone: string
  password: string
}

export const authService = {
  /**
   * Đăng ký tài khoản người dùng mới
   */
  register: async (payload: RegisterRequest): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/register", payload)
  },

  /**
   * Đăng nhập hệ thống (Lấy Access Token và Cookie Refresh Token)
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
    return axiosClient.post("/auth/login", credentials)
  },

  /**
   * Làm mới Access Token thông qua HttpOnly Cookie Refresh Token
   */
  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponseData>> => {
    return axiosClient.post("/auth/refresh")
  },

  /**
   * Đăng xuất hệ thống (Thu hồi Refresh Token và xóa cookie)
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/logout")
  },

  /**
   * Xác thực tài khoản email qua token
   */
  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    return axiosClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
  },
}
