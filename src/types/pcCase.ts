import type { Product, ProductCategory } from './product'
import type { Review } from './review'

// Nhóm nhu cầu PC Case
export type PcCaseUseCase =
  | 'gaming'
  | 'rendering'
  | 'office'
  | 'ai'
  | string

export interface PcCaseItem {
  id?: string
  category: ProductCategory
  productId: string
  product?: Product
}

export interface PcCase {
  id: string
  name: string
  useCase: string // 'gaming' | 'rendering' | 'office' | 'ai' ...
  totalPrice: number
  description?: string
  isActive: boolean
  active?: boolean // Jackson alias
  items: PcCaseItem[]

  // Đánh giá và thống kê điểm số từ Backend
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  createdAt?: string
  updatedAt?: string

  // Helper hiển thị cho UI
  summaryText?: string
}

export interface PcCaseItemPayload {
  category: ProductCategory
  productId: string
}

export interface CreatePcCasePayload {
  name: string
  useCase: string
  description?: string
  isActive?: boolean
  items?: PcCaseItemPayload[]
  productIds?: string[]
  components?: Record<string, string>
}

// Payload khi cập nhật PC Case (tuyệt đối không gửi field reviews để tránh mất dữ liệu đánh giá trong Database)
export interface UpdatePcCasePayload extends CreatePcCasePayload {}

export interface ValidatePcCasePayload {
  items?: PcCaseItemPayload[]
  productIds?: string[]
  components?: Record<string, string>
}

export interface CompatibilityResult {
  compatible: boolean
  violations: string[]
}

export interface PcCaseQueryParams {
  page?: number
  size?: number
  search?: string
  keyword?: string
  useCase?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  sortBy?: 'createdAt' | 'totalPrice' | 'name' | 'updatedAt' | string
  sortDir?: 'asc' | 'desc'
}
