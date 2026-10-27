export type ProductCategory =
  | 'CPU'
  | 'MAINBOARD'
  | 'RAM'
  | 'GPU'
  | 'STORAGE'
  | 'PSU'
  | 'CASE'
  | 'CPU_COOLER'

// Định dạng hình ảnh trả về từ API Backend
export interface ProductImage {
  id?: string
  imageUrl: string
  primary: boolean
  displayOrder: number
  createdAt?: string
  // Hỗ trợ thêm alias để tương thích linh hoạt
  image_url?: string
  is_primary?: boolean
  display_order?: number
  preview?: string
  file?: File
}

// Payload khi tạo hoặc cập nhật hình ảnh gửi lên Backend
export interface ProductImagePayload {
  id?: string
  image_url: string
  is_primary: boolean
  display_order: number
  file?: File
  preview?: string
}

// Định dạng đối tượng Product từ API Backend
export interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  category: ProductCategory
  description?: string
  detail: Record<string, any>
  images: ProductImage[]
  createdAt?: string
  updatedAt?: string
  active: boolean // Tên trường boolean chuẩn trả về từ Jackson Spring Boot

  // Các trường tiện ích bổ sung cho client (nếu có)
  sku?: string
  brand?: string
  isActive?: boolean // alias của active
  is_active?: boolean // alias của active
  detailSummary?: {
    primary: string
    secondary: string
  }
}

// Kiểu phân trang Spring Data JPA
export interface PageData<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

// Envelope kết quả trả về chung của API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Payload khi gọi API tạo sản phẩm mới (POST /api/products)
export interface ProductCreatePayload {
  name: string
  price: number
  stockQuantity: number
  category: ProductCategory
  description: string
  is_active: boolean
  detail: Record<string, any>
  images: {
    image_url: string
    is_primary: boolean
    display_order: number
  }[]
}

// Alias cho ProductItem để giữ tính tương thích với các component cũ
export type ProductItem = Product
