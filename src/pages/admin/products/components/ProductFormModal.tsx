import React, { useState } from "react"
import {
  X,
  Upload,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Code,
  FileText,
  Info,
  Check,
  Cpu,
  CircuitBoard,
  Layers,
  Sparkles,
  HardDrive,
  Zap,
  Box,
  Wind,
} from "lucide-react"
import type { ProductCategory, ProductItem, ProductImagePayload, ProductCreatePayload } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Partial<ProductItem>, payload?: ProductCreatePayload) => void
  initialProduct?: ProductItem | null
}

const CATEGORIES: { label: string; value: ProductCategory; icon: React.ReactNode }[] = [
  { label: "CPU (Bộ vi xử lý)", value: "CPU", icon: <Cpu className="w-4 h-4" /> },
  { label: "Mainboard (Bo mạch chủ)", value: "MAINBOARD", icon: <CircuitBoard className="w-4 h-4" /> },
  { label: "RAM (Bộ nhớ trong)", value: "RAM", icon: <Layers className="w-4 h-4" /> },
  { label: "GPU (Card màn hình)", value: "GPU", icon: <Sparkles className="w-4 h-4" /> },
  { label: "Storage (Ổ cứng)", value: "STORAGE", icon: <HardDrive className="w-4 h-4" /> },
  { label: "PSU (Nguồn)", value: "PSU", icon: <Zap className="w-4 h-4" /> },
  { label: "Case (Vỏ case)", value: "CASE", icon: <Box className="w-4 h-4" /> },
  { label: "CPU Cooler (Tản nhiệt)", value: "CPU_COOLER", icon: <Wind className="w-4 h-4" /> },
]

