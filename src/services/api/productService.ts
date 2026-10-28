import axiosClient from "./axiosClient"
import { imageService } from "./imageService"
import type {
  ApiResponse,
  CloudinaryUploadResponse,
  PageData,
  Product,
  ProductCategory,
  ProductCreatePayload,
  ProductUpdatePayload,
} from "@/types/product"

export interface ProductQueryParams {
  page?: number
  size?: number
  category?: ProductCategory | string
  search?: string
  keyword?: string
  name?: string
  isActive?: boolean
  sortBy?: "createdAt" | "price" | "name" | "stockQuantity" | "updatedAt" | string
  sortDir?: "asc" | "desc"
  sort?: string
}

export const productService = {
  /**
   * Lấy danh sách sản phẩm có phân trang, tìm kiếm và lọc theo danh mục
   * Endpoint: GET /api/products
   * Backend nhận: page, size, category, search, isActive, sortBy, sortDir
   */
  getProducts: async (
    params?: ProductQueryParams
  ): Promise<ApiResponse<PageData<Product>>> => {
    const queryParams: Record<string, any> = { ...params }

    // Tự động phân tách chuỗi sort dạng "price,asc" thành sortBy và sortDir nếu có
    if (queryParams.sort && typeof queryParams.sort === "string") {
      const [field, dir] = queryParams.sort.split(",")
      if (field && !queryParams.sortBy) {
        queryParams.sortBy = field.trim()
      }
      if (dir && !queryParams.sortDir) {
        queryParams.sortDir = dir.trim().toLowerCase()
      }
      delete queryParams.sort
    }

    return axiosClient.get("/products", { params: queryParams })
  },

  /**
   * Lấy chi tiết thông tin một sản phẩm
   * Endpoint: GET /api/products/:id
   */
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return axiosClient.get(`/products/${id}`)
  },

  /**
   * Tạo sản phẩm linh kiện mới (Dành cho Admin)
   * Endpoint: POST /api/products
   */
  createProduct: async (
    payload: ProductCreatePayload
  ): Promise<ApiResponse<Product>> => {
    return axiosClient.post("/products", payload)
  },

  /**
   * Cập nhật thông tin sản phẩm linh kiện (Dành cho Admin)
   * Endpoint: PUT /api/products/:id
   */
  updateProduct: async (
    id: string,
    payload: ProductUpdatePayload
  ): Promise<ApiResponse<Product>> => {
    return axiosClient.put(`/products/${id}`, payload)
  },

  /**
   * Xoá mềm sản phẩm linh kiện (Dành cho Admin)
   * Endpoint: DELETE /api/products/:id
   */
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/products/${id}`)
  },

  /**
   * Upload hình ảnh lên Cloudinary qua Backend
   * Endpoint: POST /api/images/upload
   */
  uploadImage: async (
    file: File,
    folder?: string
  ): Promise<ApiResponse<CloudinaryUploadResponse>> => {
    return imageService.uploadImage(file, folder)
  },
}
