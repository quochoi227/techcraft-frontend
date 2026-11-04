import React from "react"
import {
  X,
  FileText,
  Layers,
  HardDrive,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RagDocument } from "@/types/rag"
import { toast } from "sonner"

interface RagDocumentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  document: RagDocument | null
  onDeleteClick: (doc: RagDocument) => void
}

export const RagDocumentDetailModal: React.FC<RagDocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  onDeleteClick,
}) => {
  const [copiedId, setCopiedId] = React.useState(false)

  if (!isOpen || !document) return null

  const handleCopyId = () => {
    navigator.clipboard.writeText(document.id)
    setCopiedId(true)
    toast.success("Đã sao chép Document UUID vào clipboard")
    setTimeout(() => setCopiedId(false), 2000)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB (${bytes.toLocaleString()} bytes)`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Chi tiết Tài liệu RAG
              </h2>
              <p className="text-xs text-slate-500">
                Thông số vector hóa & siêu dữ liệu lưu trữ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Document Title Banner */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Tiêu đề tài liệu
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {document.title}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <span className="text-slate-400">Tệp nguồn:</span>
              <code className="px-2 py-0.5 rounded bg-white border border-blue-200 font-mono text-blue-800 text-xs">
                {document.sourceFile}
              </code>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Số lượng Vector Chunks</span>
              </div>
              <div className="text-xl font-bold text-indigo-600">
                {document.chunkCount}{" "}
                <span className="text-xs font-normal text-slate-500">đoạn</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Đã lập chỉ mục IVFFlat cosine
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                <span>Dung lượng tập tin</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {formatFileSize(document.fileSize)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Văn bản đã qua phân giải
              </p>
            </div>
          </div>

          {/* Technical Specs & Metadata */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mã định danh (UUID):</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-700">
                <span className="max-w-[200px] truncate">{document.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                  title="Sao chép UUID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mô hình Embedding:</span>
              <span className="font-semibold text-slate-800">
                Google Gemini gemini-embedding-2 (3072 chiều)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Cơ sở dữ liệu Vector:</span>
              <span className="font-semibold text-slate-800">
                PostgreSQL + pgvector (Cosine distance &lt;=&gt;)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Thời gian tạo:</span>
              <span className="font-medium text-slate-700">
                {formatDate(document.createdAt)}
              </span>
            </div>

            {document.updatedAt && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Lần cập nhật cuối:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(document.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClose()
              onDeleteClick(document)
            }}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
          >
            Xóa tài liệu này
          </Button>

          <Button type="button" onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
