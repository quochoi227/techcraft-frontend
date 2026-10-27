import axiosClient from "./axiosClient"
import type {
  ApiResponse,
  PageData,
  Product,
  ProductCategory,
  ProductCreatePayload,
} from "@/types/product"

export interface ProductQueryParams {
  page?: number
  size?: number
  category?: ProductCategory
  search?: string
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export const productService = {
  /**
   * Lấy danh sách sản phẩm có phân trang, tìm kiếm và lọc theo danh mục
   */
  getProducts: async (
    params?: ProductQueryParams
  ): Promise<ApiResponse<PageData<Product>>> => {
    return axiosClient.get("/products", { params })
  },

  /**
   * Lấy chi tiết thông tin một sản phẩm
   */
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return axiosClient.get(`/products/${id}`)
  },

  /**
   * Tạo sản phẩm linh kiện mới (Dành cho Admin)
   */
  createProduct: async (
    payload: ProductCreatePayload
  ): Promise<ApiResponse<Product>> => {
    return axiosClient.post("/products", payload)
  },

  /**
   * Cập nhật thông tin sản phẩm linh kiện (Dành cho Admin)
   */
  updateProduct: async (
    id: string,
    payload: Partial<ProductCreatePayload>
  ): Promise<ApiResponse<Product>> => {
    return axiosClient.put(`/products/${id}`, payload)
  },

  /**
   * Xoá mềm sản phẩm linh kiện (Dành cho Admin)
   */
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/products/${id}`)
  },

  /**
   * Upload hình ảnh lên Cloudinary qua Backend
   */
  uploadImage: async (file: File, folder: string = "products"): Promise<ApiResponse<{ url: string; publicId: string }>> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)
    return axiosClient.post("/images/upload", formData)
  },
}
