import React from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RagDocument } from "@/types/rag"

interface RagDocumentDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  document: RagDocument | null
  isDeleting: boolean
}

export const RagDocumentDeleteModal: React.FC<RagDocumentDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  document,
  isDeleting,
}) => {
  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Xác nhận xóa tài liệu RAG?
          </h3>
          <p className="text-sm text-slate-500">
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <span className="font-semibold text-slate-800">
              "{document.title}"
            </span>{" "}
            khỏi hệ thống tri thức?
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Tập tin nguồn:</span>
              <span className="font-medium text-slate-800">{document.sourceFile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Số lượng vector chunks:</span>
              <span className="font-medium text-blue-600">
                {document.chunkCount} chunks
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-left flex items-start gap-2 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Toàn bộ vector embeddings liên kết trong bảng <strong>rag_chunks (pgvector)</strong> sẽ bị xóa vĩnh viễn. Chatbot AI sẽ không thể tham chiếu đến nội dung này nữa.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
