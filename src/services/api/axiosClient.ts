import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"

// URL gốc của Backend API (ưu tiên biến môi trường VITE_API_BASE_URL)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"

/**
 * Khởi tạo Axios Instance chính cho toàn bộ ứng dụng
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // Quan trọng: Cho phép trình duyệt gửi/nhận HttpOnly Cookies (Refresh Token)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

/**
 * Instance riêng biệt dùng để gọi refresh token
 * Tránh bị lặp vô hạn qua interceptor chính khi refresh token thất bại
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

// Trạng thái phục vụ cơ chế hàng đợi khi đồng thời có nhiều request gặp lỗi 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token)
    } else {
      promise.reject(error)
    }
  })
  failedQueue = []
}

/**
 * ----------------------------------------------------------------------
 * 1. REQUEST INTERCEPTOR: Tự động đính kèm Access Token vào Header
 * ----------------------------------------------------------------------
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy Access Token từ Zustand Store
    const token = useAuthStore.getState().accessToken

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Nếu dữ liệu gửi đi là FormData (upload file/hình ảnh), xóa Content-Type để trình duyệt tự sinh boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"]
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * ----------------------------------------------------------------------
 * 2. RESPONSE INTERCEPTOR: Xử lý kết quả trả về, Auto Refresh Token & Error Handling
 * ----------------------------------------------------------------------
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu trực tiếp giúp code ngắn gọn
    return response.data
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Nếu không có response (Lỗi mạng hoặc server không phản hồi)
    if (!error.response) {
      toast.error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn!"
      )
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const errorMessage = data?.message || "Đã xảy ra lỗi không xác định"

    // ------------------------------------------------------------------
    // XỬ LÝ LỖI 401 UNAUTHORIZED (Cơ chế Silent Refresh Token)
    // ------------------------------------------------------------------
    if (status === 401 && originalRequest) {
      const url = originalRequest.url || ""

      // Nếu lỗi 401 xảy ra ở các API login/register/refresh thì không thử refresh lại
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh")
      ) {
        return Promise.reject(error)
      }

      // Nếu request này chưa từng được retry
      if (!originalRequest._retry) {
        originalRequest._retry = true

        // Nếu đang trong quá trình refresh từ một request khác, đẩy request này vào hàng đợi chờ
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newToken: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                }
                resolve(axiosClient(originalRequest))
              },
              reject: (err) => {
                reject(err)
              },
            })
          })
        }

        isRefreshing = true

        try {
          // Gọi API refresh token (Refresh Token nằm trong HttpOnly Cookie)
          const refreshRes = await refreshClient.post("/auth/refresh")
          const newAccessToken =
            refreshRes.data?.data?.accessToken ||
            refreshRes.data?.accessToken ||
            refreshRes.data

          if (newAccessToken && typeof newAccessToken === "string") {
            // Lưu token mới vào Zustand Auth Store
            useAuthStore.getState().setAccessToken(newAccessToken)

            // Cập nhật header cho request ban đầu
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }

            // Giải phóng hàng đợi chờ
            processQueue(null, newAccessToken)

            // Thực thi lại request ban đầu với token mới
            return axiosClient(originalRequest)
          } else {
            throw new Error("Không tìm thấy accessToken mới từ phản hồi refresh")
          }
        } catch (refreshError: any) {
          // Refresh thất bại (Refresh Token hết hạn hoặc bị revoke)
          processQueue(refreshError, null)
          useAuthStore.getState().clearAuth()

          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
            id: "session-expired",
          })

          // Chuyển hướng người dùng về trang đăng nhập nếu cần
          if (!window.location.pathname.includes("/login")) {
            window.location.href = `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`
          }

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    // ------------------------------------------------------------------
    // XỬ LÝ CÁC MÃ LỖI HTTP KHÁC
    // ------------------------------------------------------------------
    switch (status) {
      case 400:
        // Lỗi kiểm tra dữ liệu hoặc cú pháp
        toast.error(errorMessage)
        break

      case 403:
        toast.error("Bạn không có quyền thực hiện chức năng này!", {
          id: "forbidden-error",
        })
        break

      case 404:
        // Tài nguyên không tìm thấy
        break

      case 500:
      case 502:
      case 503:
        toast.error("Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau!", {
          id: "server-error",
        })
        break

      default:
        toast.error(errorMessage)
        break
    }

    return Promise.reject(error)
  }
)

export default axiosClient
