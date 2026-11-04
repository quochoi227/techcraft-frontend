/**
 * Types cho module Quản lý Tài liệu RAG (Retrieval-Augmented Generation) & AI
 */

export type RagFileExtension = 'pdf' | 'docx' | 'txt' | 'md'

export interface RagDocument {
  id: string
  title: string
  sourceFile: string
  fileSize: number // tính bằng bytes
  chunkCount: number
  createdAt: string // ISO string
  updatedAt?: string // ISO string
}

export interface RagUploadPayload {
  file: File
  title?: string
}

export interface RagStats {
  totalDocuments: number
  totalChunks: number
  totalSizeBytes: number
}

export type RagSortOption =
  | 'NEWEST'
  | 'OLDEST'
  | 'TITLE_ASC'
  | 'TITLE_DESC'
  | 'CHUNKS_DESC'
  | 'SIZE_DESC'

export type RagFormatFilter = 'ALL' | 'PDF' | 'DOCX' | 'TXT_MD'
