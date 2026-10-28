import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Search,
  RotateCw,
  Monitor,
  Eye,
  Edit,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PcCase, CreatePcCasePayload } from '@/types/pcCase'
import { pcCaseService } from '@/services/api/pcCaseService'
import { USE_CASE_OPTIONS, USE_CASE_TABS } from './constants'
import { PcCaseFormModal } from './components/PcCaseFormModal'
import { PcCaseDetailModal } from './components/PcCaseDetailModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { toast } from 'sonner'

export const PcCaseListPage: React.FC = () => {
  // Dữ liệu danh sách PC Case thật từ API
  const [pcCases, setPcCases] = useState<PcCase[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 6
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Bộ lọc & Tìm kiếm
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'UNDER_15M' | '15M_30M' | '30M_50M' | 'OVER_50M'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC'>('NEWEST')

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPcCase, setEditingPcCase] = useState<PcCase | null>(null)
  const [isDuplicateMode, setIsDuplicateMode] = useState(false)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingPcCase, setViewingPcCase] = useState<PcCase | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingPcCase, setDeletingPcCase] = useState<PcCase | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce tìm kiếm
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 350)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  /**
   * Gọi API thật GET /api/admin/pc-cases từ Backend Database
   */
  const fetchPcCases = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)

    // Xác định minPrice, maxPrice theo dropdown
    let minPrice: number | undefined
    let maxPrice: number | undefined
    if (priceFilter === 'UNDER_15M') {
      maxPrice = 15000000
    } else if (priceFilter === '15M_30M') {
      minPrice = 15000000
      maxPrice = 30000000
    } else if (priceFilter === '30M_50M') {
      minPrice = 30000000
      maxPrice = 50000000
    } else if (priceFilter === 'OVER_50M') {
      minPrice = 50000000
    }

    // Xác định trường sort
    let apiSortBy = 'createdAt'
    let apiSortDir: 'asc' | 'desc' = 'desc'

    if (sortBy === 'PRICE_ASC') {
      apiSortBy = 'totalPrice'
      apiSortDir = 'asc'
    } else if (sortBy === 'PRICE_DESC') {
      apiSortBy = 'totalPrice'
      apiSortDir = 'desc'
    } else if (sortBy === 'NAME_ASC') {
      apiSortBy = 'name'
      apiSortDir = 'asc'
    } else if (sortBy === 'OLDEST') {
      apiSortBy = 'createdAt'
      apiSortDir = 'asc'
    }

    try {
      const response = await pcCaseService.getAdminPcCases({
        page: currentPage - 1, // Spring Boot page index là 0-based
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
        useCase: activeTab !== 'ALL' ? activeTab : undefined,
        minPrice,
        maxPrice,
        isActive: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
        sortBy: apiSortBy,
        sortDir: apiSortDir,
      })

      const pageData = (response as any)?.data || response
      if (pageData && Array.isArray(pageData.content)) {
        setPcCases(pageData.content)
        setTotalElements(Number(pageData.totalElements) || pageData.content.length)
        setTotalPages(Math.max(1, Number(pageData.totalPages) || Math.ceil(pageData.content.length / pageSize)))
      } else if (Array.isArray(pageData)) {
        setPcCases(pageData)
        setTotalElements(pageData.length)
        setTotalPages(Math.max(1, Math.ceil(pageData.length / pageSize)))
      } else {
        setPcCases([])
        setTotalElements(0)
        setTotalPages(1)
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách PC Cases từ API:', err)
      const message = err?.response?.data?.message || err?.message || 'Không thể kết nối đến máy chủ Backend'
      setErrorMsg(message)
      setPcCases([])
      setTotalElements(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, activeTab, debouncedSearch, priceFilter, statusFilter, sortBy])

  useEffect(() => {
    fetchPcCases()
  }, [fetchPcCases])

  // Reset toàn bộ bộ lọc
  const handleResetFilters = () => {
    setActiveTab('ALL')
    setSearchQuery('')
    setDebouncedSearch('')
    setPriceFilter('ALL')
    setStatusFilter('ALL')
    setSortBy('NEWEST')
    setCurrentPage(1)
    toast.info('Đã làm mới bộ lọc và danh sách PC Cases')
  }

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingPcCase(null)
    setIsDuplicateMode(false)
    setIsFormModalOpen(true)
  }

  // Mở modal sửa
  const handleOpenEditModal = (pcCase: PcCase) => {
    setEditingPcCase(pcCase)
    setIsDuplicateMode(false)
    setIsFormModalOpen(true)
  }

  // Mở modal nhân bản
  const handleOpenDuplicateModal = (pcCase: PcCase) => {
    setEditingPcCase(pcCase)
    setIsDuplicateMode(true)
    setIsFormModalOpen(true)
  }

  // Mở modal xem chi tiết
  const handleOpenDetailModal = (pcCase: PcCase) => {
    setViewingPcCase(pcCase)
    setIsDetailModalOpen(true)
  }

  // Mở modal xóa
  const handleOpenDeleteModal = (pcCase: PcCase) => {
    setDeletingPcCase(pcCase)
    setIsDeleteModalOpen(true)
  }

  // Thực hiện xóa thật trên Database
  const handleConfirmDelete = async () => {
    if (!deletingPcCase) return
    setIsDeleting(true)
    try {
      await pcCaseService.deletePcCase(deletingPcCase.id)
      toast.success(`Đã xóa thành công cấu hình "${deletingPcCase.name}"`)
      setIsDeleteModalOpen(false)
      setDeletingPcCase(null)
      fetchPcCases()
    } catch (err: any) {
      console.error('Lỗi xóa PC Case:', err)
      const msg = err?.response?.data?.message || 'Xóa cấu hình PC thất bại, vui lòng thử lại!'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Lưu cấu hình thật lên Database (Tạo mới hoặc Sửa hoặc Duplicate)
  const handleSavePcCase = async (
    payload: CreatePcCasePayload,
    targetId?: string
  ): Promise<boolean> => {
    try {
      if (targetId && !isDuplicateMode) {
        await pcCaseService.updatePcCase(targetId, payload)
        toast.success('Cập nhật cấu hình PC Case trong Database thành công!')
      } else {
        await pcCaseService.createPcCase(payload)
        toast.success(
          isDuplicateMode
            ? 'Nhân bản cấu hình PC Case thành công!'
            : 'Tạo cấu hình PC Case mới vào Database thành công!'
        )
      }
      setIsFormModalOpen(false)
      fetchPcCases()
      return true
    } catch (err: any) {
      console.error('Lỗi lưu PC Case:', err)
      const msg = err?.response?.data?.message || 'Lưu cấu hình PC thất bại. Vui lòng kiểm tra lại ràng buộc linh kiện!'
      toast.error(msg)
      return false
    }
  }

  // Helper render chuỗi tóm tắt cấu hình từ các linh kiện THẬT trong Database
  const renderHardwareSummary = (pc: PcCase) => {
    // Nếu có danh sách items thực tế từ Database
    if (pc.items && Array.isArray(pc.items) && pc.items.length > 0) {
      const getComponentShortName = (category: string) => {
        const item = pc.items.find((i) => i.category === category)
        if (!item || !item.product) return null
        const fullName = item.product.name

        // Rút gọn tên linh kiện cho gọn gàng dễ đọc trên table
        if (category === 'CPU') {
          return fullName.split('(')[0].replace('Bộ vi xử lý', '').trim()
        }
        if (category === 'MAINBOARD') {
          return fullName.replace('Bo mạch chủ', '').replace('Mainboard', '').trim()
        }
        if (category === 'GPU') {
          return fullName.replace('Card đồ họa', '').replace('VGA', '').trim()
        }
        if (category === 'RAM') {
          return fullName.replace('Bộ nhớ trong', '').replace('RAM', '').trim()
        }
        if (category === 'STORAGE') {
          return fullName.replace('Ổ cứng lưu trữ', '').replace('Ổ cứng', '').trim()
        }
        if (category === 'PSU') {
          return fullName.replace('Nguồn máy tính', '').trim()
        }
        if (category === 'CASE') {
          return fullName
            .replace(/^Vỏ\s*Case\s*/i, 'Case ')
            .replace(/^Vỏ\s*máy\s*tính\s*/i, 'Case ')
            .trim()
        }
        if (category === 'CPU_COOLER') {
          return fullName
            .replace(/^Tản\s*nhiệt\s*nước\s*/i, 'Tản nước ')
            .replace(/^Tản\s*nhiệt\s*khí\s*/i, 'Tản ')
            .replace(/^Tản\s*nhiệt\s*CPU\s*/i, 'Tản ')
            .replace(/^Tản\s*nhiệt\s*/i, 'Tản ')
            .trim()
        }
        return fullName
      }

      const cpu = getComponentShortName('CPU')
      const mb = getComponentShortName('MAINBOARD')
      const gpu = getComponentShortName('GPU')
      const ram = getComponentShortName('RAM')
      const storage = getComponentShortName('STORAGE')
      const psu = getComponentShortName('PSU')
      const pcCase = getComponentShortName('CASE')
      const cooler = getComponentShortName('CPU_COOLER')

      const parts: { text: string; isGpu: boolean }[] = []
      if (cpu) parts.push({ text: cpu, isGpu: false })
      if (mb) parts.push({ text: mb, isGpu: false })
      if (gpu) parts.push({ text: gpu, isGpu: true })
      if (ram) parts.push({ text: ram, isGpu: false })
      if (storage) parts.push({ text: storage, isGpu: false })
      if (psu) parts.push({ text: psu, isGpu: false })
      if (pcCase) parts.push({ text: pcCase, isGpu: false })
      if (cooler) parts.push({ text: cooler, isGpu: false })

      if (parts.length > 0) {
        return (
          <div className="text-xs text-slate-600 leading-relaxed max-w-xl">
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400 mx-1.5">•</span>}
                <span className={part.isGpu ? 'text-blue-600 font-semibold' : 'text-slate-700'}>
                  {part.text}
                </span>
              </React.Fragment>
            ))}
          </div>
        )
      }
    }

    // Nếu có summaryText hoặc chưa có items
    if (pc.summaryText) {
      const components = pc.summaryText.split('•').map((s) => s.trim())
      return (
        <div className="text-xs text-slate-600 leading-relaxed max-w-xl">
          {components.map((comp, idx) => {
            const isGpu =
              comp.includes('RTX') ||
              comp.includes('GTX') ||
              comp.includes('Radeon') ||
              comp.includes('Intel UHD') ||
              comp.includes('GPU') ||
              comp.includes('Arc')

            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400 mx-1.5">•</span>}
                <span className={isGpu ? 'text-blue-600 font-semibold' : 'text-slate-700'}>
                  {comp}
                </span>
              </React.Fragment>
            )
          })}
        </div>
      )
    }

    return (
      <span className="text-xs text-slate-400 italic">
        (Chưa cấu hình chi tiết linh kiện)
      </span>
    )
  }

  // Helper lấy Badge nhóm nhu cầu
  const getUseCaseBadge = (useCaseKey: string) => {
    const opt = USE_CASE_OPTIONS.find((o) => o.value === useCaseKey)
    if (!opt) {
      return (
        <span className="text-xs px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 font-medium">
          {useCaseKey || 'Chung'}
        </span>
      )
    }
    return (
      <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${opt.badgeClass}`}>
        {opt.label}
      </span>
    )
  }

  // Tính số lượng item hiển thị hiện tại cho phân trang text
  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalElements)

  return (
    <div className="space-y-6">
      {/* 1. Header Trang: Tiêu đề, Mô tả và Nút CTA Tạo mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản lý Cấu hình PC Cases</span>
            <span className="text-slate-500 font-medium text-lg">(PcCaseManagement)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các bộ PC dựng sẵn, kiểm tra 8 ràng buộc tương thích phần cứng và cấp dữ liệu
            gợi ý cho Chatbot AI.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo cấu hình PC mới</span>
        </Button>
      </div>

      {/* 2. Container Khối dữ liệu: Tabs + Filter Bar + Table + Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs phân loại nhóm nhu cầu */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-8 overflow-x-auto">
          {USE_CASE_TABS.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value)
                  setCurrentPage(1)
                }}
                className={`py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Thanh công cụ Tìm kiếm & Lọc (Search & Filter Bar) */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white">
          {/* Ô tìm kiếm theo tên PC Case */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên PC Case"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 transition"
            />
          </div>

          {/* Lọc theo mức giá */}
          <select
            value={priceFilter}
            onChange={(e) => {
              setPriceFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="ALL">Tất cả mức giá</option>
            <option value="UNDER_15M">Dưới 15 triệu</option>
            <option value="15M_30M">Từ 15 - 30 triệu</option>
            <option value="30M_50M">Từ 30 - 50 triệu</option>
            <option value="OVER_50M">Trên 50 triệu</option>
          </select>

          {/* Lọc theo trạng thái phát hành */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ẩn</option>
          </select>

          {/* Sắp xếp */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any)
              setCurrentPage(1)
            }}
            className="h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="NEWEST">Sắp xếp: Mới nhất</option>
            <option value="OLDEST">Sắp xếp: Cũ nhất</option>
            <option value="PRICE_ASC">Sắp xếp: Giá tăng dần</option>
            <option value="PRICE_DESC">Sắp xếp: Giá giảm dần</option>
            <option value="NAME_ASC">Sắp xếp: Tên A-Z</option>
          </select>

          {/* Nút làm mới bộ lọc */}
          <button
            onClick={handleResetFilters}
            title="Làm mới bộ lọc"
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bảng danh sách PC Cases (Data Table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">CẤU HÌNH PC & VỎ CASE</th>
                <th className="py-3.5 px-4">NHÓM NHU CẦU</th>
                <th className="py-3.5 px-4">CẤU HÌNH PHẦN CỨNG TÓM TẮT (8 SLOT)</th>
                <th className="py-3.5 px-6 text-right">TỔNG GIÁ NIÊM YẾT</th>
                <th className="py-3.5 px-6 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                      <span className="font-medium text-slate-600 text-sm">
                        Đang kết nối API và tải danh sách PC Cases từ Database...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                      <p className="font-semibold text-slate-800 text-sm">
                        Không thể kết nối đến máy chủ Backend
                      </p>
                      <p className="text-xs text-slate-500">{errorMsg}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPcCases}
                        className="mt-2 flex items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Thử tải lại</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : pcCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Chưa có cấu hình PC Case nào trong Database
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Chưa tìm thấy cấu hình phù hợp với bộ lọc, hoặc Database chưa có PC Case nào.
                        Hãy bấm "+ Tạo cấu hình PC mới" để tạo cấu hình từ linh kiện thật.
                      </p>
                      <Button
                        size="sm"
                        onClick={handleOpenCreateModal}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Tạo cấu hình PC đầu tiên</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                pcCases.map((pc) => {
                  return (
                    <tr
                      key={pc.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Cột 1: Cấu hình PC & Vỏ Case */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                            <Monitor className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              onClick={() => handleOpenDetailModal(pc)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors block text-sm leading-snug"
                            >
                              {pc.name}
                            </span>
                            {!(pc.isActive ?? pc.active ?? true) && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                (Đang tạm ẩn)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Nhóm nhu cầu */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getUseCaseBadge(pc.useCase)}
                      </td>

                      {/* Cột 3: Cấu hình phần cứng tóm tắt (8 slot) */}
                      <td className="py-4 px-4">
                        {renderHardwareSummary(pc)}
                      </td>

                      {/* Cột 4: Tổng giá niêm yết */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          {new Intl.NumberFormat('vi-VN').format(pc.totalPrice || 0)} đ
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Đã gồm VAT 10%
                        </span>
                      </td>

                      {/* Cột 5: Thao tác (4 nút icon) */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => handleOpenDetailModal(pc)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết cấu hình"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            onClick={() => handleOpenEditModal(pc)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Chỉnh sửa cấu hình"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Nhân bản / Duplicate */}
                          <button
                            onClick={() => handleOpenDuplicateModal(pc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Nhân bản cấu hình này"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => handleOpenDeleteModal(pc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa cấu hình"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Phần Phân trang (Pagination) */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 bg-white">
          <div>
            Hiển thị <span className="font-semibold text-slate-800">{startItem} - {endItem}</span> trong tổng số{' '}
            <span className="font-semibold text-slate-800">{totalElements}</span> cấu hình PC Cases
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Trước */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &lt; Trước
            </button>

            {/* Các số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isLoading}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Nút Tiếp */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Tiếp &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 4. Các Modal tương tác */}
      {/* Modal Form: Tạo mới / Sửa / Nhân bản từ linh kiện thật Database */}
      <PcCaseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePcCase}
        initialData={editingPcCase}
        isDuplicate={isDuplicateMode}
      />

      {/* Modal Xem chi tiết linh kiện thật Database */}
      <PcCaseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        pcCase={viewingPcCase}
        onEdit={(caseToEdit) => handleOpenEditModal(caseToEdit)}
      />

      {/* Modal Xác nhận Xóa */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        pcCase={deletingPcCase}
        isDeleting={isDeleting}
      />
    </div>
  )
}
