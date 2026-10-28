import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Plus,
  Search,
  RotateCw,
  Cpu,
  CircuitBoard,
  Layers,
  Sparkles,
  HardDrive,
  Zap,
  Box,
  Wind,
  ChevronDown,
  Trash2,
  Edit,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import type { ProductCategory, Product, ProductCreatePayload } from "@/types/product"
import { MOCK_PRODUCTS_PAGE } from "./mockData"
import { ProductFormModal } from "./components/ProductFormModal"
import { productService } from "@/services/api/productService"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

// Danh sách các tab danh mục
const CATEGORY_TABS: { label: string; value: ProductCategory | "ALL"; count?: number }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "CPU", value: "CPU" },
  { label: "MAINBOARD", value: "MAINBOARD" },
  { label: "RAM", value: "RAM" },
  { label: "GPU", value: "GPU" },
  { label: "STORAGE", value: "STORAGE" },
  { label: "PSU", value: "PSU" },
  { label: "CASE", value: "CASE" },
  { label: "CPU_COOLER", value: "CPU_COOLER" },
]

export const ProductListPage: React.FC = () => {
  // State dữ liệu sản phẩm từ API
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS_PAGE.content)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Phân trang Spring Data JPA (0-based)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [pageSize] = useState<number>(8)
  const [totalElements, setTotalElements] = useState<number>(MOCK_PRODUCTS_PAGE.totalElements)
  const [totalPages, setTotalPages] = useState<number>(MOCK_PRODUCTS_PAGE.totalPages)

  // Bộ lọc & Tìm kiếm
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [sortBy, setSortBy] = useState<
    "NEWEST" | "OLDEST" | "PRICE_ASC" | "PRICE_DESC" | "STOCK_DESC" | "NAME_ASC" | "NAME_DESC"
  >("NEWEST")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Debounce tìm kiếm 400ms
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
   * Gọi API GET /api/products
   */
  const fetchProducts = useCallback(
    async (pageToFetch: number = currentPage) => {
      setIsLoading(true)

      // Chuyển đổi trạng thái sắp xếp theo đúng quy chuẩn Backend:
      // Backend (ProductFilterRequest): sortBy ("createdAt" | "price" | "name" | "stockQuantity") và sortDir ("asc" | "desc")
      let apiSortBy: "createdAt" | "price" | "name" | "stockQuantity" = "createdAt"
      let apiSortDir: "asc" | "desc" = "desc"

      switch (sortBy) {
        case "PRICE_ASC":
          apiSortBy = "price"
          apiSortDir = "asc"
          break
        case "PRICE_DESC":
          apiSortBy = "price"
          apiSortDir = "desc"
          break
        case "STOCK_DESC":
          apiSortBy = "stockQuantity"
          apiSortDir = "desc"
          break
        case "NAME_ASC":
          apiSortBy = "name"
          apiSortDir = "asc"
          break
        case "NAME_DESC":
          apiSortBy = "name"
          apiSortDir = "desc"
          break
        case "OLDEST":
          apiSortBy = "createdAt"
          apiSortDir = "asc"
          break
        case "NEWEST":
        default:
          apiSortBy = "createdAt"
          apiSortDir = "desc"
          break
      }

      try {
        const response = await productService.getProducts({
          page: pageToFetch,
          size: pageSize,
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          search: debouncedSearch.trim() || undefined,
          sortBy: apiSortBy,
          sortDir: apiSortDir,
          isActive: statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined,
        })

        // Bóc tách dữ liệu từ envelope ApiResponse
        const pageData = response?.data || (response as any)
        if (pageData && Array.isArray(pageData.content)) {
          setProducts(pageData.content)
          setTotalElements(pageData.totalElements ?? pageData.content.length)
          setTotalPages(pageData.totalPages ?? 1)
          setCurrentPage(pageData.page ?? pageToFetch)
          setIsUsingFallback(false)
        } else {
          throw new Error("Phản hồi từ API không đúng định dạng PageData")
        }
      } catch (err: any) {
        console.warn("Không thể tải danh sách sản phẩm từ backend API. Đang sử dụng Mock Data dự phòng:", err.message)
        setIsUsingFallback(true)

        // Lọc mock data dự phòng cục bộ khi backend chưa mở
        let mockList = MOCK_PRODUCTS_PAGE.content
        if (selectedCategory !== "ALL") {
          mockList = mockList.filter((p) => p.category === selectedCategory)
        }
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase()
          mockList = mockList.filter((p) => p.name.toLowerCase().includes(q))
        }
        // Sắp xếp mock data dự phòng tương ứng
        mockList = [...mockList].sort((a, b) => {
          if (sortBy === "PRICE_ASC") return a.price - b.price
          if (sortBy === "PRICE_DESC") return b.price - a.price
          if (sortBy === "STOCK_DESC") return b.stockQuantity - a.stockQuantity
          if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name)
          if (sortBy === "NAME_DESC") return b.name.localeCompare(a.name)
          if (sortBy === "OLDEST") {
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })
        setProducts(mockList)
        setTotalElements(mockList.length)
        setTotalPages(Math.max(1, Math.ceil(mockList.length / pageSize)))
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, pageSize, selectedCategory, debouncedSearch, sortBy, statusFilter]
  )

  // Tự động gọi API khi mount hoặc khi các bộ lọc thay đổi
  useEffect(() => {
    fetchProducts(currentPage)
  }, [fetchProducts, currentPage])

  // Lọc thêm mức tồn kho cục bộ (nếu backend chưa có filter mức tồn cụ thể)
  const displayedProducts = products.filter((p) => {
    if (stockFilter === "IN_STOCK" && p.stockQuantity <= 5) return false
    if (stockFilter === "LOW_STOCK" && (p.stockQuantity === 0 || p.stockQuantity > 5)) return false
    if (stockFilter === "OUT_OF_STOCK" && p.stockQuantity !== 0) return false
    return true
  })

  // Chọn checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayedProducts.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Xóa hàng loạt
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} linh kiện đã chọn?`)) return

    try {
      // Gọi API xóa từng item
      await Promise.allSettled(selectedIds.map((id) => productService.deleteProduct(id)))
      toast.success(`Đã xóa thành công ${selectedIds.length} linh kiện`)
      setSelectedIds([])
      fetchProducts(currentPage)
    } catch {
      toast.error("Xóa linh kiện thất bại")
    }
  }

  // Lưu sản phẩm từ Modal (Tạo mới hoặc Sửa)
  const handleSaveProduct = async (
    _savedProduct: Partial<Product>,
    payload?: ProductCreatePayload
  ): Promise<boolean> => {
    if (!payload) return false

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload)
        toast.success("Cập nhật thông tin linh kiện thành công!")
      } else {
        await productService.createProduct(payload)
        toast.success("Đã thêm linh kiện mới vào hệ thống!")
      }
      setIsModalOpen(false)
      setEditingProduct(null)
      await fetchProducts(0)
      return true
    } catch (err: any) {
      console.error("Lỗi khi lưu sản phẩm:", err)
      // Khi gặp lỗi (Bad Request, validation,...):
      // Tuyệt đối KHÔNG đóng modal và KHÔNG thêm dữ liệu lỗi vào danh sách frontend!
      return false
    }
  }

  const handleResetFilters = () => {
    setSelectedCategory("ALL")
    setSearchQuery("")
    setStockFilter("ALL")
    setStatusFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(0)
    toast.info("Đã làm mới bộ lọc và danh sách")
  }

  // Helper sinh tóm tắt thông số JSONB tự động
  const formatDetail = (category: ProductCategory, detail?: Record<string, any>) => {
    if (!detail) return { primary: category, secondary: "" }
    switch (category) {
      case "CPU_COOLER":
        return {
          primary: `${detail.type || "Air"} • Cao ${detail.heightMm || detail.height_mm || 156}mm • TDP ${detail.tdpSupportW || detail.tdp_support_w || 220}W`,
          secondary: Array.isArray(detail.socketSupport || detail.socket_support)
            ? (detail.socketSupport || detail.socket_support).join(", ")
            : "LGA1700, AM5, AM4",
        }
      case "CPU":
        return {
          primary: `Socket ${detail.socket || "LGA1700"} • ${detail.cores || 8}C/${detail.threads || 16}T • TDP ${detail.tdpW || detail.tdp_w || 125}W`,
          secondary: `Hỗ trợ ${detail.memoryType || detail.memory_type || "DDR4/DDR5"}, iGPU ${detail.integratedGpu || detail.integrated_gpu ? "Intel UHD" : "Không"}`,
        }
      case "GPU":
        return {
          primary: `${detail.vramGb || detail.vram_gb || 16}GB ${detail.vramType || detail.vram_type || "GDDR6X"} • Dài ${detail.lengthMm || detail.length_mm || 338.9}mm`,
          secondary: `PCIe ${detail.pcieSlot || detail.pcie_slot || "x16"}, 3 Quạt Axial`,
        }
      case "RAM":
        return {
          primary: `${detail.type || "DDR5"} • ${detail.speedMhz || detail.speed_mhz || 6000}MHz • ${detail.totalGb || detail.total_gb || 32}GB`,
          secondary: "Intel XMP 3.0 & AMD EXPO",
        }
      case "MAINBOARD":
        return {
          primary: `Socket ${detail.socket || "LGA1700"} • ${detail.formFactor || detail.form_factor || "ATX"} • Chipset ${detail.chipset || "Z790"}`,
          secondary: `${detail.memorySlots || 4}x DDR5, ${detail.m2Slots || 3}x M.2, PCIe ${detail.pcieVersion || 5.0}`,
        }
      case "PSU":
        return {
          primary: `${detail.wattageW || detail.wattage_w || 850}W • ${detail.efficiency || "80+ Gold"}`,
          secondary: `${detail.modular || "Full"} Modular • Chuẩn ${detail.formFactor || "ATX 3.0"}`,
        }
      case "CASE":
        return {
          primary: `${Array.isArray(detail.formFactorSupport || detail.form_factor_support) ? (detail.formFactorSupport || detail.form_factor_support).join(", ") : "ATX"} • GPU max ${detail.maxGpuLengthMm || detail.max_gpu_length_mm || 435}mm`,
          secondary: `Tản CPU max ${detail.maxCoolerHeightMm || detail.max_cooler_height_mm || 165}mm`,
        }
      case "STORAGE":
        return {
          primary: `${detail.type || "NVMe SSD"} ${detail.capacityGb || detail.capacity_gb || 1000}GB`,
          secondary: `Đọc ${detail.readMbps || detail.read_mbps || 7450} MB/s • Ghi ${detail.writeMbps || detail.write_mbps || 6900} MB/s`,
        }
      default:
        return { primary: category, secondary: "" }
    }
  }

  // Helper render Category Badge & Icon
  const renderCategoryInfo = (category: ProductCategory) => {
    switch (category) {
      case "GPU":
        return {
          badge: "bg-purple-100 text-purple-700",
          iconBg: "bg-purple-50 text-purple-600",
          icon: <Sparkles className="w-5 h-5" />,
        }
      case "CPU":
        return {
          badge: "bg-blue-100 text-blue-700",
          iconBg: "bg-blue-50 text-blue-600",
          icon: <Cpu className="w-5 h-5" />,
        }
      case "RAM":
        return {
          badge: "bg-amber-100 text-amber-700",
          iconBg: "bg-amber-50 text-amber-600",
          icon: <Layers className="w-5 h-5" />,
        }
      case "MAINBOARD":
        return {
          badge: "bg-indigo-100 text-indigo-700",
          iconBg: "bg-indigo-50 text-indigo-600",
          icon: <CircuitBoard className="w-5 h-5" />,
        }
      case "PSU":
        return {
          badge: "bg-teal-100 text-teal-700",
          iconBg: "bg-teal-50 text-teal-600",
          icon: <Zap className="w-5 h-5" />,
        }
      case "CASE":
        return {
          badge: "bg-slate-200 text-slate-800",
          iconBg: "bg-slate-100 text-slate-700",
          icon: <Box className="w-5 h-5" />,
        }
      case "CPU_COOLER":
        return {
          badge: "bg-cyan-100 text-cyan-700",
          iconBg: "bg-cyan-50 text-cyan-600",
          icon: <Wind className="w-5 h-5" />,
        }
      case "STORAGE":
        return {
          badge: "bg-rose-100 text-rose-700",
          iconBg: "bg-rose-50 text-rose-600",
          icon: <HardDrive className="w-5 h-5" />,
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Thông báo chế độ dữ liệu nếu đang offline */}
      {isUsingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Chưa kết nối được máy chủ backend (`{import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}`). Đang hiển thị dữ liệu mẫu.
            </span>
          </div>
          <button
            onClick={() => fetchProducts(currentPage)}
            className="text-blue-600 font-semibold hover:underline ml-2"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý sản phẩm (Linh kiện máy tính)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý kho 8 loại linh kiện phần cứng, giá niêm yết, số lượng tồn kho và
            thông số kỹ thuật JSONB.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm linh kiện mới</span>
        </Button>
      </div>

      {/* 2. Category Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 min-w-max pb-px">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedCategory(tab.value)
                  setCurrentPage(0)
                }}
                className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "text-blue-600 border-blue-600 font-semibold"
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[280px] max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-16 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mức tồn */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="h-10 pl-3.5 pr-8 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="ALL">Tất cả mức tồn</option>
              <option value="IN_STOCK">Còn hàng (&gt; 5)</option>
              <option value="LOW_STOCK">Sắp hết hàng (1 - 5)</option>
              <option value="OUT_OF_STOCK">Hết hàng (0)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Trạng thái */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
                setCurrentPage(0)
              }}
              className="h-10 pl-3.5 pr-8 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang kinh doanh (active: true)</option>
              <option value="INACTIVE">Tạm ngưng (active: false)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sắp xếp */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any)
                setCurrentPage(0)
              }}
              className="h-10 pl-3.5 pr-8 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="NEWEST">Sắp xếp: Mới nhất</option>
              <option value="OLDEST">Sắp xếp: Cũ nhất</option>
              <option value="PRICE_ASC">Giá tăng dần</option>
              <option value="PRICE_DESC">Giá giảm dần</option>
              <option value="STOCK_DESC">Tồn kho nhiều nhất</option>
              <option value="NAME_ASC">Tên linh kiện (A → Z)</option>
              <option value="NAME_DESC">Tên linh kiện (Z → A)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleResetFilters}
            disabled={isLoading}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
            title="Làm mới bộ lọc và dữ liệu"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bulk action banner (nếu có chọn) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in">
          <span className="text-sm text-blue-700 font-medium">
            Đã chọn <strong>{selectedIds.length}</strong> linh kiện
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteSelected}
            className="gap-1.5 h-8 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa linh kiện đã chọn
          </Button>
        </div>
      )}

      {/* 4. Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Loading overlay nhẹ khi fetching */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tải danh sách linh kiện từ máy chủ...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <Checkbox
                    checked={
                      displayedProducts.length > 0 &&
                      selectedIds.length === displayedProducts.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                </th>
                <th className="py-3.5 px-4">Linh kiện</th>
                <th className="py-3.5 px-4 w-32">Danh mục</th>
                <th className="py-3.5 px-4 w-36">Giá niêm yết</th>
                <th className="py-3.5 px-4 w-28 text-center">Tồn kho</th>
                <th className="py-3.5 px-4">Thông số kỹ thuật (JSONB)</th>
                <th className="py-3.5 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 w-20 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy linh kiện máy tính nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product) => {
                  const categoryInfo = renderCategoryInfo(product.category)
                  const isSelected = selectedIds.includes(product.id)
                  const detailInfo = formatDetail(product.category, product.detail)

                  // Tìm ảnh primary (hoặc ảnh đầu tiên)
                  const primaryImg =
                    product.images?.find((img) => img.primary || img.is_primary) ||
                    product.images?.[0]
                  const imageSrc =
                    primaryImg?.imageUrl || primaryImg?.image_url || primaryImg?.preview

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(product.id)}
                        />
                      </td>

                      {/* Tên linh kiện */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {imageSrc ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center p-0.5">
                              <img
                                src={imageSrc}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  ;(e.target as HTMLElement).style.display = "none"
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoryInfo.iconBg}`}
                            >
                              {categoryInfo.icon}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                onClick={() => {
                                  setEditingProduct(product)
                                  setIsModalOpen(true)
                                }}
                                className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                              >
                                {product.name}
                              </h4>
                              {!product.active && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                  <EyeOff className="w-3 h-3" /> Tạm ẩn
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${categoryInfo.badge}`}
                        >
                          {product.category}
                        </span>
                      </td>

                      {/* Giá niêm yết */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {product.price.toLocaleString("vi-VN")}đ
                        </div>
                        <div className="text-[11px] text-slate-400">Đã gồm VAT</div>
                      </td>

                      {/* Tồn kho */}
                      <td className="py-4 px-4 text-center">
                        {product.stockQuantity === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Hết hàng (0)
                          </span>
                        ) : product.stockQuantity <= 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sắp hết ({product.stockQuantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Còn {product.stockQuantity} cái
                          </span>
                        )}
                      </td>

                      {/* Thông số kỹ thuật (JSONB) */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {detailInfo.primary}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {detailInfo.secondary}
                        </div>
                      </td>

                      {/* Trạng thái kích hoạt (active) */}
                      <td className="py-4 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            product.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {product.active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đang bán
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Tạm ngưng
                            </>
                          )}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Sửa linh kiện"
                          >
                            <Edit className="w-4 h-4" />
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

        {/* 5. Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{displayedProducts.length > 0 ? currentPage * pageSize + 1 : 0} - {currentPage * pageSize + displayedProducts.length}</strong> trong tổng số{" "}
            <strong>{totalElements}</strong> linh kiện
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 0 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Trước
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Hiển thị các số trang xung quanh trang hiện tại
              let pageIdx = i
              if (totalPages > 5 && currentPage > 2) {
                pageIdx = Math.min(totalPages - 5, currentPage - 2) + i
              }

              return (
                <button
                  key={pageIdx}
                  onClick={() => setCurrentPage(pageIdx)}
                  className={`w-8 h-8 rounded-md font-semibold flex items-center justify-center transition-colors ${
                    currentPage === pageIdx
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageIdx + 1}
                </button>
              )
            })}

            <button
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Tiếp →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh sửa */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  )
}
