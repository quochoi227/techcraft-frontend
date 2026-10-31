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
  FileText,
  MessageSquare,
  Bot,
  AlertCircle,
} from "lucide-react"
import type { Product } from "@/types/product"
import { productService } from "@/services/api/productService"
import { MOCK_PRODUCTS } from "@/pages/admin/products/mockData"
import { CATEGORIES_META, formatPrice, formatDetail } from "./constants"
import { useCartStore } from "@/stores/cartStore"
import { ProductReviewSection } from "./components/ProductReviewSection"
import { RelatedProducts } from "./components/RelatedProducts"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [imageError, setImageError] = useState<boolean>(false)

  // Quantity & Action states
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // Active Tab: 'specs' | 'desc' | 'reviews' | 'policy'
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "reviews" | "policy">("specs")

  const addProductToCart = useCartStore((state) => state.addProduct)

  // Fetch product data on ID change
  useEffect(() => {
    let isMounted = true
    if (!id) return

    const fetchDetail = async () => {
      setIsLoading(true)
      setSelectedImageIndex(0)
      setQuantity(1)
      setImageError(false)

      try {
        const response = await productService.getProductById(id)
        const productData = response?.data || (response as any)
        if (productData && productData.id) {
          if (isMounted) {
            setProduct(productData)
            setIsUsingFallback(false)
          }
          return
        }
        throw new Error("Không tìm thấy dữ liệu từ server")
      } catch (err: any) {
        console.warn("Không thể tải chi tiết từ API, tìm kiếm trong Mock data:", err?.message)
        // Fallback to MOCK_PRODUCTS
        const fallbackProd = MOCK_PRODUCTS.find((p) => p.id === id)
        if (fallbackProd) {
          if (isMounted) {
            setProduct(fallbackProd)
            setIsUsingFallback(true)
          }
        } else {
          if (isMounted) {
            setProduct(null)
          }
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
              <div className="h-24 bg-slate-100 rounded-2xl" />
              <div className="h-12 w-full bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Không tìm thấy linh kiện máy tính này
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
            <Link to="/products">Về trang danh sách linh kiện</Link>
          </Button>
        </div>
      </div>
    )
  }

  const categoryMeta = CATEGORIES_META[product.category]
  const CategoryIcon = categoryMeta?.icon
  const formattedSpecs = formatDetail(product.category, product.detail)
  const inStock = (product.stockQuantity ?? 0) > 0
  const maxStock = product.stockQuantity ?? 1

  const imagesList =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.imageUrl)
      : [PLACEHOLDER_IMAGE]

  const currentImageUrl = imagesList[selectedImageIndex] || imagesList[0]

  const handleAddToCart = async () => {
    if (!inStock) {
      toast.error("Linh kiện này hiện đang tạm hết hàng!")
      return
    }

    setIsAdding(true)
    try {
      await addProductToCart(product, quantity)
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: `Giá: ${formatPrice(product.price * quantity)}`,
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
      toast.error("Linh kiện này hiện đang tạm hết hàng!")
      return
    }

    try {
      await addProductToCart(product, quantity)
      navigate("/cart")
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể tiến hành mua ngay"
      toast.error(msg)
    }
  }

  return (
    <div className="flex-1 bg-slate-50/60 pb-20">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link to="/products" className="hover:text-blue-600 transition shrink-0">
              Linh kiện máy tính
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              to={`/products?category=${product.category}`}
              className="hover:text-blue-600 transition shrink-0 font-semibold"
            >
              {categoryMeta?.shortLabel || product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Offline Fallback Banner */}
        {isUsingFallback && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Chưa kết nối được máy chủ Backend API. Đang hiển thị dữ liệu mẫu của linh kiện này.
              </span>
            </div>
          </div>
        )}

        {/* 2. Main Product Showcase Grid (Gallery + Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            {/* Primary Main Image */}
            <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-200/90 p-8 shadow-xs overflow-hidden flex items-center justify-center group">
              <img
                src={imageError ? PLACEHOLDER_IMAGE : currentImageUrl}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
              />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-xs ${
                    categoryMeta?.badgeClass || "bg-slate-100 text-slate-800"
                  }`}
                >
                  {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                  {categoryMeta?.shortLabel || product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Switcher */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx)
                      setImageError(false)
                    }}
                    className={`relative w-20 h-20 rounded-2xl border-2 overflow-hidden bg-white p-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? "border-blue-600 ring-4 ring-blue-100 shadow-sm"
                        : "border-slate-200/90 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* AI Assistant Quick Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Kiểm tra tương thích dàn PC?</div>
                  <div className="text-slate-500">Nhờ AI kiểm tra linh kiện này có vừa case/nguồn của bạn không.</div>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs shrink-0">
                <Link to="/ai-consultant">Tư vấn AI</Link>
              </Button>
            </div>
          </div>

          {/* Right: Info, Price, Add to Cart (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              {/* Category, Brand, Stock Status */}
              <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                    categoryMeta?.badgeClass || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                  {categoryMeta?.label || product.category}
                </span>

                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Còn hàng ({product.stockQuantity} sản phẩm trong kho)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Tạm hết hàng
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 ml-auto">
                  <ShieldCheck className="w-3.5 h-3.5" /> Chính hãng 100%
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review summary */}
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Math.round(product.averageRating || 5)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  {product.averageRating ? product.averageRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("reviews")
                    const el = document.getElementById("product-tabs")
                    el?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {product.totalReviews ?? product.reviews?.length ?? 12} đánh giá của khách hàng
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Giá bán lẻ chính hãng
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                  Đã bao gồm VAT
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight">
                {formatPrice(product.price)}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Bảo hành 36 tháng chính hãng theo quy định của nhà phân phối tại Việt Nam.
              </p>
            </div>

            {/* Key Specs Highlights Summary */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Thông số nổi bật:</span>
              </div>
              <div className="font-semibold text-slate-700">
                {product.detailSummary?.primary || formattedSpecs.primary}
              </div>
              <div className="text-slate-500">
                {product.detailSummary?.secondary || formattedSpecs.secondary}
              </div>
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Số lượng:</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    disabled={!inStock || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={!inStock || quantity >= maxStock}
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  (Tổng: {formatPrice(product.price * quantity)})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Button
                  type="button"
                  size="lg"
                  disabled={!inStock || isAdding}
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 h-12 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 text-sm gap-2 transition"
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4 animate-in zoom-in" />
                      <span>Đã thêm vào giỏ!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Thêm vào giỏ hàng</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  disabled={!inStock}
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg text-sm gap-2 transition"
                >
                  <Zap className="w-4 h-4" />
                  <span>Mua ngay</span>
                </Button>
              </div>
            </div>

            {/* Trust Service Guarantee Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/90 text-center">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Chính hãng 100%</span>
                <span className="text-[10px] text-slate-400">Bảo hành 36 tháng</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center">
                <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Giao siêu tốc</span>
                <span className="text-[10px] text-slate-400">Toàn quốc có bảo hiểm</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Đổi mới 1 - 1</span>
                <span className="text-[10px] text-slate-400">Trong vòng 30 ngày</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center">
                <Bot className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Chuẩn AI PC</span>
                <span className="text-[10px] text-slate-400">Tương thích phần cứng</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Tabbed Content (Specs, Description, Reviews, Policies) */}
        <div id="product-tabs" className="pt-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            {/* Tab navigation headers */}
            <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === "specs"
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Thông số kỹ thuật</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("desc")}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === "desc"
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Mô tả & Đặc điểm</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === "reviews"
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Đánh giá từ khách hàng</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {product.totalReviews ?? product.reviews?.length ?? 12}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("policy")}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === "policy"
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Chính sách bảo hành</span>
              </button>
            </div>

            {/* Tab content bodies */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: TECHNICAL SPECIFICATIONS */}
              {activeTab === "specs" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">
                      Bảng thông số kỹ thuật chi tiết
                    </h3>
                    <span className="text-xs text-slate-400">
                      Phân loại: <strong>{categoryMeta?.label}</strong>
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                    {formattedSpecs.specsList.map((spec, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 sm:p-4 gap-2 ${
                          i % 2 === 0 ? "bg-slate-50/50" : "bg-white"
                        }`}
                      >
                        <span className="font-semibold text-slate-500 sm:col-span-1">
                          {spec.label}
                        </span>
                        <span className="font-bold text-slate-900 sm:col-span-2">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Compatibility tip */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Gợi ý tương thích:</strong> Để đảm bảo hệ thống hoạt động ổn định nhất, hãy kiểm tra công suất bộ nguồn PSU tối thiểu và kích thước vỏ Case trước khi lắp đặt linh kiện này.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: DESCRIPTION & FEATURES */}
              {activeTab === "desc" && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-900">
                    Mô tả sản phẩm & Đặc tính nổi bật
                  </h3>

                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                    <p>{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <h4 className="font-bold text-slate-900">Ưu điểm nổi bật khi mua tại TechCraft:</h4>
                      <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                        <li>Sản phẩm phân phối chính hãng 100%, nguyên seal nguyên hộp.</li>
                        <li>Được kiểm tra chất lượng kỹ thuật trước khi bàn giao tới tay khách hàng.</li>
                        <li>Đội ngũ kỹ thuật viên hỗ trợ lắp ráp, tư vấn build cấu hình PC tối ưu chi phí.</li>
                        <li>Bảo hành điện tử qua số điện thoại hoặc email đặt hàng.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER REVIEWS */}
              {activeTab === "reviews" && (
                <div className="animate-in fade-in">
                  <ProductReviewSection
                    productId={product.id}
                    productName={product.name}
                    reviews={product.reviews}
                    averageRating={product.averageRating}
                    totalReviews={product.totalReviews}
                  />
                </div>
              )}

              {/* TAB 4: STORE POLICIES */}
              {activeTab === "policy" && (
                <div className="space-y-6 animate-in fade-in text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <h3 className="text-base font-bold text-slate-900">
                    Chính sách bảo hành & Đổi trả linh kiện
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Quy định bảo hành 36 tháng</span>
                      </div>
                      <p className="text-slate-600">
                        Linh kiện được bảo hành chính hãng theo tem nhà phân phối hoặc số serial điện tử. Không bảo hành các trường hợp cháy nổ, cong gãy chân socket, vô nước hoặc can thiệp vật lý.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>Chính sách đổi mới 30 ngày</span>
                      </div>
                      <p className="text-slate-600">
                        Đổi mới sản phẩm tương đương trong vòng 30 ngày đầu tiên nếu phát sinh lỗi phần cứng do nhà sản xuất (yêu cầu giữ nguyên bao bì hộp và phụ kiện đi kèm).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Related Products Section */}
        <RelatedProducts category={product.category} currentProductId={product.id} />
      </main>

      {/* 5. Sticky Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Giá bán lẻ</div>
            <div className="text-lg font-black text-blue-600 tracking-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Thêm giỏ
            </Button>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={handleBuyNow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
