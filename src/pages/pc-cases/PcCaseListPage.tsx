import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  Search,
  Grid,
  List,
  ChevronRight,
  Home,
  Bot,
  SlidersHorizontal,
  X,
  AlertCircle,
  ShieldCheck,
  Cpu,
} from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import { pcCaseService } from "@/services/api/pcCaseService"
import { MOCK_PC_CASES_PAGE } from "./mockData"
import {
  USE_CASES_META,
  PC_SORT_OPTIONS,
  type PcSortOptionValue,
  type PriceRangePreset,
  formatPrice,
  calculatePcCaseStock,
} from "./constants"
import { PcCaseCard } from "./components/PcCaseCard"
import { PcCaseFilterSidebar } from "./components/PcCaseFilterSidebar"
import { PcCaseDetailModal } from "./components/PcCaseDetailModal"
import { PcCasePagination } from "./components/PcCasePagination"
import { PcCaseSkeleton } from "./components/PcCaseSkeleton"
import { PcCaseEmptyState } from "./components/PcCaseEmptyState"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export const PcCaseListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // -------------------------------------------------------------
  // Filter States from URL / Initial
  // -------------------------------------------------------------
  const initialUseCase = searchParams.get("useCase") || "ALL"
  const initialSearch = searchParams.get("search") || ""
  const initialMinPrice = searchParams.get("minPrice") || ""
  const initialMaxPrice = searchParams.get("maxPrice") || ""
  const initialInStock = searchParams.get("inStock") === "true"
  const initialSort = (searchParams.get("sort") as PcSortOptionValue) || "NEWEST"
  const initialPage = parseInt(searchParams.get("page") || "0", 10)

  const [selectedUseCase, setSelectedUseCase] = useState<string>(initialUseCase)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

  // Price States
  const [selectedPricePresetId, setSelectedPricePresetId] = useState<string>("all")
  const [minPriceInput, setMinPriceInput] = useState<string>(initialMinPrice)
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialMaxPrice)
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(
    initialMinPrice ? Number(initialMinPrice) : undefined
  )
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(
    initialMaxPrice ? Number(initialMaxPrice) : undefined
  )

  // Stock & Sort & View Mode
  const [onlyInStock, setOnlyInStock] = useState<boolean>(initialInStock)
  const [selectedSort, setSelectedSort] = useState<PcSortOptionValue>(initialSort)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Pagination & Loading & Data
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [pageSize] = useState<number>(12)
  const [pcCases, setPcCases] = useState<PcCase[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Modals & Mobile Drawer
  const [quickViewPcCase, setQuickViewPcCase] = useState<PcCase | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  // -------------------------------------------------------------
  // Synchronize Debounced Search (350ms)
  // -------------------------------------------------------------
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(0)
    }, 350)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  // Sync if URL search params change externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
      setDebouncedSearch(urlSearch)
    }

    const urlUseCase = searchParams.get("useCase") || "ALL"
    if (urlUseCase !== selectedUseCase) {
      setSelectedUseCase(urlUseCase)
    }
  }, [searchParams])

  // -------------------------------------------------------------
  // Update URL search parameters when filters change
  // -------------------------------------------------------------
  useEffect(() => {
    const params: Record<string, string> = {}

    if (selectedUseCase !== "ALL") params.useCase = selectedUseCase
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    if (appliedMinPrice !== undefined) params.minPrice = String(appliedMinPrice)
    if (appliedMaxPrice !== undefined) params.maxPrice = String(appliedMaxPrice)
    if (onlyInStock) params.inStock = "true"
    if (selectedSort !== "NEWEST") params.sort = selectedSort
    if (currentPage > 0) params.page = String(currentPage)

    setSearchParams(params, { replace: true })
  }, [
    selectedUseCase,
    debouncedSearch,
    appliedMinPrice,
    appliedMaxPrice,
    onlyInStock,
    selectedSort,
    currentPage,
    setSearchParams,
  ])

  // -------------------------------------------------------------
  // Fetch PC Cases from Backend API with Fallback
  // -------------------------------------------------------------
  const fetchPcCases = useCallback(async () => {
    setIsLoading(true)

    const currentSortConfig =
      PC_SORT_OPTIONS.find((s) => s.value === selectedSort) || PC_SORT_OPTIONS[0]

    try {
      const response = await pcCaseService.getPcCases({
        page: currentPage,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
        useCase: selectedUseCase !== "ALL" ? selectedUseCase : undefined,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        isActive: true, // Chỉ lấy các cấu hình PC đang kinh doanh
        sortBy: currentSortConfig.sortBy,
        sortDir: currentSortConfig.sortDir,
      })

      const pageData = response?.data || (response as any)
      if (pageData && Array.isArray(pageData.content)) {
        let activeContent = pageData.content.filter(
          (pc: PcCase) => pc.active !== false && pc.isActive !== false
        )

        // Lọc client-side tình trạng linh kiện nếu được chọn
        if (onlyInStock) {
          activeContent = activeContent.filter((pc: PcCase) => calculatePcCaseStock(pc) > 0)
        }

        setPcCases(activeContent)
        setTotalElements(pageData.totalElements ?? activeContent.length)
        setTotalPages(pageData.totalPages ?? 1)
        setIsUsingFallback(false)
      } else {
        throw new Error("Dữ liệu trả về không đúng định dạng PageData")
      }
    } catch (err: any) {
      console.warn(
        "Không thể kết nối đến backend API. Đang sử dụng dữ liệu mẫu dự phòng cho PC Cases:",
        err?.message
      )
      setIsUsingFallback(true)

      // Fallback: Lọc cục bộ trên mockData
      let filtered = [...MOCK_PC_CASES_PAGE.content].filter(
        (pc) => pc.active !== false && pc.isActive !== false
      )

      if (selectedUseCase !== "ALL") {
        filtered = filtered.filter(
          (pc) => pc.useCase?.toLowerCase() === selectedUseCase.toLowerCase()
        )
      }

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        filtered = filtered.filter(
          (pc) =>
            pc.name.toLowerCase().includes(q) ||
            pc.description?.toLowerCase().includes(q)
        )
      }

      if (appliedMinPrice !== undefined) {
        filtered = filtered.filter((pc) => pc.totalPrice >= appliedMinPrice)
      }

      if (appliedMaxPrice !== undefined) {
        filtered = filtered.filter((pc) => pc.totalPrice <= appliedMaxPrice)
      }

      if (onlyInStock) {
        filtered = filtered.filter((pc) => calculatePcCaseStock(pc) > 0)
      }

      // Sort cục bộ
      filtered.sort((a, b) => {
        if (selectedSort === "PRICE_ASC") return a.totalPrice - b.totalPrice
        if (selectedSort === "PRICE_DESC") return b.totalPrice - a.totalPrice
        if (selectedSort === "NAME_ASC") return a.name.localeCompare(b.name)
        if (selectedSort === "NAME_DESC") return b.name.localeCompare(a.name)
        return (
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      })

      const total = filtered.length
      const start = currentPage * pageSize
      const paged = filtered.slice(start, start + pageSize)

      setPcCases(paged)
      setTotalElements(total)
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)))
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    selectedUseCase,
    debouncedSearch,
    appliedMinPrice,
    appliedMaxPrice,
    onlyInStock,
    selectedSort,
  ])

  useEffect(() => {
    fetchPcCases()
  }, [fetchPcCases])

  // -------------------------------------------------------------
  // Filter Handlers
  // -------------------------------------------------------------
  const handleSelectUseCase = (useCase: string) => {
    setSelectedUseCase(useCase)
    setCurrentPage(0)
  }

  const handleSelectPricePreset = (preset: PriceRangePreset) => {
    setSelectedPricePresetId(preset.id)
    if (preset.id === "all") {
      setAppliedMinPrice(undefined)
      setAppliedMaxPrice(undefined)
      setMinPriceInput("")
      setMaxPriceInput("")
    } else {
      setAppliedMinPrice(preset.minPrice)
      setAppliedMaxPrice(preset.maxPrice)
      setMinPriceInput(preset.minPrice ? String(preset.minPrice) : "")
      setMaxPriceInput(preset.maxPrice ? String(preset.maxPrice) : "")
    }
    setCurrentPage(0)
  }

  const handleApplyCustomPrice = () => {
    const min = minPriceInput.trim() ? Number(minPriceInput) : undefined
    const max = maxPriceInput.trim() ? Number(maxPriceInput) : undefined

    if (min !== undefined && max !== undefined && min > max) {
      toast.error("Mức giá tối thiểu không thể lớn hơn mức giá tối đa!")
      return
    }

    setSelectedPricePresetId("custom")
    setAppliedMinPrice(min)
    setAppliedMaxPrice(max)
    setCurrentPage(0)
    toast.success("Đã áp dụng mức ngân sách!")
  }

  const handleToggleInStock = (val: boolean) => {
    setOnlyInStock(val)
    setCurrentPage(0)
  }

  const handleResetFilters = () => {
    setSelectedUseCase("ALL")
    setSearchQuery("")
    setDebouncedSearch("")
    setSelectedPricePresetId("all")
    setMinPriceInput("")
    setMaxPriceInput("")
    setAppliedMinPrice(undefined)
    setAppliedMaxPrice(undefined)
    setOnlyInStock(false)
    setSelectedSort("NEWEST")
    setCurrentPage(0)
    toast.info("Đã đặt lại tất cả bộ lọc")
  }

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedUseCase !== "ALL") count++
    if (debouncedSearch.trim()) count++
    if (appliedMinPrice !== undefined || appliedMaxPrice !== undefined) count++
    if (onlyInStock) count++
    return count
  }, [selectedUseCase, debouncedSearch, appliedMinPrice, appliedMaxPrice, onlyInStock])

  const topUseCasePills: { label: string; value: string }[] = [
    { label: "Tất cả cấu hình", value: "ALL" },
    { label: "Gaming & Esports", value: "gaming" },
    { label: "Đồ họa & Render 3D", value: "rendering" },
    { label: "Học tập & Văn phòng", value: "office" },
    { label: "AI & Deep Learning", value: "ai" },
  ]

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-16">
      {/* ------------------------------------------------------- */}
      {/* 1. Header Banner & Breadcrumbs                          */}
      {/* ------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-purple-100/40 via-white to-transparent border-b border-slate-200/60 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-purple-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Cấu hình PC hoàn chỉnh</span>
            {selectedUseCase !== "ALL" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-purple-600 font-bold">
                  {USE_CASES_META[selectedUseCase]?.label}
                </span>
              </>
            )}
          </nav>

          {/* Title & Tagline & AI CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Linh kiện tương thích • Miễn phí lắp ráp & Test máy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedUseCase === "ALL"
                  ? "Dàn PC Cấu Hình Xây Dựng Sẵn"
                  : USE_CASES_META[selectedUseCase]?.label}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {selectedUseCase === "ALL"
                  ? "Tối ưu hóa sức mạnh phần cứng theo từng phân khúc ngân sách: Gaming Esports, Đồ họa Render 3D, Máy trạm Workstation và AI Deep Learning."
                  : USE_CASES_META[selectedUseCase]?.description}
              </p>
            </div>

            {/* AI Assistant Banner Button */}
            <div className="shrink-0">
              <Link
                to="/ai-consultant"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all group"
              >
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Nhờ AI gợi ý PC theo ngân sách</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick Use Case Tabs */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {topUseCasePills.map((pill) => {
              const isSelected = selectedUseCase === pill.value
              const meta =
                pill.value !== "ALL" ? USE_CASES_META[pill.value] : null
              const Icon = meta?.icon

              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => handleSelectUseCase(pill.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/25 scale-[1.02]"
                      : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  {Icon ? (
                    <Icon className="w-3.5 h-3.5" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  )}
                  <span>{pill.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- */}
      {/* 2. Main Content Area                                    */}
      {/* ------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Offline / Mock Fallback Warning Banner */}
        {isUsingFallback && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Hiện chưa kết nối được máy chủ Backend API.
                Hệ thống đang hiển thị cấu hình mẫu để bạn trải nghiệm đầy đủ giao diện.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPcCases()}
              className="h-8 border-amber-300 text-amber-800 hover:bg-amber-100 text-xs shrink-0"
            >
              Thử lại
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* --------------------------------------------------- */}
          {/* Left Column: Desktop Filter Sidebar (1 col)         */}
          {/* --------------------------------------------------- */}
          <div className="hidden lg:block lg:col-span-1 sticky top-20">
            <PcCaseFilterSidebar
              selectedUseCase={selectedUseCase}
              onSelectUseCase={handleSelectUseCase}
              selectedPricePresetId={selectedPricePresetId}
              onSelectPricePreset={handleSelectPricePreset}
              minPriceInput={minPriceInput}
              maxPriceInput={maxPriceInput}
              onChangeMinPrice={setMinPriceInput}
              onChangeMaxPrice={setMaxPriceInput}
              onApplyCustomPrice={handleApplyCustomPrice}
              onlyInStock={onlyInStock}
              onToggleInStock={handleToggleInStock}
              onResetFilters={handleResetFilters}
              totalCount={totalElements}
            />
          </div>

          {/* --------------------------------------------------- */}
          {/* Right Column: Toolbar & Grid & Pagination (3 cols)  */}
          {/* --------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-5">
            {/* Toolbar Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Input Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên dàn PC, cấu hình, CPU, VGA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("")
                        setDebouncedSearch("")
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  {/* Mobile Filter Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="lg:hidden h-10 gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                    <span>Bộ lọc</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      Sắp xếp:
                    </span>
                    <select
                      value={selectedSort}
                      onChange={(e) => {
                        setSelectedSort(e.target.value as PcSortOptionValue)
                        setCurrentPage(0)
                      }}
                      className="h-10 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 cursor-pointer"
                    >
                      {PC_SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-white text-purple-600 shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Hiển thị dạng lưới"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === "list"
                          ? "bg-white text-purple-600 shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Hiển thị dạng danh sách"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Đang lọc theo:
                  </span>

                  {selectedUseCase !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      Nhu cầu: {USE_CASES_META[selectedUseCase]?.label}
                      <button
                        type="button"
                        onClick={() => handleSelectUseCase("ALL")}
                        className="p-0.5 hover:text-purple-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {debouncedSearch.trim() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Từ khóa: "{debouncedSearch}"
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setDebouncedSearch("")
                        }}
                        className="p-0.5 hover:text-indigo-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(appliedMinPrice !== undefined || appliedMaxPrice !== undefined) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Ngân sách:{" "}
                      {appliedMinPrice !== undefined && appliedMaxPrice !== undefined
                        ? `${formatPrice(appliedMinPrice)} - ${formatPrice(appliedMaxPrice)}`
                        : appliedMinPrice !== undefined
                        ? `Từ ${formatPrice(appliedMinPrice)}`
                        : `Dưới ${formatPrice(appliedMaxPrice!)}`}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPricePresetId("all")
                          setAppliedMinPrice(undefined)
                          setAppliedMaxPrice(undefined)
                          setMinPriceInput("")
                          setMaxPriceInput("")
                        }}
                        className="p-0.5 hover:text-emerald-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {onlyInStock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Chỉ hiện đủ linh kiện
                      <button
                        type="button"
                        onClick={() => handleToggleInStock(false)}
                        className="p-0.5 hover:text-amber-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-slate-500 hover:text-purple-600 underline ml-1"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* PC Cases Grid / List / Skeleton / Empty State */}
            {isLoading ? (
              <PcCaseSkeleton viewMode={viewMode} count={viewMode === "grid" ? 6 : 4} />
            ) : pcCases.length === 0 ? (
              <PcCaseEmptyState
                onResetFilters={handleResetFilters}
                searchQuery={debouncedSearch}
                hasActiveFilters={activeFiltersCount > 0}
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {pcCases.map((pc) => (
                  <PcCaseCard
                    key={pc.id}
                    pcCase={pc}
                    viewMode={viewMode}
                    onQuickView={(p) => setQuickViewPcCase(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && pcCases.length > 0 && (
              <PcCasePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage)
                  window.scrollTo({ top: 200, behavior: "smooth" })
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------- */}
      {/* 3. Mobile Filter Drawer                                 */}
      {/* ------------------------------------------------------- */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                <span>Bộ lọc cấu hình PC</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PcCaseFilterSidebar
                selectedUseCase={selectedUseCase}
                onSelectUseCase={handleSelectUseCase}
                selectedPricePresetId={selectedPricePresetId}
                onSelectPricePreset={handleSelectPricePreset}
                minPriceInput={minPriceInput}
                maxPriceInput={maxPriceInput}
                onChangeMinPrice={setMinPriceInput}
                onChangeMaxPrice={setMaxPriceInput}
                onApplyCustomPrice={handleApplyCustomPrice}
                onlyInStock={onlyInStock}
                onToggleInStock={handleToggleInStock}
                onResetFilters={handleResetFilters}
                totalCount={totalElements}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 4. Quick View Detail Modal                              */}
      {/* ------------------------------------------------------- */}
      <PcCaseDetailModal
        pcCase={quickViewPcCase}
        isOpen={Boolean(quickViewPcCase)}
        onClose={() => setQuickViewPcCase(null)}
      />
    </div>
  )
}
