import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type {
  RevenueStatistics,
  RevenueStatisticsFilterParams,
  OrderStatistics,
  OrderStatisticsFilterParams,
  TopProduct,
  TopProductFilterParams,
  UserStatistics,
  UserStatisticsFilterParams,
} from "@/types/statistics"

export const statisticsService = {
  /**
   * Thống kê doanh thu theo mốc thời gian (Ngày / Tháng / Năm)
   * Endpoint: GET /api/admin/statistics/revenue
   */
  getRevenueStatistics: async (
    params?: RevenueStatisticsFilterParams
  ): Promise<ApiResponse<RevenueStatistics>> => {
    return axiosClient.get("/admin/statistics/revenue", { params })
  },

  /**
   * Thống kê số lượng đơn hàng theo từng trạng thái và tỷ lệ phần trăm
   * Endpoint: GET /api/admin/statistics/orders
   */
  getOrderStatistics: async (
    params?: OrderStatisticsFilterParams
  ): Promise<ApiResponse<OrderStatistics>> => {
    return axiosClient.get("/admin/statistics/orders", { params })
  },

  /**
   * Lấy danh sách Top sản phẩm bán chạy nhất (theo số lượng hoặc doanh thu)
   * Endpoint: GET /api/admin/statistics/top-products
   */
  getTopProducts: async (
    params?: TopProductFilterParams
  ): Promise<ApiResponse<TopProduct[]>> => {
    return axiosClient.get("/admin/statistics/top-products", { params })
  },

  /**
   * Thống kê người dùng mới và tăng trưởng tài khoản
   * Endpoint: GET /api/admin/statistics/users
   */
  getUserStatistics: async (
    params?: UserStatisticsFilterParams
  ): Promise<ApiResponse<UserStatistics>> => {
    return axiosClient.get("/admin/statistics/users", { params })
  },
}

export default statisticsService
