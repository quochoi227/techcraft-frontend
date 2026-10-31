import React, { useState, useEffect } from "react"
import {
  X,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Info,
} from "lucide-react"
import type { Product } from "@/types/product"
import { CATEGORIES_META, formatPrice, formatDetail } from "../constants"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface ProductQuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const addItemToCart = useCartStore((state) => state.addItem)

  // Reset selected image and quantity whenever product changes
  useEffect(() => {
    setSelectedImageIndex(0)
    setQuantity(1)
  }, [product?.id])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

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
      toast.error("Sản phẩm hiện đang tạm hết hàng!")
      return
    }

    setIsAdding(true)
    try {
      await addItemToCart(product, quantity)
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: `Tổng tiền: ${formatPrice(product.price * quantity)}`,
      })
      setTimeout(() => {
        setIsAdding(false)
        onClose()
      }, 300)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể thêm vào giỏ hàng"
      toast.error(msg)
      setIsAdding(false)
    }
  }

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(maxStock, prev + 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition-colors backdrop-blur-xs"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center overflow-hidden">
                <img
                  src={currentImageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 p-1 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
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

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Chính hãng 100%</span>
                  <span className="text-[10px] text-slate-400">Bảo hành 36T</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                  <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Giao siêu tốc</span>
                  <span className="text-[10px] text-slate-400">Toàn quốc</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                  <RotateCcw className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Đổi trả 1-1</span>
                  <span className="text-[10px] text-slate-400">Trong 30 ngày</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Specs */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                {/* Category & Stock */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      categoryMeta?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                    {categoryMeta?.label || product.category}
                  </span>

                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Còn {product.stockQuantity} sản phẩm trong kho
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Tạm hết hàng
                    </span>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.averageRating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {product.averageRating ? product.averageRating.toFixed(1) : "5.0"}
                  </span>
                  <span className="text-slate-400">
                    ({product.totalReviews ?? 12} lượt đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                    Giá bán ưu đãi
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight mt-0.5">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </div>
                )}
              </div>

              {/* Technical Specifications Table */}
              {formattedSpecs.specsList.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    Thông số kỹ thuật chi tiết
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                    {formattedSpecs.specsList.map((spec, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-2 p-2.5 ${
                          i % 2 === 0 ? "bg-slate-50/50" : "bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-500">{spec.label}</span>
                        <span className="font-bold text-slate-800 text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart Action */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">Số lượng:</span>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      disabled={!inStock || quantity <= 1}
                      onClick={handleDecreaseQuantity}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!inStock || quantity >= maxStock}
                      onClick={handleIncreaseQuantity}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    (Có sẵn {product.stockQuantity} sản phẩm)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="lg"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-4 h-4 animate-in zoom-in" />
                        <span>Đã thêm vào giỏ!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Thêm vào giỏ hàng • {formatPrice(product.price * quantity)}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
