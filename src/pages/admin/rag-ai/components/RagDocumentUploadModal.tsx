import React, { useState, useRef } from "react"
import {
  Upload,
  X,
  FileText,
  FileCode,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ragService } from "@/services/api/ragService"
import { toast } from "sonner"

interface RagDocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"]

export const RagDocumentUploadModal: React.FC<RagDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>("")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  // Trích xuất tiêu đề mặc định đẹp mắt từ tên file
  const generateDefaultTitle = (filename: string): string => {
    const dotIndex = filename.lastIndexOf(".")
    const baseName = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename
    return baseName
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  const handleFileValidation = (file: File): boolean => {
    setErrorMessage(null)

    // Kiểm tra định dạng
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Định dạng file '${ext}' không được hỗ trợ. Vui lòng tải file .pdf, .docx, .txt hoặc .md`
      )
      return false
    }

    // Kiểm tra kích thước <= 15MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("Kích thước file vượt quá 15MB. Vui lòng nén hoặc chia nhỏ tài liệu.")
      return false
    }

    if (file.size === 0) {
      setErrorMessage("Tập tin tải lên không chứa nội dung (dung lượng 0 bytes).")
      return false
    }

    setSelectedFile(file)
    if (!title.trim()) {
      setTitle(generateDefaultTitle(file.name))
    }
    return true
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileValidation(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileValidation(files[0])
    }
  }

  const handleRemoveFile = () => {
    if (isUploading) return
    setSelectedFile(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleResetModal = () => {
    setSelectedFile(null)
    setTitle("")
    setErrorMessage(null)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn tập tin tài liệu cần tải lên.")
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage(null)

      const finalTitle = title.trim() || generateDefaultTitle(selectedFile.name)
      await ragService.uploadDocument(selectedFile, finalTitle)

      toast.success(
        `Đã tải lên và lập chỉ mục vector thành công cho tài liệu "${finalTitle}"!`,
        { duration: 4000 }
      )
      handleResetModal()
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Tải lên tài liệu thất bại. Vui lòng kiểm tra lại cấu hình Backend và Gemini API."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  // Định dạng kích thước file
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Icon phù hợp theo loại file
  const renderFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (ext === "pdf") {
      return (
        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
          PDF
        </div>
      )
    }
    if (ext === "docx") {
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
          DOCX
        </div>
      )
    }
    if (ext === "md") {
      return (
        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <FileCode className="w-5 h-5" />
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
        <FileText className="w-5 h-5" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Tải lên & Lập chỉ mục RAG
              </h2>
              <p className="text-xs text-slate-500">
                Trích xuất nội dung văn bản và tạo vector embedding tự động vào pgvector
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isUploading) {
                handleResetModal()
                onClose()
              }
            }}
            disabled={isUploading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Vùng Drag & Drop */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tập tin văn bản chính sách <span className="text-rose-500">*</span>
            </Label>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-7 text-center transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/70 scale-[0.99]"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/70 bg-slate-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Kéo thả file vào đây hoặc <span className="text-blue-600 underline">duyệt từ máy</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Định dạng hỗ trợ: <strong className="text-slate-700">PDF, DOCX, TXT, Markdown (.md)</strong> (Tối đa 15MB)
                </p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-slate-200/60 text-[11px] text-slate-600">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nội dung văn bản phải rõ ràng để AI phân đoạn chunk chính xác</span>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {renderFileIcon(selectedFile.name)}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(selectedFile.size)} • Sẵn sàng nạp vector
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-8 px-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Trường Tiêu đề tài liệu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="doc-title"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Tiêu đề tài liệu RAG
              </Label>
              <span className="text-[11px] text-slate-400">
                (Tùy chọn - Tự động trích từ tên file nếu để trống)
              </span>
            </div>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chính sách bảo hành & đổi trả linh kiện 2026"
              disabled={isUploading}
              className="bg-white"
            />
            <p className="text-[11px] text-slate-500">
              Tiêu đề sẽ được lưu làm định danh tài liệu và hỗ trợ tìm kiếm trong thư viện tri thức.
            </p>
          </div>

          {/* Quy trình xử lý RAG & pgvector minh họa */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Quy trình Lập chỉ mục Vector tự động (Backend Engine):</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Trích xuất toàn bộ văn bản bằng <strong>Apache PDFBox / POI</strong>
              </li>
              <li>
                Chia đoạn ngữ nghĩa thành các <strong>text chunks 500-1000 ký tự</strong>
              </li>
              <li>
                Gọi <strong>Gemini Embedding API (gemini-embedding-2)</strong> tạo vector 3072 chiều cho từng chunk
              </li>
              <li>
                Lưu trữ chunks vào PostgreSQL với <strong>pgvector (IVFFlat cosine similarity)</strong>
              </li>
            </ol>
          </div>

          {/* Loading status khi đang upload */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-blue-950">
                  Đang phân tích văn bản và tạo Vector Embeddings...
                </p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Quá trình có thể mất từ 5 - 15 giây tùy thuộc vào độ dài của tài liệu. Vui lòng không đóng trình duyệt.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleResetModal()
                onClose()
              }}
              disabled={isUploading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý RAG...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Nạp vào hệ tri thức
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
