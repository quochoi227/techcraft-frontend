import type { RagDocument } from "@/types/rag"

export const MOCK_RAG_DOCUMENTS: RagDocument[] = [
  {
    id: "d1e4a6a0-5678-4a12-8e99-112233445501",
    title: "Chính sách bảo hành và đổi trả linh kiện máy tính",
    sourceFile: "chinh-sach-bao-hanh-doi-tra.pdf",
    fileSize: 245760, // ~240 KB
    chunkCount: 14,
    createdAt: "2026-10-15T08:30:00Z",
    updatedAt: "2026-10-15T08:30:00Z",
  },
  {
    id: "d1e4a6a0-5678-4a12-8e99-112233445502",
    title: "Quy định giao hàng toàn quốc và thanh toán COD",
    sourceFile: "quy-dinh-giao-hang-cod.docx",
    fileSize: 104857, // ~102 KB
    chunkCount: 8,
    createdAt: "2026-10-18T10:15:00Z",
    updatedAt: "2026-10-18T10:15:00Z",
  },
  {
    id: "d1e4a6a0-5678-4a12-8e99-112233445503",
    title: "Nguyên tắc tương thích phần cứng và tiêu chuẩn build PC",
    sourceFile: "huong-dan-tuong-thich-pc.md",
    fileSize: 58320, // ~57 KB
    chunkCount: 19,
    createdAt: "2026-10-22T14:45:00Z",
    updatedAt: "2026-10-22T14:45:00Z",
  },
  {
    id: "d1e4a6a0-5678-4a12-8e99-112233445504",
    title: "Chính sách thanh toán thẻ, chuyển khoản và xuất hóa đơn VAT",
    sourceFile: "chinh-sach-thanh-toan-vat.pdf",
    fileSize: 184320, // ~180 KB
    chunkCount: 6,
    createdAt: "2026-10-25T09:20:00Z",
    updatedAt: "2026-10-25T09:20:00Z",
  },
  {
    id: "d1e4a6a0-5678-4a12-8e99-112233445505",
    title: "Quy trình hỗ trợ kỹ thuật và bảo hành tại chỗ cho PC Case",
    sourceFile: "bao-hanh-pc-case-tan-noi.txt",
    fileSize: 28400, // ~28 KB
    chunkCount: 5,
    createdAt: "2026-11-01T16:00:00Z",
    updatedAt: "2026-11-01T16:00:00Z",
  },
]
