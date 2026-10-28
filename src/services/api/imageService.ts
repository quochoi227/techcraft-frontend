import axiosClient from "./axiosClient"
import type { ApiResponse, CloudinaryUploadResponse } from "@/types/product"

export const imageService = {
  /**
   * Upload 1 hình ảnh lên Cloudinary qua Backend
   * Endpoint: POST /api/images/upload (hoặc /api/admin/images/upload)
   *
   * Response mẫu trả về:
   * {
   *   "success": true,
   *   "message": "Tải hình ảnh lên Cloudinary thành công!",
   *   "data": {
   *     "publicId": "techcraft-product-images/z4gwa4ujm7zmg4wzjyqs",
   *     "url": "http://res.cloudinary.com/dkg5xoyc0/image/upload/v1793115266/techcraft-product-images/z4gwa4ujm7zmg4wzjyqs.jpg",
   *     "secureUrl": "https://res.cloudinary.com/dkg5xoyc0/image/upload/v1793115266/techcraft-product-images/z4gwa4ujm7zmg4wzjyqs.jpg",
   *     "format": "jpg",
   *     "width": 4896,
   *     "height": 3264,
   *     "bytes": 2684024,
   *     "originalFilename": "chrome_wallpaper.jpg",
   *     "createdAt": "2026-10-27T15:34:26Z"
   *   }
   * }
   */
  uploadImage: async (
    file: File,
    folder?: string
  ): Promise<ApiResponse<CloudinaryUploadResponse>> => {
    const formData = new FormData()
    formData.append("file", file)
    if (folder) {
      formData.append("folder", folder)
    }
    return axiosClient.post("/images/upload", formData)
  },

  /**
   * Upload danh sách nhiều hình ảnh lên Cloudinary qua Backend (tối đa 10 ảnh/lần)
   * Endpoint: POST /api/images/upload-multiple
   */
  uploadMultipleImages: async (
    files: File[],
    folder?: string
  ): Promise<ApiResponse<CloudinaryUploadResponse[]>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    if (folder) {
      formData.append("folder", folder)
    }
    return axiosClient.post("/images/upload-multiple", formData)
  },

  /**
   * Xoá hình ảnh khỏi Cloudinary qua query param
   * Endpoint: DELETE /api/images?publicId={publicId}
   */
  deleteImage: async (publicId: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete("/images", {
      params: { publicId },
    })
  },
}
