import React, { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import type { ProductCategory, ProductItem, ProductImagePayload, ProductCreatePayload } from "@/types/product"
import { imageService } from "@/services/api/imageService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Partial<ProductItem>, payload?: ProductCreatePayload) => Promise<boolean> | boolean | Promise<void> | void
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

// Mẫu JSONB chi tiết mặc định chuẩn 100% camelCase theo từng danh mục
const DEFAULT_DETAIL_TEMPLATES: Record<ProductCategory, Record<string, any>> = {
  CPU_COOLER: {
    type: "Air",
    socketSupport: ["LGA1700", "LGA1200", "AM5", "AM4"],
    heightMm: 156,
    tdpSupportW: 220,
    radiatorSizeMm: null,
  },
  CPU: {
    socket: "LGA1700",
    cores: 8,
    threads: 16,
    baseClockGhz: 3.6,
    boostClockGhz: 5.2,
    tdpW: 65,
    memoryType: "DDR4/DDR5",
    integratedGpu: true,
  },
  MAINBOARD: {
    socket: "LGA1700",
    formFactor: "ATX",
    chipset: "Z790",
    memoryType: "DDR5",
    memorySlots: 4,
    maxMemoryGb: 128,
    m2Slots: 3,
    pcieVersion: 5.0,
  },
  RAM: {
    type: "DDR5",
    speedMhz: 6000,
    capacityGb: 16,
    sticks: 2,
    totalGb: 32,
  },
  GPU: {
    vramGb: 12,
    vramType: "GDDR6X",
    tdpW: 200,
    pcieSlot: "x16",
    lengthMm: 320,
  },
  STORAGE: {
    type: "NVMe SSD",
    capacityGb: 1000,
    interface: "M.2 PCIe 4.0",
    readMbps: 7000,
    writeMbps: 6500,
  },
  PSU: {
    wattageW: 750,
    efficiency: "80+ Gold",
    modular: "Full",
    formFactor: "ATX",
  },
  CASE: {
    formFactorSupport: ["ATX", "mATX", "ITX"],
    maxGpuLengthMm: 380,
    maxCoolerHeightMm: 160,
    driveBays35: 2,
    driveBays25: 4,
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

  // Form Fields (camelCase)
  const [name, setName] = useState(initialProduct?.name || "")
  const [price, setPrice] = useState(initialProduct?.price?.toString() || "")
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stockQuantity?.toString() || "10")
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || "CPU_COOLER")
  const [description, setDescription] = useState(
    initialProduct?.description ||
      "Tản nhiệt khí 4 ống đồng tích hợp màn hình kỹ thuật số hiển thị nhiệt độ và mức tải CPU theo thời gian thực, vận hành êm ái và dễ dàng lắp đặt."
  )
  const [isActive, setIsActive] = useState<boolean>(
    initialProduct?.isActive !== undefined
      ? initialProduct.isActive
      : initialProduct?.active !== undefined
      ? initialProduct.active
      : initialProduct?.is_active !== undefined
      ? initialProduct.is_active
      : true
  )

  // Images State (chuẩn camelCase)
  const [images, setImages] = useState<ProductImagePayload[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images.map((img, idx) => ({
        id: img.id || `img-${idx}`,
        imageUrl: img.imageUrl || img.image_url || img.preview || "",
        publicId: img.publicId,
        isPrimary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? Boolean(img.is_primary)),
        primary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? Boolean(img.is_primary)),
        displayOrder: img.displayOrder !== undefined ? img.displayOrder : (img.display_order ?? idx),
        preview: img.imageUrl || img.image_url || img.preview || "",
      }))
    }
    return []
  })

  // URL nhập tay nếu muốn
  const [manualImageUrl, setManualImageUrl] = useState("")

  // Trạng thái upload hình ảnh lên Cloudinary
  const [isUploading, setIsUploading] = useState(false)

  // Trạng thái đang lưu dữ liệu sản phẩm (gọi API tạo mới / cập nhật)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detail JSON State
  const [detailJson, setDetailJson] = useState(() => {
    const detailObj = initialProduct?.detail || DEFAULT_DETAIL_TEMPLATES[initialProduct?.category || "CPU_COOLER"]
    return JSON.stringify(detailObj, null, 2)
  })

  // Đồng bộ lại dữ liệu form khi initialProduct hoặc trạng thái mở modal thay đổi
  useEffect(() => {
    if (!isOpen) return

    if (initialProduct) {
      setName(initialProduct.name || "")
      setPrice(initialProduct.price?.toString() || "")
      setStockQuantity(initialProduct.stockQuantity?.toString() || "10")
      setCategory(initialProduct.category || "CPU_COOLER")
      setDescription(initialProduct.description || "")
      setIsActive(
        initialProduct.isActive !== undefined
          ? initialProduct.isActive
          : initialProduct.active !== undefined
          ? initialProduct.active
          : initialProduct.is_active !== undefined
          ? initialProduct.is_active
          : true
      )
      if (initialProduct.images && initialProduct.images.length > 0) {
        setImages(
          initialProduct.images.map((img, idx) => ({
            id: img.id || `img-${idx}`,
            imageUrl: img.imageUrl || img.image_url || img.preview || "",
            publicId: img.publicId,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? Boolean(img.is_primary)),
            primary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? Boolean(img.is_primary)),
            displayOrder: img.displayOrder !== undefined ? img.displayOrder : (img.display_order ?? idx),
            preview: img.imageUrl || img.image_url || img.preview || "",
          }))
        )
      } else {
        setImages([])
      }
      setDetailJson(
        JSON.stringify(
          initialProduct.detail || DEFAULT_DETAIL_TEMPLATES[initialProduct.category || "CPU_COOLER"],
          null,
          2
        )
      )
    } else {
      setName("")
      setPrice("")
      setStockQuantity("10")
      setCategory("CPU_COOLER")
      setDescription(
        "Tản nhiệt khí 4 ống đồng tích hợp màn hình kỹ thuật số hiển thị nhiệt độ và mức tải CPU theo thời gian thực, vận hành êm ái và dễ dàng lắp đặt."
      )
      setIsActive(true)
      setImages([])
      setDetailJson(JSON.stringify(DEFAULT_DETAIL_TEMPLATES["CPU_COOLER"], null, 2))
    }
    setActiveTab("general")
  }, [isOpen, initialProduct])

  // Cập nhật detail template khi đổi danh mục
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat)
    if (!initialProduct) {
      setDetailJson(JSON.stringify(DEFAULT_DETAIL_TEMPLATES[newCat], null, 2))
    }
  }

  // Xử lý Upload file từ máy tính lên Cloudinary qua API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)

    // Kiểm tra định dạng hình ảnh và giới hạn dung lượng 10MB theo cấu hình backend
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Tệp "${file.name}" không phải là định dạng hình ảnh hợp lệ (JPG, PNG, WEBP, GIF, SVG)!`)
        e.target.value = ""
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Tệp "${file.name}" vượt quá dung lượng tối đa cho phép (10MB)!`)
        e.target.value = ""
        return
      }
    }

    setIsUploading(true)
    const toastId = toast.loading(
      fileList.length === 1
        ? `Đang tải hình ảnh "${fileList[0].name}" lên Cloudinary...`
        : `Đang tải ${fileList.length} hình ảnh lên Cloudinary...`
    )

    try {
      // Gọi API POST /api/images/upload cho từng file
      const uploadPromises = fileList.map((file) => imageService.uploadImage(file))
      const responses = await Promise.all(uploadPromises)

      const newUploadedImages: ProductImagePayload[] = []

      responses.forEach((res, idx) => {
        // Cấu trúc response mẫu backend trả về:
        // { success: true, message: "Tải hình ảnh lên Cloudinary thành công!", data: { publicId, url, secureUrl, ... } }
        const uploadData = res?.data || (res as any)
        const finalUrl = uploadData?.secureUrl || uploadData?.url

        if (finalUrl) {
          const currentCount = images.length + newUploadedImages.length
          const isPrimaryImage = currentCount === 0

          newUploadedImages.push({
            id: uploadData.publicId || `img-${Date.now()}-${idx}`,
            imageUrl: finalUrl,
            publicId: uploadData.publicId,
            isPrimary: isPrimaryImage,
            primary: isPrimaryImage,
            displayOrder: currentCount,
            preview: finalUrl,
          })
        }
      })

      if (newUploadedImages.length > 0) {
        const updated = [...images, ...newUploadedImages]
        // Đảm bảo luôn có 1 ảnh đại diện chính
        if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
          updated[0].isPrimary = true
          updated[0].primary = true
        }
        const normalized = updated.map((img, i) => ({
          ...img,
          displayOrder: i,
        }))
        setImages(normalized)

        const successMessage =
          responses[0]?.message ||
          (fileList.length === 1
            ? "Tải hình ảnh lên Cloudinary thành công!"
            : `Đã tải ${newUploadedImages.length} hình ảnh lên Cloudinary thành công!`)

        toast.success(successMessage, { id: toastId })
      } else {
        toast.error("Không nhận được đường dẫn hình ảnh trả về từ máy chủ!", { id: toastId })
      }
    } catch (error: any) {
      console.error("Lỗi khi tải hình ảnh lên Cloudinary:", error)
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Tải hình ảnh lên Cloudinary thất bại. Vui lòng kiểm tra lại cấu hình Cloudinary!"
      toast.error(errorMsg, { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  // Thêm ảnh từ URL thủ công
  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) {
      toast.error("Vui lòng nhập đường dẫn URL hình ảnh")
      return
    }
    const isPrimaryImage = images.length === 0
    const newImg: ProductImagePayload = {
      id: `img-url-${Date.now()}`,
      imageUrl: manualImageUrl.trim(),
      isPrimary: isPrimaryImage,
      primary: isPrimaryImage,
      displayOrder: images.length,
      preview: manualImageUrl.trim(),
    }
    const updated = [...images, newImg].map((img, idx) => ({ ...img, displayOrder: idx }))
    setImages(updated)
    setManualImageUrl("")
    toast.success("Đã thêm hình ảnh từ URL")
  }

  // Đặt làm ảnh đại diện chính (isPrimary = true)
  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
      primary: idx === index,
    }))
    setImages(updated)
    toast.info(`Đã đặt ảnh #${index + 1} làm ảnh đại diện chính`)
  }

  // Di chuyển thứ tự ảnh sang trước
  const handleMoveLeft = (index: number) => {
    if (index === 0) return
    const updated = [...images]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    const normalized = updated.map((img, i) => ({ ...img, displayOrder: i }))
    setImages(normalized)
  }

  // Di chuyển thứ tự ảnh về sau
  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return
    const updated = [...images]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    const normalized = updated.map((img, i) => ({ ...img, displayOrder: i }))
    setImages(normalized)
  }

  // Xóa ảnh
  const handleRemoveImage = (index: number) => {
    const isRemovingPrimary = images[index].isPrimary
    const updated = images.filter((_, idx) => idx !== index)
    if (isRemovingPrimary && updated.length > 0) {
      updated[0].isPrimary = true
      updated[0].primary = true
    }
    const normalized = updated.map((img, i) => ({ ...img, displayOrder: i }))
    setImages(normalized)
    toast.info("Đã xóa ảnh khỏi danh sách")
  }

  // Cập nhật displayOrder trực tiếp
  const handleDirectOrderChange = (index: number, newOrderStr: string) => {
    const newOrder = parseInt(newOrderStr, 10)
    if (isNaN(newOrder)) return
    const updated = [...images]
    updated[index] = { ...updated[index], displayOrder: newOrder }
    updated.sort((a, b) => a.displayOrder - b.displayOrder)
    setImages(updated.map((img, i) => ({ ...img, displayOrder: i })))
  }

  // Tạo payload chuẩn 100% camelCase
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
      isActive: isActive,
      active: isActive, // Đồng thời truyền active để tương thích Jackson boolean getter
      detail: parsedDetail,
      images: images.map((img, idx) => ({
        imageUrl: img.imageUrl || img.image_url || img.preview || "",
        isPrimary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? (idx === 0)),
        primary: img.isPrimary !== undefined ? img.isPrimary : (img.primary ?? (idx === 0)),
        displayOrder: idx,
      })),
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true)
    try {
      const isSaved = await onSave(
        {
          id: initialProduct?.id || `prod-${Date.now()}`,
          name: payload.name,
          price: payload.price,
          stockQuantity: payload.stockQuantity,
          category: payload.category,
          description: payload.description,
          isActive: payload.isActive,
          active: payload.isActive,
          is_active: payload.isActive,
          detail: payload.detail,
          images: images.map((img, idx) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            primary: img.isPrimary,
            isPrimary: img.isPrimary,
            displayOrder: idx,
            preview: img.preview,
            publicId: img.publicId,
          })),
          detailSummary: {
            primary: `${category} • ${images.length} hình ảnh`,
            secondary: description.slice(0, 60) + "...",
          },
        },
        payload
      )

      // CHỈ ĐÓNG MODAL KHI LƯU THÀNH CÔNG (isSaved !== false)
      if (isSaved !== false) {
        onClose()
      }
    } catch (error) {
      console.error("Lỗi khi lưu linh kiện:", error)
      // Khi gặp lỗi (Bad Request, 400), giữ nguyên modal để người dùng chỉnh sửa
    } finally {
      setIsSubmitting(false)
    }
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
            disabled={isSubmitting || isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition disabled:opacity-50"
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
              className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isUploading
                  ? "bg-blue-600 text-white"
                  : images.length > 0
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : images.length}
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
            <span>Xem trước Payload (camelCase)</span>
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
                    Tên linh kiện máy tính (`name`) <span className="text-red-500">*</span>
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
                    Phân loại danh mục (`category`) <span className="text-red-500">*</span>
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
                    Giá niêm yết VNĐ (`price`) <span className="text-red-500">*</span>
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
                    Số lượng tồn kho (`stockQuantity`) <span className="text-red-500">*</span>
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
                    Trạng thái kích hoạt (`isActive`)
                  </Label>
                  <select
                    id="product-status"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Đang kinh doanh (isActive: true)</option>
                    <option value="false">Tạm ẩn khỏi shop (isActive: false)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="product-desc" className="text-xs font-bold text-slate-700">
                    Mô tả sản phẩm (`description`)
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

          {/* TAB 2: QUẢN LÝ HÌNH ẢNH */}
          {activeTab === "images" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Khu vực Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload từ máy tính */}
                <div
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center relative ${
                    isUploading
                      ? "border-blue-400 bg-blue-50/50 cursor-wait"
                      : "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer group"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className={`absolute inset-0 opacity-0 w-full h-full ${
                      isUploading ? "cursor-wait" : "cursor-pointer"
                    }`}
                    title={isUploading ? "Đang tải ảnh lên Cloudinary..." : "Bấm để chọn một hoặc nhiều ảnh"}
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-transform ${
                      isUploading
                        ? "bg-blue-100 text-blue-600 animate-pulse"
                        : "bg-blue-100 text-blue-600 group-hover:scale-110"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {isUploading ? "Đang tải ảnh lên Cloudinary..." : "Tải ảnh từ máy tính (`imageUrl`)"}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isUploading
                      ? "Vui lòng đợi trong giây lát, ảnh đang được gửi lên Cloudinary..."
                      : "Hỗ trợ JPG, PNG, WEBP. Ảnh tự động được upload lên Cloudinary."}
                  </p>
                </div>

                {/* Nhập URL ảnh thủ công */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Hoặc dán URL hình ảnh (`imageUrl`)
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
                    <span>Sau khi upload, bạn có thể sắp xếp `displayOrder` và chọn `isPrimary`.</span>
                  </div>
                </div>
              </div>

              {/* Danh sách ảnh đã upload */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Bộ sưu tập hình ảnh ({images.length})</span>
                    <span className="text-xs font-normal text-slate-500">
                      (Dùng nút mũi tên để đổi `displayOrder`, bấm sao để chọn `isPrimary`)
                    </span>
                  </h4>
                </div>

                {images.length === 0 ? (
                  <div className="border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Chưa có hình ảnh nào được tải lên.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative rounded-xl border-2 transition-all p-3 flex flex-col justify-between bg-white shadow-sm ${
                          img.isPrimary
                            ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Ảnh preview */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-100 flex items-center justify-center">
                          <img
                            src={img.preview || img.imageUrl}
                            alt={`Linh kiện #${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = "none"
                            }}
                          />
                          {/* Badge ảnh đại diện */}
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-current" /> Ảnh đại diện
                            </span>
                          )}

                          {/* Badge thứ tự */}
                          <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                            displayOrder: #{idx}
                          </span>
                        </div>

                        {/* URL hoặc tên */}
                        <p className="text-[11px] text-slate-500 truncate mb-1 font-mono" title={img.imageUrl}>
                          {img.imageUrl}
                        </p>

                        {/* Public ID từ Cloudinary */}
                        {img.publicId && (
                          <div className="mb-2">
                            <span
                              className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono truncate block max-w-full"
                              title={img.publicId}
                            >
                              ID: {img.publicId}
                            </span>
                          </div>
                        )}

                        {/* Cụm điều khiển sắp xếp thứ tự và chọn Primary */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Đặt làm ảnh đại diện */}
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 transition ${
                              img.isPrimary
                                ? "text-blue-700 bg-blue-100 cursor-default"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                            title="Đặt làm ảnh đại diện hiển thị"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                img.isPrimary ? "fill-blue-600 text-blue-600" : "text-slate-400"
                              }`}
                            />
                            <span>{img.isPrimary ? "Đại diện" : "Chọn chính"}</span>
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
                              value={img.displayOrder}
                              onChange={(e) => handleDirectOrderChange(idx, e.target.value)}
                              className="w-10 h-7 text-center text-xs border border-slate-200 rounded font-semibold text-slate-700"
                              title="Thứ tự hiển thị (displayOrder)"
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

          {/* TAB 3: THÔNG SỐ KỸ THUẬT JSONB (CAMELCASE) */}
          {activeTab === "specs" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detail-json" className="text-xs font-bold text-slate-700">
                    Cấu trúc chi tiết JSONB (`detail`) - Thuần camelCase
                  </Label>
                  <p className="text-xs text-slate-500">
                    Tất cả các thuộc tính đều được định dạng theo chuẩn camelCase
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailJson(JSON.stringify(DEFAULT_DETAIL_TEMPLATES[category], null, 2))
                    toast.info(`Đã nạp mẫu thông số camelCase của danh mục ${category}`)
                  }}
                  className="text-xs gap-1"
                >
                  <Cpu className="w-3.5 h-3.5" /> Nạp mẫu camelCase ({category})
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

          {/* TAB 4: XEM TRƯỚC PAYLOAD TOÀN BỘ CAMELCASE */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Payload hoàn chỉnh (100% camelCase):
                  </h4>
                  <p className="text-xs text-slate-500">
                    Toàn bộ các field `isActive`, `imageUrl`, `isPrimary`, `displayOrder` và các thuộc tính trong `detail`
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
              * Dữ liệu payload được gửi đi theo định dạng chuẩn camelCase
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading || isSubmitting}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{initialProduct ? "Đang cập nhật..." : "Đang tạo linh kiện..."}</span>
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải ảnh lên...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{initialProduct ? "Cập nhật thay đổi" : "Lưu linh kiện"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
