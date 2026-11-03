import type { PcCase } from "./pcCase"

/**
 * Định nghĩa vai trò của người gửi trong hội thoại
 */
export type ChatRole = "user" | "assistant" | "model"

/**
 * Tin nhắn gửi lên Backend
 */
export interface ChatMessage {
  role: ChatRole
  content: string
}

/**
 * Ý định của người dùng do IntentClassifier phân loại
 */
export type ChatIntent =
  | "POLICY_INQUIRY"      // Hỏi về chính sách, bảo hành, đổi trả, ship... (query RAG)
  | "PC_RECOMMENDATION"   // Hỏi về tư vấn, build cấu hình PC (query PC Cases)
  | "HYBRID"              // Kết hợp cả hai
  | "GENERAL_CHAT"         // Chào hỏi xã giao

/**
 * Dữ liệu gửi lên API POST /chat
 */
export interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

/**
 * Dữ liệu trả về từ Backend API POST /chat
 */
export interface ChatResponse {
  reply: string
  suggestedPcCases: PcCase[]
  policySources: string[]
  detectedIntent: ChatIntent
  timestamp: string
}

/**
 * Dữ liệu tin nhắn hiển thị trên giao diện người dùng
 */
export interface UiChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  suggestedPcCases?: PcCase[]
  policySources?: string[]
  detectedIntent?: ChatIntent
  timestamp: string
  status?: "pending" | "success" | "error"
  errorMessage?: string
}

/**
 * Mẫu câu hỏi gợi ý cho người dùng
 */
export interface SuggestedPrompt {
  id: string
  title: string
  prompt: string
  category: "pc_build" | "policy" | "compatibility" | "general"
  badge: string
}
