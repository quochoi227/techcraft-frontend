import type { OrderStatus } from "./order"
import type { ProductCategory } from "./product"

export type TimePeriod = "DAY" | "MONTH" | "YEAR"

export type TopProductSortBy = "QUANTITY" | "REVENUE"

export interface RevenueTimelinePoint {
  date: string
  label: string
  revenue: number
  orderCount: number
}

export interface RevenueStatistics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  period: TimePeriod
  timeline: RevenueTimelinePoint[]
}

export interface OrderStatusBreakdown {
  status: OrderStatus
  statusName: string
  count: number
  percentage: number
}

export interface OrderStatistics {
  totalOrders: number
  pendingCount: number
  confirmedCount: number
  shippingCount: number
  deliveredCount: number
  cancelledCount: number
  breakdown: OrderStatusBreakdown[]
}

export interface TopProduct {
  productId: string
  productName: string
  category: ProductCategory
  primaryImageUrl: string | null
  currentPrice: number
  stockQuantity: number
  totalQuantitySold: number
  totalRevenue: number
}

export interface UserTimelinePoint {
  date: string
  label: string
  newUsersCount: number
}

export interface UserStatistics {
  totalUsers: number
  newUsersInPeriod: number
  activeUsers: number
  verifiedUsers: number
  period: TimePeriod
  timeline: UserTimelinePoint[]
}

export interface RevenueStatisticsFilterParams {
  period?: TimePeriod
  startDate?: string
  endDate?: string
}

export interface OrderStatisticsFilterParams {
  startDate?: string
  endDate?: string
}

export interface TopProductFilterParams {
  limit?: number
  sortBy?: TopProductSortBy
  startDate?: string
  endDate?: string
}

export interface UserStatisticsFilterParams {
  period?: TimePeriod
  startDate?: string
  endDate?: string
}
