import React, { useState, useMemo, useEffect } from "react"
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
} from "lucide-react"
import type { ProductCategory, Product } from "@/types/product"
import { MOCK_PRODUCTS_PAGE } from "./mockData"
import { ProductFormModal } from "./components/ProductFormModal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

// Danh sách các tab danh mục
const CATEGORY_TABS: { label: string; value: ProductCategory | "ALL"; count: number }[] = [
  { label: "Tất cả", value: "ALL", count: 128 },
  { label: "CPU", value: "CPU", count: 18 },
  { label: "MAINBOARD", value: "MAINBOARD", count: 16 },
  { label: "RAM", value: "RAM", count: 22 },
  { label: "GPU", value: "GPU", count: 20 },
  { label: "STORAGE", value: "STORAGE", count: 24 },
  { label: "PSU", value: "PSU", count: 12 },
  { label: "CASE", value: "CASE", count: 10 },
  { label: "CPU_COOLER", value: "CPU_COOLER", count: 6 },
]

export const ProductListPage: React.FC = () => {
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
    .then((response) => response.json())
    .then((data) => {
      setProducts(data.data.content)
      console.log("Fetched products from API:", data)
    })
  }, [])

  // State dữ liệu sản phẩm khởi tạo từ API response mẫu
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS_PAGE.content)
  const [currentPage, setCurrentPage] = useState<number>(MOCK_PRODUCTS_PAGE.page)
  const totalElements = MOCK_PRODUCTS_PAGE.totalElements
  const totalPages = MOCK_PRODUCTS_PAGE.totalPages

  // Bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [sortBy, setSortBy] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "STOCK_DESC">("NEWEST")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Lọc danh mục
        if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
          return false
        }
        // Tìm kiếm
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          const matchName = p.name.toLowerCase().includes(query)
          const matchSku = p.sku ? p.sku.toLowerCase().includes(query) : false
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(query) : false
          if (!matchName && !matchSku && !matchBrand) return false
        }
        // Lọc tồn kho
        if (stockFilter === "IN_STOCK" && p.stockQuantity <= 5) return false
        if (stockFilter === "LOW_STOCK" && (p.stockQuantity === 0 || p.stockQuantity > 5)) return false
        if (stockFilter === "OUT_OF_STOCK" && p.stockQuantity !== 0) return false

        // Lọc trạng thái kích hoạt (active)
        if (statusFilter === "ACTIVE" && !p.active) return false
        if (statusFilter === "INACTIVE" && p.active) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_ASC") return a.price - b.price
        if (sortBy === "PRICE_DESC") return b.price - a.price
        if (sortBy === "STOCK_DESC") return b.stockQuantity - a.stockQuantity
        return 0
      })
  }, [products, selectedCategory, searchQuery, stockFilter, statusFilter, sortBy])

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} linh kiện đã chọn?`)) {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
      setSelectedIds([])
      toast.success("Đã xóa các linh kiện thành công!")
    }
  }

  // Toggle trạng thái active trực tiếp từ bảng
  const handleToggleActive = (product: Product) => {
    const updatedStatus = !product.active
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: updatedStatus } : p))
    )
    toast.info(
      `Đã chuyển linh kiện sang trạng thái: ${updatedStatus ? "Đang kinh doanh" : "Tạm ngưng"}`
    )
  }

  const handleSaveProduct = (savedProduct: Partial<Product>) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? ({ ...p, ...savedProduct } as Product) : p))
      )
    } else {
      console.log("Saved new product:", savedProduct)
      setProducts((prev) => [savedProduct as Product, ...prev])
    }
    setEditingProduct(null)
  }

  const handleResetFilters = () => {
    setSelectedCategory("ALL")
    setSearchQuery("")
    setStockFilter("ALL")
    setStatusFilter("ALL")
    setSortBy("NEWEST")
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
          primary: `${detail.type || "DDR5"} • ${detail.speedMhz || detail.speed_mhz || 6000}MHz • ${detail.totalGb || detail.total_gb || 32}GB (${detail.sticks || 2}×${detail.capacityGb || detail.capacity_gb || 16}GB)`,
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
                onClick={() => setSelectedCategory(tab.value)}
                className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "text-blue-600 border-blue-600 font-semibold"
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
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
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-16 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            Ctrl+K
          </kbd>
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
              onChange={(e) => setStatusFilter(e.target.value as any)}
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 pl-3.5 pr-8 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="NEWEST">Sắp xếp: Mới nhất</option>
              <option value="PRICE_ASC">Giá tăng dần</option>
              <option value="PRICE_DESC">Giá giảm dần</option>
              <option value="STOCK_DESC">Tồn kho nhiều nhất</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleResetFilters}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-colors"
            title="Làm mới bộ lọc"
          >
            <RotateCw className="w-4 h-4" />
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <Checkbox
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length === filteredProducts.length
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy linh kiện máy tính nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const categoryInfo = renderCategoryInfo(product.category)
                  const isSelected = selectedIds.includes(product.id)
                  const detailInfo = formatDetail(product.category, product.detail)

                  // Tìm ảnh primary (hoặc ảnh đầu tiên)
                  // const primaryImg =
                  //   product.images?.find((img) => img.primary || img.is_primary) ||
                  //   product.images?.[0]
                  const imageSrc = "https://placehold.co/40x40"
                    // primaryImg?.imageUrl || primaryImg?.image_url || primaryImg?.preview

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

                      {/* Linh kiện & Mã SKU */}
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
                            {/* <p className="text-xs text-slate-400 mt-0.5">
                              SKU: {product.sku || product.id.slice(0, 8)} •{" "}
                              {product.brand || "Chính Hãng"}
                            </p> */}
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
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            product.active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          title="Bấm để chuyển trạng thái kích hoạt"
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
                        </button>
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
            Hiển thị <strong>1 - {filteredProducts.length}</strong> trong tổng số{" "}
            <strong>{totalElements}</strong> linh kiện
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 rounded-md font-semibold flex items-center justify-center transition-colors ${
                  currentPage === i
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
