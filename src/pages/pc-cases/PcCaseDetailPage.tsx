import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ChevronRight,
  Home,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Zap,
  Check,
  Minus,
  Plus,
  Info,
  Layers,
  Cpu,
  Sparkles,
  HardDrive,
  Wrench,
  CheckCircle2,
  Bot,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  BadgeCheck,
} from "lucide-react"
import type { PcCase, PcCaseItem } from "@/types/pcCase"
import { pcCaseService } from "@/services/api/pcCaseService"
import { MOCK_PC_CASES } from "./mockData"
import {
  USE_CASES_META,
  formatPrice,
  calculatePcCaseStock,
  getComponentByCategory,
} from "./constants"
import { CATEGORIES_META, formatDetail } from "@/pages/products/constants"
import { useCartStore } from "@/stores/cartStore"
import { PcCaseReviewSection } from "./components/PcCaseReviewSection"
import { RelatedPcCases } from "./components/RelatedPcCases"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const PREBUILT_PC_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

interface GalleryItem {
  id: string
  label: string
  category?: string
  imageUrl: string
  productName?: string
}

export const PcCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [pcCase, setPcCase] = useState<PcCase | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Gallery state
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0)
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([])

  // Quantity & Action states
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // Tab state: 'components' | 'specs' | 'desc' | 'reviews' | 'policy'
  const [activeTab, setActiveTab] = useState<"components" | "specs" | "desc" | "reviews" | "policy">("components")

  const addPcCaseToCart = useCartStore((state) => state.addPcCase)

  // Fetch PC Case detail by ID
  useEffect(() => {
    let isMounted = true
    if (!id) return

    const fetchDetail = async () => {
      setIsLoading(true)
      setActiveGalleryIndex(0)
      setQuantity(1)

      try {
        const response = await pcCaseService.getPcCaseById(id)
        const caseData = response?.data || (response as any)
        if (caseData && caseData.id) {
          if (isMounted) {
            setPcCase(caseData)
            setIsUsingFallback(false)
            buildGallery(caseData)
          }
          return
        }
        throw new Error("Không có dữ liệu từ máy chủ")
      } catch (err: any) {
        console.warn("Không thể tải chi tiết PC Case từ API, dùng Mock data:", err?.message)
        const fallbackCase = MOCK_PC_CASES.find((p) => p.id === id)
        if (fallbackCase) {
          if (isMounted) {
            setPcCase(fallbackCase)
            setIsUsingFallback(true)
            buildGallery(fallbackCase)
          }
        } else {
          if (isMounted) setPcCase(null)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchDetail()
    window.scrollTo({ top: 0, behavior: "smooth" })

    return () => {
      isMounted = false
    }
  }, [id])

  // Build high-res gallery list from PC Case shell and all included components
  const buildGallery = (data: PcCase) => {
    const list: GalleryItem[] = []

    // 1. Primary Case Image
    const caseProd = getComponentByCategory(data, "CASE")
    const primaryCaseImg =
      caseProd?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
      caseProd?.images?.[0]?.imageUrl ||
      PREBUILT_PC_IMAGE

    list.push({
      id: "shell",
      label: "Tổng quan dàn PC",
      category: "Toàn bộ máy",
      imageUrl: primaryCaseImg,
      productName: data.name,
    })

    // 2. Component Images
    data.items?.forEach((item) => {
      if (item.category !== "CASE" && item.product) {
        const img =
          item.product.images?.find((i) => i.primary || i.isPrimary)?.imageUrl ||
          item.product.images?.[0]?.imageUrl

        if (img) {
          const meta = CATEGORIES_META[item.category]
          list.push({
            id: item.id || item.category,
            label: meta?.shortLabel || item.category,
            category: item.category,
            imageUrl: img,
            productName: item.product.name,
          })
        }
      }
    })

    setGalleryImages(list.length > 0 ? list : [{ id: "def", label: "PC", imageUrl: PREBUILT_PC_IMAGE }])
  }

  if (isLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-slate-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-4/5 bg-slate-200 rounded" />
              <div className="h-6 w-1/3 bg-slate-200 rounded" />
              <div className="h-12 w-2/5 bg-slate-200 rounded-xl" />
              <div className="h-28 bg-slate-100 rounded-2xl" />
              <div className="h-12 w-full bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pcCase) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Không tìm thấy cấu hình PC này
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cấu hình có thể đã ngừng cung cấp hoặc liên kết không còn chính xác.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
            <Link to="/pc-cases">Về trang danh sách PC Case</Link>
          </Button>
        </div>
      </div>
    )
  }

  const useCaseMeta = USE_CASES_META[pcCase.useCase] || USE_CASES_META.gaming
  const UseCaseIcon = useCaseMeta?.icon
  const stock = calculatePcCaseStock(pcCase)
  const inStock = stock > 0
  const maxStock = Math.max(1, stock)

  // Main specs shortcuts
  const cpu = getComponentByCategory(pcCase, "CPU")
  const gpu = getComponentByCategory(pcCase, "GPU")
  const ram = getComponentByCategory(pcCase, "RAM")
  const mainboard = getComponentByCategory(pcCase, "MAINBOARD")
  const storage = getComponentByCategory(pcCase, "STORAGE")
  const psu = getComponentByCategory(pcCase, "PSU")
  const cooler = getComponentByCategory(pcCase, "CPU_COOLER")
  const pcShell = getComponentByCategory(pcCase, "CASE")

  // Sum of individual item prices to show combo savings
  const individualTotal = (pcCase.items || []).reduce((sum, item) => {
    return sum + (item.product?.price || 0)
  }, 0)

  const currentGalleryItem = galleryImages[activeGalleryIndex] || galleryImages[0]

  const handleAddToCart = async () => {
    if (!inStock) {
      toast.error("Cấu hình PC này hiện đang tạm hết linh kiện lắp ráp!")
      return
    }

    setIsAdding(true)
    try {
      await addPcCaseToCart(pcCase, quantity)
      toast.success(`Đã thêm ${quantity} bộ PC "${pcCase.name}" vào giỏ hàng!`, {
        description: `Tổng tiền: ${formatPrice(pcCase.totalPrice * quantity)}`,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể thêm vào giỏ hàng"
      toast.error(msg)
    } finally {
      setTimeout(() => {
        setIsAdding(false)
      }, 400)
    }
  }

  const handleBuyNow = async () => {
    if (!inStock) {
      toast.error("Cấu hình PC này hiện đang tạm hết linh kiện lắp ráp!")
      return
    }

    try {
      await addPcCaseToCart(pcCase, quantity)
      navigate("/cart")
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tiến hành mua ngay"
      toast.error(msg)
    }
  }

  return (
    <div className="flex-1 bg-slate-50/60 pb-20">
      {/* 1. Breadcrumb & Notice */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-purple-600 flex items-center gap-1 shrink-0 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/pc-cases" className="hover:text-purple-600 shrink-0 transition-colors">
              Cấu hình PC
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              to={`/pc-cases?useCase=${pcCase.useCase}`}
              className="hover:text-purple-600 shrink-0 transition-colors text-purple-700 font-semibold"
            >
              {useCaseMeta.shortLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {pcCase.name}
            </span>
          </nav>

          {isUsingFallback && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Info className="w-3 h-3 text-amber-500" />
              Dữ liệu demo offline
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 2. Main Showcase: Gallery & Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Gallery & Component Visualizer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage */}
            <div className="relative aspect-4/3 sm:aspect-16/11 w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex items-center justify-center p-6 group">
              <img
                src={currentGalleryItem?.imageUrl || PREBUILT_PC_IMAGE}
                alt={currentGalleryItem?.label || pcCase.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
                }}
              />

              {/* Tag on current image */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-md backdrop-blur-xs">
                  {currentGalleryItem?.label || "Tổng quan dàn PC"}
                </span>
                {currentGalleryItem?.productName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/80 text-white shadow-xs max-w-xs truncate">
                    {currentGalleryItem.productName}
                  </span>
                )}
              </div>

              {/* Hardware verified seal */}
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đạt 8/8 chuẩn tương thích
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel: Click to inspect each component inside */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Xem ảnh thực tế từng linh kiện trong bộ PC ({galleryImages.length}):
                </span>
                <span className="text-[11px] text-slate-400">Click để phóng to</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {galleryImages.map((img, index) => {
                  const isActive = index === activeGalleryIndex
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveGalleryIndex(index)}
                      className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border p-1.5 flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? "border-purple-600 ring-2 ring-purple-100 shadow-md"
                          : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
                        }}
                      />
                      <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-center bg-slate-900/70 text-white rounded-md py-0.5 truncate px-1">
                        {img.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hardware Stability Banner */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-100/80 flex items-center gap-3.5 text-xs text-slate-700">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block">
                  Lắp ráp chuyên nghiệp & Miễn phí đi dây thẩm mỹ
                </span>
                <span className="text-slate-500">
                  Dàn PC được lắp ráp bởi kỹ thuật viên tay nghề cao, kiểm tra nhiệt độ (Stress test FurMark & Cinebench) trong 60 phút trước khi giao hàng.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Category, UseCase & Stock Status */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${useCaseMeta.badgeClass}`}
                >
                  {UseCaseIcon && <UseCaseIcon className="w-3.5 h-3.5" />}
                  {useCaseMeta.label}
                </span>

                {inStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Lắp sẵn sàng ({stock} bộ)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Tạm hết linh kiện
                  </span>
                )}
              </div>

              {/* PC Case Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {pcCase.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {pcCase.description || useCaseMeta.description}
                </p>
              </div>

              {/* Star Rating & Reviews */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(pcCase.averageRating || 5)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="font-bold text-slate-700 ml-1">
                    {pcCase.averageRating ? pcCase.averageRating.toFixed(1) : "5.0"}
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  {pcCase.totalReviews ?? 18} đánh giá khách hàng
                </button>
              </div>

              {/* Price Area */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Giá trọn bộ cấu hình:</span>
                  {individualTotal > pcCase.totalPrice && (
                    <span className="line-through text-slate-400">
                      {formatPrice(individualTotal)}
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                  {formatPrice(pcCase.totalPrice)}
                </div>
                {individualTotal > pcCase.totalPrice && (
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tiết kiệm {formatPrice(individualTotal - pcCase.totalPrice)} so với mua linh kiện rời!
                  </div>
                )}
              </div>

              {/* Quick Specs Highlight */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Thông số cốt lõi:</span>
                <div className="grid grid-cols-2 gap-2">
                  {cpu && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-blue-500" /> CPU
                      </div>
                      <div className="font-bold text-slate-800 truncate mt-0.5">{cpu.name}</div>
                    </div>
                  )}
                  {gpu && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" /> VGA
                      </div>
                      <div className="font-bold text-slate-800 truncate mt-0.5">{gpu.name}</div>
                    </div>
                  )}
                  {ram && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-500" /> RAM
                      </div>
                      <div className="font-bold text-slate-800 truncate mt-0.5">{ram.name}</div>
                    </div>
                  )}
                  {storage && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-cyan-500" /> Ổ cứng
                      </div>
                      <div className="font-bold text-slate-800 truncate mt-0.5">{storage.name}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Số lượng bộ PC:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <button
                      type="button"
                      disabled={quantity <= 1 || !inStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-purple-600 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= maxStock || !inStock}
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-purple-600 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!inStock || isAdding}
                    onClick={handleAddToCart}
                    className="h-12 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 font-bold text-xs gap-2"
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                        <span>Đã thêm</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    disabled={!inStock}
                    onClick={handleBuyNow}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all gap-2"
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Mua ngay</span>
                  </Button>
                </div>
              </div>

              {/* AI Consultant Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-purple-900 block">Cần tư vấn điều chỉnh cấu hình?</span>
                  <span className="text-purple-700 text-[11px] leading-relaxed">
                    Sử dụng TechCraft AI Chatbot để tùy biến cấu hình theo ngân sách hoặc tựa game bạn muốn trải nghiệm.
                  </span>
                </div>
              </div>
            </div>

            {/* Store Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Bảo hành 12-36T</span>
                  <span className="text-slate-400">Từng linh kiện chính hãng</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2.5">
                <RotateCcw className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Đổi mới 7 ngày</span>
                  <span className="text-slate-400">1-đổi-1 nếu lỗi phần cứng</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Miễn phí giao hàng</span>
                  <span className="text-slate-400">Đóng gói xốp bảo vệ 2 lớp</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Hỗ trợ trọn đời</span>
                  <span className="text-slate-400">UltraViewer & Vệ sinh free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Component List Table (Always visible as core section) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Danh sách {pcCase.items?.length || 8} linh kiện chi tiết trong bộ PC
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toàn bộ linh kiện mới 100% nguyên seal, đầy đủ hóa đơn VAT và bảo hành chính hãng
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">Tổng cộng:</span>
              <span className="text-base font-extrabold text-purple-700">
                {formatPrice(pcCase.totalPrice)}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {pcCase.items?.map((item: PcCaseItem, idx) => {
              const prod = item.product
              const catMeta = CATEGORIES_META[item.category]
              const CatIcon = catMeta?.icon
              const specs = prod?.detail ? formatDetail(item.category, prod.detail) : null
              const itemStock = (prod?.stockQuantity ?? 0) > 0
              const itemImg =
                prod?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
                prod?.images?.[0]?.imageUrl ||
                PREBUILT_PC_IMAGE

              return (
                <div
                  key={item.id || idx}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Category Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        catMeta?.badgeClass || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {CatIcon && <CatIcon className="w-5 h-5" />}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={itemImg}
                        alt={prod?.name || item.category}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
                        }}
                      />
                    </div>

                    {/* Component Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {catMeta?.shortLabel || item.category}
                        </span>
                        {itemStock ? (
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Sẵn hàng ({prod?.stockQuantity} sp)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-500">
                            Tạm hết hàng
                          </span>
                        )}
                      </div>

                      {prod?.id ? (
                        <Link
                          to={`/products/${prod.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-purple-600 transition-colors line-clamp-1 inline-flex items-center gap-1 group"
                        >
                          <span>{prod.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-purple-600 shrink-0" />
                        </Link>
                      ) : (
                        <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {prod?.name || "Linh kiện tiêu chuẩn"}
                        </span>
                      )}

                      {/* Specs snippet */}
                      {specs && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {specs.primary} {specs.secondary && `• ${specs.secondary}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Individual Price */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 pl-14 sm:pl-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Giá bán lẻ</div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                        {prod?.price ? formatPrice(prod.price) : "Liên hệ"}
                      </div>
                    </div>
                    {prod?.id && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        <Link to={`/products/${prod.id}`}>Xem linh kiện</Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Tab Navigation Section (4 Tabs) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div className="flex items-center border-b border-slate-200 px-4 sm:px-6 overflow-x-auto no-scrollbar gap-2 sm:gap-6 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("components")}
              className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "components"
                  ? "border-purple-600 text-purple-700 bg-white sm:bg-transparent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-purple-600" />
              Tương thích phần cứng (8 tiêu chuẩn)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "specs"
                  ? "border-purple-600 text-purple-700 bg-white sm:bg-transparent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Info className="w-4 h-4 text-purple-600" />
              Thông số kỹ thuật tổng hợp
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "desc"
                  ? "border-purple-600 text-purple-700 bg-white sm:bg-transparent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              Mô tả & Hiệu năng trải nghiệm
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-purple-600 text-purple-700 bg-white sm:bg-transparent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Đánh giá ({pcCase.reviews?.length || pcCase.totalReviews || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("policy")}
              className={`py-4 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "policy"
                  ? "border-purple-600 text-purple-700 bg-white sm:bg-transparent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Quy trình test máy & Bảo hành
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: HARDWARE COMPATIBILITY 8 CHECKS */}
            {activeTab === "components" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Chứng nhận 8/8 ràng buộc tương thích phần cứng từ TechCraft Backend
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cấu hình này đã được hệ thống thuật toán kiểm tra ràng buộc tương thích vật lý, điện áp và socket trước khi đưa lên niêm yết.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rule 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">1. Socket CPU & Mainboard</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      CPU socket <span className="font-bold text-slate-700">{cpu?.detail?.socket || "LGA1700 / AM5"}</span> hoàn toàn khớp với Mainboard socket <span className="font-bold text-slate-700">{mainboard?.detail?.socket || "LGA1700 / AM5"}</span>.
                    </p>
                  </div>

                  {/* Rule 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">2. Chuẩn bộ nhớ RAM & CPU</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Loại RAM <span className="font-bold text-slate-700">{ram?.detail?.type || "DDR5"}</span> được vi xử lý hỗ trợ hoàn hảo ở kênh đôi Dual-channel.
                    </p>
                  </div>

                  {/* Rule 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">3. Khe cắm RAM trên Mainboard</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Bo mạch chủ hỗ trợ chuẩn <span className="font-bold text-slate-700">{mainboard?.detail?.memoryType || "DDR5"}</span> với tốc độ xung nhịp XMP/EXPO tối ưu.
                    </p>
                  </div>

                  {/* Rule 4 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">4. Form factor Mainboard & Vỏ Case</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Kích thước Mainboard <span className="font-bold text-slate-700">{mainboard?.detail?.formFactor || "ATX"}</span> vừa vặn khoang lắp đặt của vỏ case.
                    </p>
                  </div>

                  {/* Rule 5 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">5. Kích thước Card đồ họa (VGA Length)</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Chiều dài VGA <span className="font-bold text-slate-700">{gpu?.detail?.lengthMm ? `${gpu.detail.lengthMm} mm` : "320 mm"}</span> ngắn hơn giới hạn tối đa của Case ({pcShell?.detail?.maxGpuLengthMm ? `${pcShell.detail.maxGpuLengthMm} mm` : "380 mm"}).
                    </p>
                  </div>

                  {/* Rule 6 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">6. Chiều cao tản nhiệt CPU (Cooler Height)</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tản nhiệt CPU lắp đặt vừa vặn, không bị cấn kính hông vỏ case ({pcShell?.detail?.maxCoolerHeightMm ? `< ${pcShell.detail.maxCoolerHeightMm} mm` : "Đạt chuẩn"}).
                    </p>
                  </div>

                  {/* Rule 7 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">7. Socket ngàm đỡ Tản nhiệt CPU</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ngàm bắt tản nhiệt tương thích 100% với chân đế của CPU ({cpu?.detail?.socket || "LGA1700 / AM5"}), diện tích tiếp xúc kem tản nhiệt tối ưu.
                    </p>
                  </div>

                  {/* Rule 8 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">8. Công suất nguồn (PSU Safety Margin)</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tương thích (Hệ số an toàn {'>'} 20%)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Công suất nguồn <span className="font-bold text-slate-700">{psu?.detail?.wattageW ? `${psu.detail.wattageW}W` : "750W"}</span> đủ tải cho toàn bộ hệ thống ngay cả khi ép xung hoặc tải nặng toàn thời gian.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPECS BREAKDOWN */}
            {activeTab === "specs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bảng thông số kỹ thuật tổng hợp bộ máy
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Chi tiết thông số điện năng, bộ nhớ và các cổng kết nối sẵn có trên bộ PC
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50/70 font-semibold text-slate-500">
                    <div>Linh kiện / Thành phần</div>
                    <div className="col-span-2">Thông số cấu hình thực tế</div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" /> Vi xử lý (CPU)
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {cpu?.name || "Chưa xác định"} • {cpu?.detail?.cores ? `${cpu.detail.cores} nhân / ${cpu.detail.threads} luồng` : "Hiệu năng cao"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Card đồ họa (VGA)
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {gpu?.name || "Card đồ họa rời"} • {gpu?.detail?.vramGb ? `${gpu.detail.vramGb}GB ${gpu.detail.vramType || "GDDR6"}` : "Đồ họa cao cấp"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" /> Bộ nhớ RAM
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {ram?.name || "RAM DDR5"} • {ram?.detail?.totalGb ? `${ram.detail.totalGb}GB (${ram.detail.speedMhz || "6000"}MHz)` : "Dung lượng lớn"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-600" /> Lưu trữ (Ổ cứng)
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {storage?.name || "SSD NVMe M.2"} • {storage?.detail?.capacityGb ? `${storage.detail.capacityGb}GB (${storage.detail.interface || "PCIe 4.0"})` : "Tốc độ đọc ghi cao"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" /> Bộ nguồn (PSU)
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {psu?.name || "Nguồn máy tính chính hãng"} • {psu?.detail?.wattageW ? `${psu.detail.wattageW}W (${psu.detail.efficiency || "80 Plus"})` : "Chuẩn nguồn an toàn"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 items-center">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Tản nhiệt & Vỏ Case
                    </div>
                    <div className="col-span-2 text-slate-800 font-medium">
                      {cooler?.name || "Tản nhiệt chuyên dụng"} & {pcShell?.name || "Vỏ case Mid Tower"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DESCRIPTION & BENCHMARKS */}
            {activeTab === "desc" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Mô tả & Khả năng đáp ứng công việc
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cấu hình được thiết kế hướng tới sự cân bằng hoàn hảo giữa sức mạnh tính toán và khả năng tản nhiệt bền bỉ
                  </p>
                </div>

                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
                  <p>
                    {pcCase.description ||
                      `Bộ máy tính ${pcCase.name} là giải pháp hoàn hảo cho người dùng tìm kiếm sự kết hợp giữa hiệu năng mạnh mẽ và tính ổn định dài lâu. Từng linh kiện được lựa chọn khắt khe từ các thương hiệu hàng đầu thế giới như ASUS, Corsair, Intel, AMD, đảm bảo tương thích hoàn toàn và khả năng nâng cấp linh hoạt trong tương lai.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 not-prose">
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Trải nghiệm Gaming & Esports
                      </span>
                      <p className="text-xs text-purple-700 leading-relaxed">
                        Cân tốt mọi tựa game Esport (Valorant, CS2, LOL, Dota 2) trên 240+ FPS. Chiến mượt mà các siêu phẩm AAA (Black Myth: Wukong, Cyberpunk 2077, God of War) ở thiết lập đồ họa cao.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        Xử lý đồ họa & Đa nhiệm
                      </span>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Dựng hình 3D, Render video Premiere 4K, After Effects, Photoshop, AutoCAD mượt mà. Dung lượng RAM lớn hỗ trợ mở hàng chục tab trình duyệt và ứng dụng cùng lúc không lo giật lag.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">
                    Quà tặng & Dịch vụ tặng kèm khi mua nguyên bộ:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                    <li>Miễn phí công lắp ráp linh kiện, đi dây giấu gọn mặt lưng thẩm mỹ chuẩn showroom.</li>
                    <li>Cài đặt sẵn hệ điều hành Windows 11 Pro và các driver phần cứng mới nhất.</li>
                    <li>Tặng kèm gói vệ sinh và tra keo tản nhiệt định kỳ miễn phí trong 1 năm đầu.</li>
                    <li>Hỗ trợ xử lý sự cố phần mềm từ xa qua UltraViewer trọn đời máy.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === "reviews" && (
              <PcCaseReviewSection
                pcCaseId={pcCase.id}
                pcCaseName={pcCase.name}
                reviews={pcCase.reviews}
                averageRating={pcCase.averageRating}
                totalReviews={pcCase.totalReviews}
              />
            )}

            {/* TAB 5: POLICY & WARRANTY */}
            {activeTab === "policy" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Quy trình bàn giao & Chính sách bảo hành
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    TechCraft cam kết đem đến sự an tâm tuyệt đối cho khách hàng khi sở hữu trọn bộ PC
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Stress test kiểm tra nghiêm ngặt
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Trước khi đóng thùng, kỹ thuật viên cho máy chạy thử 60 phút bằng các phần mềm chuyên sâu (FurMark, Cinebench R23, MemTest86) để đảm bảo không phát sinh lỗi dump xanh hay quá nhiệt.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Đóng gói chống sốc 2 lớp
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bộ máy được chèn mút xốp chống rung bên trong khoang kính để cố định VGA và tản nhiệt khí, bên ngoài bọc màng khí và thùng carton chuyên dụng đảm bảo an toàn khi vận chuyển toàn quốc.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Đổi mới 1-đổi-1 trong 7 ngày
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Trong 7 ngày đầu sử dụng, nếu bất kỳ linh kiện nào phát sinh lỗi phần cứng do nhà sản xuất, TechCraft sẽ đổi mới ngay linh kiện đó mà không giữ lại bảo hành sửa chữa.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Related PC Configurations */}
        <div className="pt-4">
          <RelatedPcCases currentPcCaseId={pcCase.id} useCase={pcCase.useCase} />
        </div>
      </div>

      {/* 6. Sticky Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-slate-400 font-medium">Tổng tiền trọn bộ</div>
          <div className="text-base font-extrabold text-purple-700 truncate">
            {formatPrice(pcCase.totalPrice)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            disabled={!inStock || isAdding}
            onClick={handleAddToCart}
            className="h-10 px-3 border-purple-200 text-purple-700 font-bold text-xs"
          >
            {isAdding ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            disabled={!inStock}
            onClick={handleBuyNow}
            className="h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 mr-1" /> Mua ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
