export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT"

export interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  usedCount: number
  remainingUses?: number
  userUsageLimit?: number
  active: boolean
  valid?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface VoucherUsageSummary {
  id: string
  orderId: string
  userId: string
  userEmail: string
  userFullName?: string
  discountAmount: number
  usedAt: string
}

export interface VoucherDetail {
  voucher: Voucher
  totalDiscountGiven: number
  totalOrdersCount: number
  recentUsages: VoucherUsageSummary[]
}

export interface ValidateVoucherRequest {
  code: string
  orderAmount: number
}

export interface ValidateVoucherResponse {
  valid: boolean
  voucherId?: string
  code?: string
  name?: string
  description?: string
  discountType?: DiscountType
  discountValue?: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  discountAmount: number
  originalAmount: number
  finalAmount: number
  message: string
}

export interface CreateVoucherPayload {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  userUsageLimit?: number
  isActive?: boolean
}

export interface UpdateVoucherPayload {
  name?: string
  description?: string
  discountType?: DiscountType
  discountValue?: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  userUsageLimit?: number
  isActive?: boolean
}

export interface AdminVoucherFilterParams {
  search?: string
  keyword?: string
  discountType?: DiscountType | "ALL"
  isActive?: boolean
  validOnly?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export interface VoucherFilterParams {
  search?: string
  keyword?: string
  discountType?: DiscountType | "ALL"
  page?: number
  size?: number
}