// Mẫu JSONB chi tiết mặc định theo từng danh mục từ AGENTS.md
const DEFAULT_DETAIL_TEMPLATES: Record<ProductCategory, Record<string, any>> = {
  CPU_COOLER: {
    type: "Air",
    socketSupport: ["LGA1700", "LGA1200", "AM5", "AM4"],
    heightMm: 156,
    tdpSupportW: 220,
  },
  CPU: {
    socket: "LGA1700",
    cores: 8,
    threads: 16,
    base_clock_ghz: 3.6,
    boost_clock_ghz: 5.2,
    tdp_w: 65,
    memory_type: "DDR4/DDR5",
    integrated_gpu: true,
  },
  MAINBOARD: {
    socket: "LGA1700",
    form_factor: "ATX",
    chipset: "Z790",
    memory_type: "DDR5",
    memory_slots: 4,
    max_memory_gb: 128,
    m2_slots: 3,
    pcie_version: 5.0,
  },
  RAM: {
    type: "DDR5",
    speed_mhz: 6000,
    capacity_gb: 16,
    sticks: 2,
    total_gb: 32,
  },
  GPU: {
    vram_gb: 12,
    vram_type: "GDDR6X",
    tdp_w: 200,
    pcie_slot: "x16",
    length_mm: 320,
  },
  STORAGE: {
    type: "NVMe SSD",
    capacity_gb: 1000,
    interface: "M.2 PCIe 4.0",
    read_mbps: 7000,
    write_mbps: 6500,
  },
  PSU: {
    wattage_w: 750,
    efficiency: "80+ Gold",
    modular: "Full",
    form_factor: "ATX",
  },
  CASE: {
    form_factor_support: ["ATX", "mATX", "ITX"],
    max_gpu_length_mm: 380,
    max_cooler_height_mm: 160,
    drive_bays_35: 2,
    drive_bays_25: 4,
  },
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  if (!isOpen) return null

  // Tab điều hướng bên trong modal
  const [activeTab, setActiveTab] = useState<"general" | "images" | "specs" | "preview">("general")

  // Form Fields
  const [name, setName] = useState(initialProduct?.name || "")
  const [price, setPrice] = useState(initialProduct?.price?.toString() || "")
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stockQuantity?.toString() || "10")
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || "CPU_COOLER")
  const [description, setDescription] = useState(
    initialProduct?.description ||
      "Tản nhiệt khí 4 ống đồng tích hợp màn hình kỹ thuật số hiển thị nhiệt độ và mức tải CPU theo thời gian thực, vận hành êm ái và dễ dàng lắp đặt."
  )
  const [isActive, setIsActive] = useState<boolean>(
    initialProduct?.is_active !== undefined ? initialProduct.is_active : initialProduct?.isActive !== undefined ? initialProduct.isActive : true
  )

  // Images State
  const [images, setImages] = useState<ProductImagePayload[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images.map((img, idx) => ({
        id: img.id || `img-${idx}`,
        image_url: img.imageUrl || img.image_url || "",
        is_primary: img.primary !== undefined ? img.primary : Boolean(img.is_primary),
        display_order: img.displayOrder !== undefined ? img.displayOrder : (img.display_order ?? idx),
        preview: img.imageUrl || img.image_url || img.preview || "",
      }))
    }
    return [
      {
        id: "img-default-1",
        image_url:
          "https://res.cloudinary.com/demo/image/upload/v1/products/cooler/deepcool-ak400-digital-1.jpg",
        is_primary: true,
        display_order: 0,
        preview:
          "https://res.cloudinary.com/demo/image/upload/v1/products/cooler/deepcool-ak400-digital-1.jpg",
      },
    ]
  })

  // URL nhập tay nếu muốn
  const [manualImageUrl, setManualImageUrl] = useState("")

  // Detail JSON State
  const [detailJson, setDetailJson] = useState(() => {
    const detailObj = initialProduct?.detail || DEFAULT_DETAIL_TEMPLATES[initialProduct?.category || "CPU_COOLER"]
    return JSON.stringify(detailObj, null, 2)
  })

  // Cập nhật detail template khi đổi danh mục (nếu chưa sửa nhiều)
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat)
    if (!initialProduct) {
      setDetailJson(JSON.stringify(DEFAULT_DETAIL_TEMPLATES[newCat], null, 2))
    }
  }

  // Xử lý Upload file từ máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newUploadedImages: ProductImagePayload[] = Array.from(files).map((file, idx) => {
      const previewUrl = URL.createObjectURL(file)
      const currentCount = images.length + idx
      return {
        id: `img-${Date.now()}-${idx}`,
        image_url: previewUrl,
        is_primary: images.length === 0 && idx === 0,
        display_order: currentCount,
        file: file,
        preview: previewUrl,
      }
    })

    const updated = [...images, ...newUploadedImages]
    // Bảo đảm luôn có 1 ảnh chính
    if (!updated.some((img) => img.is_primary) && updated.length > 0) {
      updated[0].is_primary = true
    }
    // Chuẩn hóa lại display_order liên tục 0, 1, 2...
    const normalized = updated.map((img, i) => ({ ...img, display_order: i }))
    setImages(normalized)
    toast.success(`Đã thêm ${newUploadedImages.length} hình ảnh`)
    e.target.value = ""
  }

  // Thêm ảnh từ URL thủ công
  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) {
      toast.error("Vui lòng nhập đường dẫn URL hình ảnh")
      return
    }
    const newImg: ProductImagePayload = {
      id: `img-url-${Date.now()}`,
      image_url: manualImageUrl.trim(),
      is_primary: images.length === 0,
      display_order: images.length,
      preview: manualImageUrl.trim(),
    }
    const updated = [...images, newImg].map((img, idx) => ({ ...img, display_order: idx }))
    setImages(updated)
    setManualImageUrl("")
    toast.success("Đã thêm hình ảnh từ URL")
  }

  // Đặt làm ảnh đại diện chính (is_primary = true)
  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index,
    }))
    setImages(updated)
    toast.info(`Đã đặt ảnh #${index + 1} làm ảnh đại diện chính`)
  }

  // Di chuyển thứ tự ảnh sang trái / lên trước (giảm display_order)
  const handleMoveLeft = (index: number) => {
    if (index === 0) return
    const updated = [...images]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    // Cập nhật lại display_order theo vị trí mới
    const normalized = updated.map((img, i) => ({ ...img, display_order: i }))
    setImages(normalized)
  }

  // Di chuyển thứ tự ảnh sang phải / xuống sau (tăng display_order)
  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return
    const updated = [...images]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    const normalized = updated.map((img, i) => ({ ...img, display_order: i }))
    setImages(normalized)
  }

  // Xóa ảnh
  const handleRemoveImage = (index: number) => {
    const isRemovingPrimary = images[index].is_primary
    const updated = images.filter((_, idx) => idx !== index)
    // Nếu vừa xóa ảnh primary và vẫn còn ảnh, gán ảnh đầu tiên làm primary
    if (isRemovingPrimary && updated.length > 0) {
      updated[0].is_primary = true
    }
    const normalized = updated.map((img, i) => ({ ...img, display_order: i }))
    setImages(normalized)
    toast.info("Đã xóa ảnh khỏi danh sách")
  }

  // Cập nhật display_order bằng input trực tiếp
  const handleDirectOrderChange = (index: number, newOrderStr: string) => {
    const newOrder = parseInt(newOrderStr, 10)
    if (isNaN(newOrder)) return
    const updated = [...images]
    updated[index] = { ...updated[index], display_order: newOrder }
    // Sort theo order và chuẩn hóa
    updated.sort((a, b) => a.display_order - b.display_order)
    setImages(updated.map((img, i) => ({ ...img, display_order: i })))
  }

  // Tạo payload chuẩn
  const getConstructedPayload = (): ProductCreatePayload => {
    let parsedDetail = {}
    try {
      parsedDetail = JSON.parse(detailJson)
    } catch {
      parsedDetail = {}
    }

    return {
      name,
      price: Number(price) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      category,
      description,
      is_active: isActive,
      detail: parsedDetail,
      images: images.map((img, idx) => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
        display_order: idx,
      })),
    }
  }

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên linh kiện")
      setActiveTab("general")
      return
    }

    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 hình ảnh cho linh kiện")
      setActiveTab("images")
      return
    }

    try {
      JSON.parse(detailJson)
    } catch {
      toast.error("Định dạng JSON thông số kỹ thuật không hợp lệ!")
      setActiveTab("specs")
      return
    }

    const payload = getConstructedPayload()

    fetch("http://localhost:8080/api/products", {
      method: initialProduct ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((err) => {
      console.error("Error sending product data:", err)
      toast.error("Đã xảy ra lỗi khi gửi dữ liệu sản phẩm lên server.")
    })

    onSave(
      {
        id: initialProduct?.id || `prod-${Date.now()}`,
        name: payload.name,
        price: payload.price,
        stockQuantity: payload.stockQuantity,
        category: payload.category,
        description: payload.description,
        is_active: payload.is_active,
        isActive: payload.is_active,
        active: payload.is_active,
        detail: payload.detail,
        images: images.map((img, idx) => ({
          id: img.id,
          imageUrl: img.image_url,
          primary: img.is_primary,
          displayOrder: idx,
          image_url: img.image_url,
          is_primary: img.is_primary,
          display_order: idx,
          preview: img.preview,
        })),
        sku: initialProduct?.sku || `${category}-${Date.now().toString().slice(-4)}`,
        brand: initialProduct?.brand || "Chính Hãng",
        detailSummary: {
          primary: `${category} • ${images.length} hình ảnh`,
          secondary: description.slice(0, 60) + "...",
        },
      },
      payload
    )

    toast.success(
      initialProduct
        ? "Cập nhật linh kiện thành công!"
        : "Đã tạo mới linh kiện với đầy đủ hình ảnh & thông số!"
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 1. Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {initialProduct ? "Chỉnh sửa linh kiện máy tính" : "Thêm linh kiện mới"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cung cấp đầy đủ thông tin định giá, mô tả, bộ sưu tập hình ảnh và thông số kỹ thuật JSONB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Thông tin chung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "images"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hình ảnh sản phẩm</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                images.length > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {images.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Thông số JSONB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Xem trước Payload</span>
          </button>
        </div>

        {/* 3. Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: THÔNG TIN CHUNG */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="product-name" className="text-xs font-bold text-slate-700">
                    Tên linh kiện máy tính <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product-name"
                    placeholder="VD: Tản nhiệt khí DeepCool AK600 Digital (Đen / Màn hình hiển thị nhiệt độ)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-category" className="text-xs font-bold text-slate-700">
                    Phân loại danh mục <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-price" className="text-xs font-bold text-slate-700">
                    Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    placeholder="VD: 890000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-stock" className="text-xs font-bold text-slate-700">
                    Số lượng tồn kho ban đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product-stock"
                    type="number"
                    placeholder="VD: 35"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-status" className="text-xs font-bold text-slate-700">
                    Trạng thái kích hoạt (is_active)
                  </Label>
                  <select
                    id="product-status"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Đang kinh doanh (is_active: true)</option>
                    <option value="false">Tạm ẩn khỏi shop (is_active: false)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="product-desc" className="text-xs font-bold text-slate-700">
                    Mô tả sản phẩm (description)
                  </Label>
                  <textarea
                    id="product-desc"
                    rows={4}
                    placeholder="Nhập mô tả đặc điểm nổi bật, thiết kế, công nghệ tản nhiệt hoặc hiệu năng..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ HÌNH ẢNH (UPLOAD & SẮP XẾP THỨ TỰ) */}
          {activeTab === "images" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Khu vực Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload từ máy tính */}
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Bấm để chọn một hoặc nhiều ảnh"
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Tải ảnh từ máy tính (Upload 1 hoặc nhiều ảnh)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hỗ trợ định dạng PNG, JPG, WEBP. Chọn cùng lúc nhiều ảnh.
                  </p>
                </div>

                {/* Nhập URL ảnh thủ công */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Hoặc dán URL hình ảnh (Cloudinary / CDN)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://res.cloudinary.com/.../cooler-1.jpg"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddManualUrl}
                        className="shrink-0 gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm URL
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Sau khi upload, bạn có thể sắp xếp thứ tự hiển thị và chọn ảnh đại diện.</span>
                  </div>
                </div>
              </div>

              {/* Danh sách ảnh đã upload kèm công cụ sắp xếp thứ tự */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Bộ sưu tập hình ảnh ({images.length})</span>
                    <span className="text-xs font-normal text-slate-500">
                      (Dùng các nút mũi tên để đổi vị trí, hoặc bấm sao để chọn ảnh đại diện)
                    </span>
                  </h4>
                </div>

                {images.length === 0 ? (
                  <div className="border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Chưa có hình ảnh nào được tải lên. Hãy chọn ảnh từ máy tính hoặc dán URL ở trên.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative rounded-xl border-2 transition-all p-3 flex flex-col justify-between bg-white shadow-sm ${
                          img.is_primary
                            ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Ảnh preview */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-100 flex items-center justify-center">
                          <img
                            src={img.preview || img.image_url}
                            alt={`Linh kiện #${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = "none"
                            }}
                          />
                          {/* Badge ảnh đại diện */}
                          {img.is_primary && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-current" /> Ảnh đại diện
                            </span>
                          )}

                          {/* Badge thứ tự */}
                          <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                            Thứ tự: #{idx}
                          </span>
                        </div>

                        {/* URL hoặc tên */}
                        <p className="text-[11px] text-slate-500 truncate mb-3 font-mono" title={img.image_url}>
                          {img.image_url}
                        </p>

                        {/* Cụm điều khiển sắp xếp thứ tự và chọn Primary */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Đặt làm ảnh đại diện */}
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 transition ${
                              img.is_primary
                                ? "text-blue-700 bg-blue-100 cursor-default"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                            title="Đặt làm ảnh đại diện hiển thị"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                img.is_primary ? "fill-blue-600 text-blue-600" : "text-slate-400"
                              }`}
                            />
                            <span>{img.is_primary ? "Đại diện" : "Chọn chính"}</span>
                          </button>

                          {/* Nhóm nút di chuyển thứ tự */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveLeft(idx)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Di chuyển sang trước"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>

                            <input
                              type="number"
                              min={0}
                              max={images.length - 1}
                              value={img.display_order}
                              onChange={(e) => handleDirectOrderChange(idx, e.target.value)}
                              className="w-10 h-7 text-center text-xs border border-slate-200 rounded font-semibold text-slate-700"
                              title="Thứ tự hiển thị (display_order)"
                            />

                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => handleMoveRight(idx)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Di chuyển về sau"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Xóa ảnh */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-1"
                              title="Xóa hình ảnh này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG SỐ KỸ THUẬT JSONB */}
          {activeTab === "specs" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detail-json" className="text-xs font-bold text-slate-700">
                    Cấu trúc chi tiết JSONB (`detail`)
                  </Label>
                  <p className="text-xs text-slate-500">
                    Dùng để phục vụ thuật toán tương thích và trợ lý AI gợi ý cấu hình PC
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailJson(JSON.stringify(DEFAULT_DETAIL_TEMPLATES[category], null, 2))
                    toast.info(`Đã nạp mẫu thông số chuẩn của danh mục ${category}`)
                  }}
                  className="text-xs gap-1"
                >
                  <Cpu className="w-3.5 h-3.5" /> Nạp mẫu chuẩn ({category})
                </Button>
              </div>

              <textarea
                id="detail-json"
                rows={12}
                value={detailJson}
                onChange={(e) => setDetailJson(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                placeholder="{ ... }"
              />
            </div>
          )}

          {/* TAB 4: XEM TRƯỚC PAYLOAD CHUẨN GỬI VỀ BACKEND */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Payload hoàn chỉnh sẽ gửi lên API:
                  </h4>
                  <p className="text-xs text-slate-500">
                    Khớp 100% với định dạng yêu cầu của Backend Spring Boot
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(getConstructedPayload(), null, 2))
                    toast.success("Đã sao chép JSON Payload vào bộ nhớ tạm!")
                  }}
                  className="text-xs gap-1.5"
                >
                  <Code className="w-3.5 h-3.5" /> Sao chép JSON
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 shadow-inner leading-relaxed">
                {JSON.stringify(getConstructedPayload(), null, 2)}
              </pre>
            </div>
          )}

          {/* 4. Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              * Vui lòng kiểm tra lại ảnh đại diện và thứ tự hiển thị trước khi lưu
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Check className="w-4 h-4" />
                <span>{initialProduct ? "Cập nhật thay đổi" : "Lưu linh kiện"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
