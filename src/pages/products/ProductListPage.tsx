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
} from "lucide-react"
import type { ProductCategory, Product } from "@/types/product"
import { productService } from "@/services/api/productService"
import { MOCK_PRODUCTS_PAGE } from "@/pages/admin/products/mockData"
import {
  CATEGORIES_META,
  type PriceRangePreset,
  SORT_OPTIONS,
  type SortOptionValue,
  formatPrice,
} from "./constants"
import { ProductCard } from "./components/ProductCard"
import { ProductFilterSidebar } from "./components/ProductFilterSidebar"
import { ProductQuickViewModal } from "./components/ProductQuickViewModal"
import { ProductPagination } from "./components/ProductPagination"
import { ProductSkeleton } from "./components/ProductSkeleton"
import { ProductEmptyState } from "./components/ProductEmptyState"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // -------------------------------------------------------------
  // Filter States from URL / initial
  // -------------------------------------------------------------
  const initialCategory = (searchParams.get("category") as ProductCategory) || "ALL"
  const initialSearch = searchParams.get("search") || ""
  const initialMinPrice = searchParams.get("minPrice") || ""
  const initialMaxPrice = searchParams.get("maxPrice") || ""
  const initialInStock = searchParams.get("inStock") === "true"
  const initialSort = (searchParams.get("sort") as SortOptionValue) || "NEWEST"
  const initialPage = parseInt(searchParams.get("page") || "0", 10)

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "ALL">(initialCategory)
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
  const [selectedSort, setSelectedSort] = useState<SortOptionValue>(initialSort)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Pagination & Loading & Data
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [pageSize] = useState<number>(12)
  const [products, setProducts] = useState<Product[]>([])
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Modals & Mobile Drawer
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  // -------------------------------------------------------------
  // Synchronize Debounced Search (400ms)
  // -------------------------------------------------------------
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

  // Sync state if URL search param 'search' or 'category' changes externally (e.g. Header search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
      setDebouncedSearch(urlSearch)
    }

    const urlCat = (searchParams.get("category") as ProductCategory) || "ALL"
    if (urlCat !== selectedCategory) {
      setSelectedCategory(urlCat)
    }
  }, [searchParams])

  // -------------------------------------------------------------
  // Update URL search parameters when filters change
  // -------------------------------------------------------------
  useEffect(() => {
    const params: Record<string, string> = {}

    if (selectedCategory !== "ALL") params.category = selectedCategory
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    if (appliedMinPrice !== undefined) params.minPrice = String(appliedMinPrice)
    if (appliedMaxPrice !== undefined) params.maxPrice = String(appliedMaxPrice)
    if (onlyInStock) params.inStock = "true"
    if (selectedSort !== "NEWEST") params.sort = selectedSort
    if (currentPage > 0) params.page = String(currentPage)

    setSearchParams(params, { replace: true })
  }, [
    selectedCategory,
    debouncedSearch,
    appliedMinPrice,
    appliedMaxPrice,
    onlyInStock,
    selectedSort,
    currentPage,
    setSearchParams,
  ])

  // -------------------------------------------------------------
  // Fetch Products from Backend API with Fallback
  // -------------------------------------------------------------
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)

    const currentSortConfig =
      SORT_OPTIONS.find((s) => s.value === selectedSort) || SORT_OPTIONS[0]

    try {
      const response = await productService.getProducts({
        page: currentPage,
        size: pageSize,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        search: debouncedSearch.trim() || undefined,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        inStock: onlyInStock ? true : undefined,
        isActive: true, // Chỉ lấy các sản phẩm đang được kích hoạt bán
        sortBy: currentSortConfig.sortBy,
        sortDir: currentSortConfig.sortDir,
      })

      const pageData = response?.data || (response as any)
      if (pageData && Array.isArray(pageData.content)) {
        // Lọc thêm client-side isActive trong trường hợp backend trả về toàn bộ
        const activeContent = pageData.content.filter(
          (p: Product) => p.active !== false && p.isActive !== false
        )
        setProducts(activeContent)
        setTotalElements(pageData.totalElements ?? activeContent.length)
        setTotalPages(pageData.totalPages ?? 1)
        setIsUsingFallback(false)
      } else {
        throw new Error("Dữ liệu trả về không đúng định dạng PageData")
      }
    } catch (err: any) {
      console.warn(
        "Không thể kết nối đến backend API. Đang sử dụng dữ liệu mẫu dự phòng:",
        err?.message
      )
      setIsUsingFallback(true)

      // Fallback: Lọc cục bộ trên mockData
      let filtered = [...MOCK_PRODUCTS_PAGE.content].filter(
        (p) => p.active !== false && p.isActive !== false
      )

      if (selectedCategory !== "ALL") {
        filtered = filtered.filter((p) => p.category === selectedCategory)
      }

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
      }

      if (appliedMinPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= appliedMinPrice)
      }

      if (appliedMaxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= appliedMaxPrice)
      }

      if (onlyInStock) {
        filtered = filtered.filter((p) => (p.stockQuantity ?? 0) > 0)
      }

      // Sort cục bộ
      filtered.sort((a, b) => {
        if (selectedSort === "PRICE_ASC") return a.price - b.price
        if (selectedSort === "PRICE_DESC") return b.price - a.price
        if (selectedSort === "NAME_ASC") return a.name.localeCompare(b.name)
        if (selectedSort === "NAME_DESC") return b.name.localeCompare(a.name)
        if (selectedSort === "STOCK_DESC")
          return (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0)
        return (
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      })

      // Cắt trang cục bộ
      const total = filtered.length
      const start = currentPage * pageSize
      const paged = filtered.slice(start, start + pageSize)

      setProducts(paged)
      setTotalElements(total)
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)))
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    selectedCategory,
    debouncedSearch,
    appliedMinPrice,
    appliedMaxPrice,
    onlyInStock,
    selectedSort,
  ])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // -------------------------------------------------------------
  // Filter Handlers
  // -------------------------------------------------------------
  const handleSelectCategory = (category: ProductCategory | "ALL") => {
    setSelectedCategory(category)
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
      toast.error("Giá tối thiểu không thể lớn hơn giá tối đa!")
      return
    }

    setSelectedPricePresetId("custom")
    setAppliedMinPrice(min)
    setAppliedMaxPrice(max)
    setCurrentPage(0)
    toast.success("Đã áp dụng khoảng giá!")
  }

  const handleToggleInStock = (val: boolean) => {
    setOnlyInStock(val)
    setCurrentPage(0)
  }

  const handleResetFilters = () => {
    setSelectedCategory("ALL")
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
    toast.info("Đã thiết lập lại tất cả bộ lọc")
  }

  // Active Filter Count & Chips
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== "ALL") count++
    if (debouncedSearch.trim()) count++
    if (appliedMinPrice !== undefined || appliedMaxPrice !== undefined) count++
    if (onlyInStock) count++
    return count
  }, [selectedCategory, debouncedSearch, appliedMinPrice, appliedMaxPrice, onlyInStock])

  const topCategoryPills: { label: string; value: ProductCategory | "ALL" }[] = [
    { label: "Tất cả", value: "ALL" },
    { label: "CPU", value: "CPU" },
    { label: "Mainboard", value: "MAINBOARD" },
    { label: "RAM", value: "RAM" },
    { label: "Card VGA", value: "GPU" },
    { label: "Ổ cứng", value: "STORAGE" },
    { label: "Nguồn PSU", value: "PSU" },
    { label: "Vỏ Case", value: "CASE" },
    { label: "Tản nhiệt", value: "CPU_COOLER" },
  ]

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-16">
      {/* ------------------------------------------------------- */}
      {/* 1. Header Banner & Breadcrumbs                          */}
      {/* ------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-blue-100/40 via-white to-transparent border-b border-slate-200/60 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Linh kiện máy tính</span>
            {selectedCategory !== "ALL" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-blue-600 font-bold">
                  {CATEGORIES_META[selectedCategory]?.shortLabel}
                </span>
              </>
            )}
          </nav>

          {/* Title & Tagline & AI CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Linh kiện chính hãng • Bảo hành chính hãng</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory === "ALL"
                  ? "Danh mục Linh kiện Máy tính"
                  : CATEGORIES_META[selectedCategory]?.label}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {selectedCategory === "ALL"
                  ? "Khám phá hàng ngàn linh kiện máy tính hiệu năng cao: CPU Intel/Ryzen, Card đồ họa RTX, RAM DDR5, SSD NVMe và Case cao cấp với giá tốt nhất."
                  : CATEGORIES_META[selectedCategory]?.description}
              </p>
            </div>

            {/* AI Assistant Banner Button */}
            <div className="shrink-0">
              <Link
                to="/ai-consultant"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all group"
              >
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Nhờ AI gợi ý cấu hình PC</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick Category Bar (Carousel / Tabs) */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {topCategoryPills.map((pill) => {
              const isSelected = selectedCategory === pill.value
              const meta =
                pill.value !== "ALL" ? CATEGORIES_META[pill.value] : null
              const Icon = meta?.icon

              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => handleSelectCategory(pill.value)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 scale-[1.02]"
                      : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isSelected ? "text-white" : meta?.colorClass || "text-blue-500"
                      }`}
                    />
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
                Hệ thống đang hiển thị dữ liệu mẫu để bạn trải nghiệm đầy đủ giao diện.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts()}
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
            <ProductFilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
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
                    placeholder="Tìm tên linh kiện, mã sản phẩm, thông số..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
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

                {/* Right controls: Mobile Filter, Sort Dropdown & View Mode */}
                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  {/* Mobile Filter Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="lg:hidden h-10 gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bộ lọc</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>

                  {/* Sort Select */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      Sắp xếp:
                    </span>
                    <select
                      value={selectedSort}
                      onChange={(e) => {
                        setSelectedSort(e.target.value as SortOptionValue)
                        setCurrentPage(0)
                      }}
                      className="h-10 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-xs"
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
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Hiển thị dạng danh sách"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Bar */}
              {activeFiltersCount > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Đang lọc theo:
                  </span>

                  {/* Category Chip */}
                  {selectedCategory !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Danh mục: {CATEGORIES_META[selectedCategory]?.shortLabel}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory("ALL")}
                        className="p-0.5 hover:text-blue-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Search Query Chip */}
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

                  {/* Price Chip */}
                  {(appliedMinPrice !== undefined || appliedMaxPrice !== undefined) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Giá:{" "}
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

                  {/* In Stock Chip */}
                  {onlyInStock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Chỉ còn hàng
                      <button
                        type="button"
                        onClick={() => handleToggleInStock(false)}
                        className="p-0.5 hover:text-amber-900 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Clear all button */}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-600 underline ml-1"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid / List / Skeleton / Empty State */}
            {isLoading ? (
              <ProductSkeleton viewMode={viewMode} count={viewMode === "grid" ? 8 : 4} />
            ) : products.length === 0 ? (
              <ProductEmptyState
                onResetFilters={handleResetFilters}
                searchQuery={debouncedSearch}
                hasActiveFilters={activeFiltersCount > 0}
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && products.length > 0 && (
              <ProductPagination
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
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Bộ lọc sản phẩm</span>
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
              <ProductFilterSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
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
      {/* 4. Quick View Modal                                     */}
      {/* ------------------------------------------------------- */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
