import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Database,
  Plus,
  Search,
  RotateCw,
  Sparkles,
  Layers,
  HardDrive,
  FileText,
  Trash2,
  Eye,
  Calendar,
  LayoutGrid,
  List,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  RagDocument,
  RagSortOption,
  RagFormatFilter,
} from "@/types/rag"
import { ragService } from "@/services/api/ragService"
import { MOCK_RAG_DOCUMENTS } from "./mockData"
import { RagDocumentUploadModal } from "./components/RagDocumentUploadModal"
import { RagDocumentDeleteModal } from "./components/RagDocumentDeleteModal"
import { RagDocumentDetailModal } from "./components/RagDocumentDetailModal"
import { RagQueryPlayground } from "./components/RagQueryPlayground"
import { RagKnowledgeGuide } from "./components/RagKnowledgeGuide"
import { toast } from "sonner"

export const RagAiPage: React.FC = () => {
  // Data states
  const [documents, setDocuments] = useState<RagDocument[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Active view tab
  const [activeTab, setActiveTab] = useState<"DOCS" | "PLAYGROUND" | "GUIDE">("DOCS")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Search, filter & sorting
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [formatFilter, setFormatFilter] = useState<RagFormatFilter>("ALL")
  const [sortBy, setSortBy] = useState<RagSortOption>("NEWEST")

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)
  const [viewingDocument, setViewingDocument] = useState<RagDocument | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  const [deletingDocument, setDeletingDocument] = useState<RagDocument | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  /**
   * Tải danh sách tài liệu từ Backend API
   */
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await ragService.getAllDocuments()
      const data = res.data

      if (Array.isArray(data)) {
        setDocuments(data)
        setIsUsingFallback(false)
      } else {
        // Nếu API trả về không chuẩn array, fallback sang mock
        setDocuments(MOCK_RAG_DOCUMENTS)
        setIsUsingFallback(true)
      }
    } catch {
      // Backend có thể chưa khởi động hoặc gặp lỗi kết nối
      setDocuments(MOCK_RAG_DOCUMENTS)
      setIsUsingFallback(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  /**
   * Xử lý xác nhận xóa tài liệu
   */
  const handleConfirmDelete = async () => {
    if (!deletingDocument) return

    try {
      setIsDeleting(true)
      await ragService.deleteDocument(deletingDocument.id)
      toast.success(`Đã xóa tài liệu "${deletingDocument.title}" thành công`)
      setIsDeleteModalOpen(false)
      setDeletingDocument(null)
      fetchDocuments()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Xóa tài liệu thất bại. Vui lòng kiểm tra quyền hạn của bạn."
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Tính toán thống kê tổng quan
   */
  const stats = useMemo(() => {
    const totalDocs = documents.length
    const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0)
    const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)

    const formatSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    return {
      totalDocs,
      totalChunks,
      totalSize: formatSize(totalSizeBytes),
    }
  }, [documents])

  /**
   * Lọc và sắp xếp danh sách tài liệu
   */
  const filteredDocuments = useMemo(() => {
    let result = [...documents]

    // 1. Lọc theo từ khóa tìm kiếm (Tiêu đề hoặc tên file gốc)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          doc.sourceFile.toLowerCase().includes(q)
      )
    }

    // 2. Lọc theo định dạng file
    if (formatFilter !== "ALL") {
      result = result.filter((doc) => {
        const ext = doc.sourceFile.split(".").pop()?.toLowerCase()
        if (formatFilter === "PDF") return ext === "pdf"
        if (formatFilter === "DOCX") return ext === "docx"
        if (formatFilter === "TXT_MD") return ext === "txt" || ext === "md"
        return true
      })
    }

    // 3. Sắp xếp
    result.sort((a, b) => {
      switch (sortBy) {
        case "OLDEST":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "TITLE_ASC":
          return a.title.localeCompare(b.title, "vi")
        case "TITLE_DESC":
          return b.title.localeCompare(a.title, "vi")
        case "CHUNKS_DESC":
          return (b.chunkCount || 0) - (a.chunkCount || 0)
        case "SIZE_DESC":
          return (b.fileSize || 0) - (a.fileSize || 0)
        case "NEWEST":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [documents, searchQuery, formatFilter, sortBy])

  /**
   * Helper định dạng dung lượng file
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  /**
   * Helper định dạng ngày tháng
   */
  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  /**
   * Helper render badge định dạng file
   */
  const renderFormatBadge = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "pdf":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            PDF
          </span>
        )
      case "docx":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            DOCX
          </span>
        )
      case "md":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            MD
          </span>
        )
      case "txt":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            TXT
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tài liệu RAG & Hệ tri thức AI
            </h1>
            {isUsingFallback && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Chế độ mô phỏng (Offline)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tài liệu chính sách shop, tự động lập chỉ mục vector embedding (pgvector) cho Chatbot AI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-900 border-slate-200 bg-white"
          >
            <RotateCw
              className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tải lên tài liệu mới
          </Button>
        </div>
      </div>

      {/* Overview Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tài liệu đã nạp</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.totalDocs}{" "}
              <span className="text-xs font-normal text-slate-500">tài liệu</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Vector Chunks</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5">
              {stats.totalChunks}{" "}
              <span className="text-xs font-normal text-slate-500">đoạn</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Dung lượng tri thức</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.totalSize}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Vector Database</div>
            <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>pgvector (3072d)</span>
            </div>
            <div className="text-[11px] text-slate-400">gemini-embedding-2</div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("DOCS")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "DOCS"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Thư viện Tài liệu</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-bold">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PLAYGROUND")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "PLAYGROUND"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Thử nghiệm truy vấn RAG</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 font-bold uppercase">
              Playground
            </span>
          </button>

          <button
            onClick={() => setActiveTab("GUIDE")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "GUIDE"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hướng dẫn & Cấu hình</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DANH SÁCH TÀI LIỆU RAG */}
      {activeTab === "DOCS" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tiêu đề hoặc tên file..."
                className="pl-9 bg-slate-50/50 border-slate-200 text-xs"
              />
            </div>

            {/* Filters and View controls */}
            <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Format Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs shrink-0">
                <button
                  onClick={() => setFormatFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    formatFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFormatFilter("PDF")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    formatFilter === "PDF"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setFormatFilter("DOCX")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    formatFilter === "DOCX"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Word (.docx)
                </button>
                <button
                  onClick={() => setFormatFilter("TXT_MD")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    formatFilter === "TXT_MD"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Text / MD
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as RagSortOption)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none shrink-0"
              >
                <option value="NEWEST">Mới nhất</option>
                <option value="OLDEST">Cũ nhất</option>
                <option value="TITLE_ASC">Tiêu đề (A-Z)</option>
                <option value="TITLE_DESC">Tiêu đề (Z-A)</option>
                <option value="CHUNKS_DESC">Nhiều chunks nhất</option>
                <option value="SIZE_DESC">Dung lượng lớn nhất</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "table"
                      ? "bg-slate-100 text-blue-600"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Xem dạng Bảng"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-slate-100 text-blue-600"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Xem dạng Lưới"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main content table / grid */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Đang tải danh sách tài liệu RAG từ cơ sở dữ liệu...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Database className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery || formatFilter !== "ALL"
                    ? "Không tìm thấy tài liệu phù hợp"
                    : "Chưa có tài liệu RAG nào"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {searchQuery || formatFilter !== "ALL"
                    ? "Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm hoặc từ khóa tra cứu."
                    : "Tải lên các tài liệu chính sách bảo hành, đổi trả hoặc hướng dẫn của cửa hàng để kích hoạt năng lực AI RAG."}
                </p>
              </div>
              {searchQuery || formatFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFormatFilter("ALL")
                  }}
                  className="text-xs"
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tải lên tài liệu đầu tiên
                </Button>
              )}
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Tài liệu & Tệp nguồn</th>
                      <th className="py-3.5 px-4">Định dạng</th>
                      <th className="py-3.5 px-4">Dung lượng</th>
                      <th className="py-3.5 px-4">Số lượng Chunks</th>
                      <th className="py-3.5 px-4">Ngày nạp</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Title & Source File */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                            {doc.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 text-xs">
                            <span className="font-mono text-slate-500">
                              {doc.sourceFile}
                            </span>
                          </div>
                        </td>

                        {/* Format Badge */}
                        <td className="py-3.5 px-4">
                          {renderFormatBadge(doc.sourceFile)}
                        </td>

                        {/* File Size */}
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {formatFileSize(doc.fileSize)}
                        </td>

                        {/* Chunks */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <Layers className="w-3 h-3 text-indigo-500" />
                            <span>{doc.chunkCount} chunks</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setViewingDocument(doc)
                                setIsDetailModalOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Xem chi tiết kỹ thuật"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingDocument(doc)
                                setIsDeleteModalOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Xóa tài liệu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>
                  Hiển thị <strong>{filteredDocuments.length}</strong> trên tổng số{" "}
                  <strong>{documents.length}</strong> tài liệu
                </span>
                <span className="text-[11px] text-slate-400">
                  Tự động đồng bộ hóa với pgvector trên PostgreSQL
                </span>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      {renderFormatBadge(doc.sourceFile)}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-1 truncate">
                        {doc.sourceFile}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {doc.chunkCount} chunks
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingDocument(doc)
                          setIsDetailModalOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingDocument(doc)
                          setIsDeleteModalOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THỬ NGHIỆM TRUY VẤN RAG PLAYGROUND */}
      {activeTab === "PLAYGROUND" && <RagQueryPlayground />}

      {/* TAB 3: HƯỚNG DẪN & CẤU HÌNH KIẾN TRÚC */}
      {activeTab === "GUIDE" && <RagKnowledgeGuide />}

      {/* Modal Tải lên tài liệu */}
      <RagDocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchDocuments()
        }}
      />

      {/* Modal Xóa tài liệu */}
      <RagDocumentDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingDocument(null)
        }}
        onConfirm={handleConfirmDelete}
        document={deletingDocument}
        isDeleting={isDeleting}
      />

      {/* Modal Chi tiết kỹ thuật tài liệu */}
      <RagDocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setViewingDocument(null)
        }}
        document={viewingDocument}
        onDeleteClick={(doc) => {
          setDeletingDocument(doc)
          setIsDeleteModalOpen(true)
        }}
      />
    </div>
  )
}
