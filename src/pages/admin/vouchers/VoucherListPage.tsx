import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Ticket,
  Plus,
  Search,
  RotateCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import type {
  Voucher,
  DiscountType,
  AdminVoucherFilterParams,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "@/types/voucher"
import {
  formatVND,
  formatDiscountValue,
  getVoucherStatusInfo,
  DISCOUNT_TYPES,
  DISCOUNT_TYPE_META,
} from "./constants"
import { MOCK_ADMIN_VOUCHERS, MOCK_ADMIN_VOUCHERS_PAGE } from "./mockData"
import { VoucherFormModal } from "./components/VoucherFormModal"
import { VoucherDetailModal } from "./components/VoucherDetailModal"
import { VoucherDeleteModal } from "./components/VoucherDeleteModal"
import { voucherService } from "@/services/api/voucherService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export const VoucherListPage: React.FC = () => {
  // Data States
  const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_ADMIN_VOUCHERS_PAGE.content)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Pagination (0-based)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [pageSize] = useState<number>(10)
  const [totalElements, setTotalElements] = useState<number>(MOCK_ADMIN_VOUCHERS_PAGE.totalElements)
  const [totalPages, setTotalPages] = useState<number>(MOCK_ADMIN_VOUCHERS_PAGE.totalPages)

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [discountTypeFilter, setDiscountTypeFilter] = useState<DiscountType | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "VALID_ONLY">("ALL")
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "DISCOUNT_DESC" | "EXPIRING_SOON">("NEWEST")

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [voucherToEdit, setVoucherToEdit] = useState<Voucher | null>(null)
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false)

  const [selectedVoucherForDetail, setSelectedVoucherForDetail] = useState<Voucher | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Debounce search input
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(0)
    }, 400)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  /**
   * Fetch vouchers from GET /api/admin/vouchers
   */
  const fetchVouchers = useCallback(
    async (pageToFetch: number = currentPage) => {
      setIsLoading(true)

      let apiSortBy: string = "createdAt"
      let apiSortDir: "asc" | "desc" = "desc"

      switch (sortBy) {
        case "OLDEST":
          apiSortBy = "createdAt"
          apiSortDir = "asc"
          break
        case "DISCOUNT_DESC":
          apiSortBy = "discountValue"
          apiSortDir = "desc"
          break
        case "EXPIRING_SOON":
          apiSortBy = "endDate"
          apiSortDir = "asc"
          break
        case "NEWEST":
        default:
          apiSortBy = "createdAt"
          apiSortDir = "desc"
          break
      }

      let isActiveParam: boolean | undefined = undefined
      let validOnlyParam: boolean | undefined = undefined

      if (statusFilter === "ACTIVE") isActiveParam = true
      if (statusFilter === "INACTIVE") isActiveParam = false
      if (statusFilter === "VALID_ONLY") validOnlyParam = true

      const params: AdminVoucherFilterParams = {
        page: pageToFetch,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
        discountType: discountTypeFilter !== "ALL" ? discountTypeFilter : undefined,
        isActive: isActiveParam,
        validOnly: validOnlyParam,
        sortBy: apiSortBy,
        sortDir: apiSortDir,
      }

      try {
        const response = await voucherService.getAllVouchers(params)
        const pageData = response?.data || (response as any)

        if (pageData && Array.isArray(pageData.content)) {
          setVouchers(pageData.content)
          setTotalElements(pageData.totalElements ?? pageData.content.length)
          setTotalPages(pageData.totalPages ?? 1)
          setCurrentPage(pageData.page ?? pageToFetch)
          setIsUsingFallback(false)
        } else {
          throw new Error("Phản hồi danh sách voucher không hợp lệ")
        }
      } catch (err: any) {
        console.warn("Chuyển sang fallback mock data voucher:", err?.message)
        setIsUsingFallback(true)

        let filtered = [...MOCK_ADMIN_VOUCHERS]
        if (discountTypeFilter !== "ALL") {
          filtered = filtered.filter((v) => v.discountType === discountTypeFilter)
        }
        if (statusFilter === "ACTIVE") {
          filtered = filtered.filter((v) => v.active === true)
        } else if (statusFilter === "INACTIVE") {
          filtered = filtered.filter((v) => v.active === false)
        } else if (statusFilter === "VALID_ONLY") {
          filtered = filtered.filter((v) => v.valid === true)
        }

        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase().trim()
          filtered = filtered.filter(
            (v) =>
              v.code.toLowerCase().includes(q) ||
              v.name.toLowerCase().includes(q) ||
              (v.description || "").toLowerCase().includes(q)
          )
        }

        filtered.sort((a, b) => {
          if (sortBy === "DISCOUNT_DESC") return (b.discountValue || 0) - (a.discountValue || 0)
          if (sortBy === "EXPIRING_SOON") {
            return new Date(a.endDate || 0).getTime() - new Date(b.endDate || 0).getTime()
          }
          if (sortBy === "OLDEST") {
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })

        setVouchers(filtered)
        setTotalElements(filtered.length)
        setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)))
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, pageSize, debouncedSearch, discountTypeFilter, statusFilter, sortBy]
  )

  useEffect(() => {
    fetchVouchers(currentPage)
  }, [fetchVouchers, currentPage])

  // KPI Calculations
  const stats = useMemo(() => {
    const list = isUsingFallback ? MOCK_ADMIN_VOUCHERS : vouchers
    const total = list.length
    const active = list.filter((v) => v.active && new Date(v.endDate) > new Date()).length
    const paused = list.filter((v) => !v.active).length
    const expired = list.filter((v) => new Date(v.endDate) <= new Date()).length
    const totalUsed = list.reduce((sum, v) => sum + (v.usedCount || 0), 0)

    return { total, active, paused, expired, totalUsed }
  }, [vouchers, isUsingFallback])

  // Copy code helper
  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    toast.success(`Đã sao chép mã ${code}!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Toggle active status
  const handleToggleStatus = async (voucher: Voucher, e: React.MouseEvent) => {
    e.stopPropagation()
    setTogglingId(voucher.id)

    try {
      if (isUsingFallback) {
        setVouchers((prev) =>
          prev.map((v) => (v.id === voucher.id ? { ...v, active: !v.active } : v))
        )
        toast.success(
          `Đã ${!voucher.active ? "kích hoạt" : "tạm dừng"} mã giảm giá ${voucher.code}`
        )
      } else {
        const res = await voucherService.toggleVoucherStatus(voucher.id)
        const updated = res?.data || (res as any)
        setVouchers((prev) =>
          prev.map((v) => (v.id === voucher.id ? { ...v, ...updated } : v))
        )
        toast.success(res?.message || "Cập nhật trạng thái thành công!")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái")
    } finally {
      setTogglingId(null)
    }
  }

  // Handle Create / Update Submit
  const handleFormSubmit = async (
    payload: CreateVoucherPayload | UpdateVoucherPayload,
    id?: string
  ) => {
    setIsSubmittingForm(true)
    try {
      if (id) {
        // Edit mode
        if (isUsingFallback) {
          setVouchers((prev) =>
            prev.map((v) =>
              v.id === id ? { ...v, ...(payload as any), active: (payload as any).isActive } : v
            )
          )
          toast.success("Cập nhật mã giảm giá thành công! (Mock)")
        } else {
          const res = await voucherService.updateVoucher(id, payload as UpdateVoucherPayload)
          toast.success(res?.message || "Cập nhật mã giảm giá thành công!")
          await fetchVouchers(currentPage)
        }
      } else {
        // Create mode
        if (isUsingFallback) {
          const newVoucher: Voucher = {
            id: `v-mock-${Date.now()}`,
            usedCount: 0,
            active: (payload as any).isActive !== false,
            valid: true,
            createdAt: new Date().toISOString(),
            ...(payload as CreateVoucherPayload),
          }
          setVouchers((prev) => [newVoucher, ...prev])
          toast.success("Tạo mã giảm giá mới thành công! (Mock)")
        } else {
          const res = await voucherService.createVoucher(payload as CreateVoucherPayload)
          toast.success(res?.message || "Tạo mã giảm giá thành công!")
          await fetchVouchers(0)
        }
      }
      setIsFormModalOpen(false)
      setVoucherToEdit(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Không thể lưu mã giảm giá")
    } finally {
      setIsSubmittingForm(false)
    }
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true)
    try {
      if (isUsingFallback) {
        setVouchers((prev) => prev.filter((v) => v.id !== id))
        toast.success("Đã xóa mã giảm giá thành công! (Mock)")
      } else {
        const res = await voucherService.deleteVoucher(id)
        toast.success(res?.message || "Xóa mã giảm giá thành công!")
        await fetchVouchers(currentPage)
      }
      setIsDeleteModalOpen(false)
      setVoucherToDelete(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Không thể xóa mã giảm giá")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setDiscountTypeFilter("ALL")
    setStatusFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(0)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Quản lý mã giảm giá</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {totalElements} voucher
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập các chương trình ưu đãi, phiếu giảm giá và theo dõi hiệu suất chuyển đổi đơn hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchVouchers(currentPage)}
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-10 px-4"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            <span className="font-semibold text-xs">Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setVoucherToEdit(null)
              setIsFormModalOpen(true)
            }}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-4 font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-xs">Tạo mã giảm giá mới</span>
          </Button>
        </div>
      </div>

      {/* Fallback Banner */}
      {isUsingFallback && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-800 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ dự phòng (Offline Mock):</strong> Không kết nối được Backend API hoặc đang khởi động server. Đang hiển thị dữ liệu mẫu để thử nghiệm.
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchVouchers(currentPage)}
            className="text-amber-900 underline font-semibold shrink-0 hover:text-amber-950"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Vouchers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng voucher</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400">Toàn bộ mã đã tạo</p>
        </div>

        {/* Active Vouchers */}
        <div
          onClick={() => {
            setStatusFilter("ACTIVE")
            setCurrentPage(0)
          }}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${
            statusFilter === "ACTIVE"
              ? "border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20"
              : "border-slate-200/80 hover:border-emerald-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Đang hoạt động</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.active}</div>
          <p className="text-[11px] text-slate-400">Khách có thể áp dụng</p>
        </div>

        {/* Paused Vouchers */}
        <div
          onClick={() => {
            setStatusFilter("INACTIVE")
            setCurrentPage(0)
          }}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${
            statusFilter === "INACTIVE"
              ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20"
              : "border-slate-200/80 hover:border-amber-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Đang tạm dừng</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.paused}</div>
          <p className="text-[11px] text-slate-400">Đã tắt công tắc kích hoạt</p>
        </div>

        {/* Expired Vouchers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase tracking-wider">Hết hạn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.expired}</div>
          <p className="text-[11px] text-slate-400">Quá thời gian kết thúc</p>
        </div>

        {/* Total Redemptions */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">Lượt sử dụng</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black">{stats.totalUsed}</div>
          <p className="text-[11px] text-blue-200">Tổng số lượt áp dụng</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo Mã voucher hoặc Tên chương trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Discount Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={discountTypeFilter}
              onChange={(e) => {
                setDiscountTypeFilter(e.target.value as any)
                setCurrentPage(0)
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DISCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
                setCurrentPage(0)
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đang tạm dừng</option>
              <option value="VALID_ONLY">Khả dụng (Hợp lệ)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any)
                setCurrentPage(0)
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NEWEST">Mới tạo trước</option>
              <option value="OLDEST">Cũ nhất trước</option>
              <option value="DISCOUNT_DESC">Mức giảm: Cao xuống thấp</option>
              <option value="EXPIRING_SOON">Sắp hết hạn trước</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              title="Đặt lại bộ lọc"
              className="h-10 w-full lg:w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center p-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 rounded-lg w-1/4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy mã giảm giá nào
              </h3>
              <p className="text-xs text-slate-500">
                Không có voucher nào khớp với tiêu chí tìm kiếm hoặc trạng thái bạn đang chọn.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl text-xs font-semibold"
            >
              Xóa bộ lọc tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Voucher</th>
                  <th className="py-3.5 px-4">Chương trình</th>
                  <th className="py-3.5 px-4">Mức giảm</th>
                  <th className="py-3.5 px-4">Đơn tối thiểu</th>
                  <th className="py-3.5 px-4">Lượt dùng</th>
                  <th className="py-3.5 px-4">Thời hạn</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {vouchers.map((voucher) => {
                  const statusInfo = getVoucherStatusInfo(voucher)
                  const typeMeta =
                    DISCOUNT_TYPE_META[voucher.discountType] || DISCOUNT_TYPE_META.FIXED_AMOUNT
                  const isCopied = copiedId === voucher.code

                  const formatShortDate = (iso?: string) => {
                    if (!iso) return "—"
                    return new Date(iso).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  }

                  const usagePercent =
                    voucher.usageLimit && voucher.usageLimit > 0
                      ? Math.min(100, Math.round(((voucher.usedCount || 0) / voucher.usageLimit) * 100))
                      : null

                  return (
                    <tr
                      key={voucher.id}
                      onClick={() => {
                        setSelectedVoucherForDetail(voucher)
                        setIsDetailModalOpen(true)
                      }}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            {voucher.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(voucher.code, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                            title="Sao chép mã"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name & Desc */}
                      <td className="py-4 px-4 min-w-[200px] max-w-[280px]">
                        <p className="font-bold text-slate-900 truncate">{voucher.name}</p>
                        {voucher.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {voucher.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 block">
                            {formatDiscountValue(voucher)}
                          </span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${typeMeta.badgeClass}`}
                          >
                            {typeMeta.shortLabel}
                          </span>
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                        {voucher.minOrderAmount && voucher.minOrderAmount > 0
                          ? formatVND(voucher.minOrderAmount)
                          : "0 ₫"}
                      </td>

                      {/* Usage Progress */}
                      <td className="py-4 px-4 whitespace-nowrap min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">
                              {voucher.usedCount || 0}
                            </span>
                            <span className="text-slate-400">
                              {voucher.usageLimit ? `/ ${voucher.usageLimit}` : "lượt"}
                            </span>
                          </div>
                          {usagePercent !== null && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  usagePercent >= 100
                                    ? "bg-rose-500"
                                    : usagePercent >= 80
                                    ? "bg-amber-500"
                                    : "bg-blue-600"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Validity Dates */}
                      <td className="py-4 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatShortDate(voucher.startDate)}</span>
                        </div>
                        <div className="text-slate-400">đến {formatShortDate(voucher.endDate)}</div>
                      </td>

                      {/* Status & Active Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(voucher, e)}
                            disabled={togglingId === voucher.id}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                              voucher.active ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title={voucher.active ? "Nhấn để tạm dừng" : "Nhấn để kích hoạt"}
                          >
                            <span
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                                voucher.active ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVoucherForDetail(voucher)
                              setIsDetailModalOpen(true)
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVoucherToEdit(voucher)
                              setIsFormModalOpen(true)
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Chỉnh sửa voucher"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVoucherToDelete(voucher)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Trang <strong className="text-slate-800">{currentPage + 1}</strong> trên{" "}
              <strong className="text-slate-800">{totalPages}</strong> ({totalElements} voucher)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 0 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="h-8 rounded-xl text-xs font-bold gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="h-8 rounded-xl text-xs font-bold gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <VoucherFormModal
        isOpen={isFormModalOpen}
        voucherToEdit={voucherToEdit}
        onClose={() => {
          setIsFormModalOpen(false)
          setVoucherToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmittingForm}
      />

      {/* Detail Modal */}
      <VoucherDetailModal
        isOpen={isDetailModalOpen}
        voucherId={selectedVoucherForDetail?.id || null}
        initialVoucher={selectedVoucherForDetail}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedVoucherForDetail(null)
        }}
      />

      {/* Delete Confirmation Modal */}
      <VoucherDeleteModal
        isOpen={isDeleteModalOpen}
        voucher={voucherToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setVoucherToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
