import axiosClient from "./axiosClient"
import type { ApiResponse } from "@/types/product"
import type { RagDocument } from "@/types/rag"

export const ragService = {
  /**
   * [ADMIN] Lấy danh sách tất cả tài liệu RAG đã được nạp vào hệ thống
   * Endpoint: GET /api/admin/rag/documents
   */
  getAllDocuments: async (): Promise<ApiResponse<RagDocument[]>> => {
    return axiosClient.get("/admin/rag/documents")
  },

  /**
   * [ADMIN] Tải lên và lập chỉ mục (index vector embeddings) tài liệu RAG mới
   * Hỗ trợ định dạng: .pdf, .docx, .txt, .md (tối đa 15MB)
   * Endpoint: POST /api/admin/rag/documents
   */
  uploadDocument: async (
    file: File,
    title?: string
  ): Promise<ApiResponse<RagDocument>> => {
    const formData = new FormData()
    formData.append("file", file)
    if (title && title.trim()) {
      formData.append("title", title.trim())
    }

    return axiosClient.post("/admin/rag/documents", formData)
  },

  /**
   * [ADMIN] Xóa tài liệu RAG theo ID (Đồng thời xóa toàn bộ vector chunks liên quan trong pgvector)
   * Endpoint: DELETE /api/admin/rag/documents/:id
   */
  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/admin/rag/documents/${id}`)
  },
}
