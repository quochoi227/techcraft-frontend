import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Eye, Star, Check } from "lucide-react"
import type { Product } from "@/types/product"
import { CATEGORIES_META, formatPrice, formatDetail } from "../constants"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
  onQuickView: (product: Product) => void
}

// Placeholder fallback image when Cloudinary image fails or is missing
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  onQuickView,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const navigate = useNavigate()

  const addItemToCart = useCartStore((state) => state.addItem)

  // Lấy ảnh đại diện chính (hoặc ảnh đầu tiên)
  const primaryImage =
    product.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    PLACEHOLDER_IMAGE

  const categoryMeta = CATEGORIES_META[product.category]
  const CategoryIcon = categoryMeta?.icon
  const formattedSpecs = formatDetail(product.category, product.detail)
  const inStock = (product.stockQuantity ?? 0) > 0
  const totalReviewsCount = product.totalReviews ?? product.reviews?.length ?? 0
  const hasReviews = totalReviewsCount > 0 && typeof product.averageRating === "number" && product.averageRating > 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!inStock) {
      toast.error("Sản phẩm hiện đang tạm hết hàng!")
      return
    }

    setIsAdding(true)
    try {
      await addItemToCart(product, 1)
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        description: `Giá: ${formatPrice(product.price)}`,
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

  // -------------------------------------------------------------
  // LIST VIEW LAYOUT
  // -------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="group relative flex flex-col sm:flex-row items-center gap-4 bg-white rounded-xl border border-slate-200/80 p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
      >
        {/* Thumbnail Image */}
        <div className="relative w-full sm:w-48 h-48 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <img
            src={imageError ? PLACEHOLDER_IMAGE : primaryImage}
            alt={product.name}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse" />
          )}

          {/* Quick View Button hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(product)
            }}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold"
          >
            <Eye className="w-4 h-4" /> Xem nhanh
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full py-1">
          <div>
            {/* Category & Stock Tag */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  categoryMeta?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                {categoryMeta?.shortLabel || product.category}
              </span>

              {inStock ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Còn {product.stockQuantity} sp
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Hết hàng
                </span>
              )}

              {/* Star Rating */}
              {hasReviews ? (
                <div className="flex items-center gap-1 text-xs text-amber-500 ml-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">
                    {product.averageRating!.toFixed(1)}
                  </span>
                  <span className="text-slate-400">({totalReviewsCount})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                  <Star className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-400">Chưa có đánh giá</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>

            {/* Key specs highlight */}
            <p className="mt-1.5 text-xs text-slate-500 font-medium line-clamp-1">
              {product.detailSummary?.primary || formattedSpecs.primary}
            </p>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {product.detailSummary?.secondary || formattedSpecs.secondary}
            </p>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-medium">Giá bán chính hãng</div>
              <div className="text-lg sm:text-xl font-extrabold text-blue-600 tracking-tight">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/products/${product.id}`)
                }}
                className="hidden sm:inline-flex gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Eye className="w-3.5 h-3.5" /> Chi tiết
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`gap-1.5 text-xs font-semibold transition-all ${
                  inStock
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isAdding ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />
                    <span>Đã thêm</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Thêm vào giỏ</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // GRID VIEW LAYOUT (DEFAULT)
  // -------------------------------------------------------------
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 cursor-pointer"
    >
      {/* Category Badge & Stock Floating */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border shadow-xs backdrop-blur-xs ${
            categoryMeta?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
          {categoryMeta?.shortLabel || product.category}
        </span>

        {inStock ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Còn hàng
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            Hết hàng
          </span>
        )}
      </div>

      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-center">
        <img
          src={imageError ? PLACEHOLDER_IMAGE : primaryImage}
          alt={product.name}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-108 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        {/* Hover Action overlay */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(product)
            }}
            className="h-8 px-3 rounded-full bg-white/95 text-slate-800 hover:bg-white text-xs font-semibold shadow-md gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> Xem nhanh
          </Button>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating */}
          {hasReviews ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(product.averageRating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-700 text-[11px]">
                {product.averageRating!.toFixed(1)}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({totalReviewsCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-slate-100 text-slate-200"
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Chưa có đánh giá
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Spec summary badges */}
          <div className="mt-2.5 pt-2 border-t border-slate-100/90 text-[11px] text-slate-500 space-y-1">
            <div className="truncate font-medium text-slate-600">
              {product.detailSummary?.primary || formattedSpecs.primary}
            </div>
            <div className="truncate text-slate-400">
              {product.detailSummary?.secondary || formattedSpecs.secondary}
            </div>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Giá bán lẻ</div>
            <div className="text-base sm:text-lg font-extrabold text-blue-600 tracking-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              inStock
                ? isAdding
                  ? "bg-emerald-600 text-white scale-95"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95 shadow-xs"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
            title={inStock ? "Thêm vào giỏ hàng" : "Hết hàng"}
          >
            {isAdding ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
