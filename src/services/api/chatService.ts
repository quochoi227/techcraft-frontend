import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { ChatRequest, ChatResponse } from "@/types/chat"

export const chatService = {
  /**
   * Gửi tin nhắn hỏi đáp đến AI Chatbot TechCraft
   * Hỗ trợ RAG (tra cứu tài liệu chính sách) và PC Recommendation (gợi ý bộ PC Case chuẩn)
   *
   * Endpoint: POST /chat (hoặc /api/chat tùy cấu hình base URL)
   */
  sendMessage: async (payload: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    return axiosClient.post("/chat", payload)
  },
}
