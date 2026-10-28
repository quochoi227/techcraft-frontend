export type ProductCategory =
  | 'CPU'
  | 'MAINBOARD'
  | 'RAM'
  | 'GPU'
  | 'STORAGE'
  | 'PSU'
  | 'CASE'
  | 'CPU_COOLER'

// Định dạng thông tin hình ảnh tải lên Cloudinary thành công
export interface CloudinaryUploadResponse {
  publicId: string
  url: string
  secureUrl: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  originalFilename?: string
  createdAt?: string
}

// Định dạng hình ảnh trả về từ API Backend
export interface ProductImage {
  id?: string
  imageUrl: string
  primary: boolean
  displayOrder: number
  createdAt?: string

  // Hỗ trợ thêm alias để tương thích linh hoạt
  isPrimary?: boolean
  image_url?: string
  is_primary?: boolean
  display_order?: number
  preview?: string
  file?: File
  publicId?: string
}

// Payload của từng hình ảnh khi tạo mới / chỉnh sửa (chuẩn camelCase)
export interface ProductImagePayload {
  id?: string
  imageUrl: string
  isPrimary: boolean
  displayOrder: number
  primary?: boolean
  file?: File
  preview?: string
  publicId?: string

  // Alias tương thích
  image_url?: string
  is_primary?: boolean
  display_order?: number
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
  isActive?: boolean // camelCase alias của active
  is_active?: boolean // snake_case alias của active
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

// Payload khi gọi API tạo mới / chỉnh sửa sản phẩm (toàn bộ field chuẩn camelCase)
export interface ProductCreatePayload {
  name: string
  price: number
  stockQuantity: number
  category: ProductCategory
  description: string
  isActive: boolean
  active?: boolean // dự phòng trường hợp Jackson ánh xạ field active
  detail: Record<string, any>
  images: {
    imageUrl: string
    isPrimary: boolean
    primary?: boolean
    displayOrder: number
  }[]
}

// Alias cho ProductItem để giữ tính tương thích với các component cũ
export type ProductItem = Product
