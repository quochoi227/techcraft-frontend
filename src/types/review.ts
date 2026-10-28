// Định dạng Review trả về từ Backend API
export interface Review {
  id: string
  userId: string
  userEmail?: string
  userFullName?: string
  productId?: string
  productName?: string
  pcCaseId?: string
  pcCaseName?: string
  rating: number // Điểm đánh giá từ 1 đến 5
  comment?: string // Nội dung đánh giá
  createdAt?: string
  updatedAt?: string
}

// Payload khi tạo đánh giá mới (dành cho User đã mua sản phẩm / PC Case)
export interface CreateReviewPayload {
  rating: number
  comment?: string
}

// Payload khi chỉnh sửa đánh giá
export interface UpdateReviewPayload {
  rating: number
  comment?: string
}
