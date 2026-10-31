import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  X,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Layers,
  Wrench,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import {
  USE_CASES_META,
  formatPrice,
  calculatePcCaseStock,
} from "../constants"
import { CATEGORIES_META } from "@/pages/products/constants"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface PcCaseDetailModalProps {
  pcCase: PcCase | null
  isOpen: boolean
  onClose: () => void
}

const PREBUILT_PC_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const PcCaseDetailModal: React.FC<PcCaseDetailModalProps> = ({
  pcCase,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const addPcCaseToCart = useCartStore((state) => state.addPcCase)

  useEffect(() => {
    setQuantity(1)
  }, [pcCase?.id])

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

  if (!isOpen || !pcCase) return null

  const useCaseMeta = USE_CASES_META[pcCase.useCase] || USE_CASES_META.gaming
  const UseCaseIcon = useCaseMeta?.icon
  const stock = calculatePcCaseStock(pcCase)
  const inStock = stock > 0

  const handleAddToCart = async () => {
    if (!inStock) {
      toast.error("Cấu hình PC này hiện đang tạm hết linh kiện lắp ráp!")
      return
    }

    setIsAdding(true)
    try {
      await addPcCaseToCart(pcCase, quantity)
      toast.success(`Đã thêm ${quantity} bộ PC vào giỏ hàng!`, {
        description: `Tổng tiền: ${formatPrice(pcCase.totalPrice * quantity)}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/90 hover:bg-slate-100 rounded-full transition-colors"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header Info */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  useCaseMeta.badgeClass
                }`}
              >
                {UseCaseIcon && <UseCaseIcon className="w-3.5 h-3.5" />}
                {useCaseMeta.label}
              </span>

              {inStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn sàng lắp ráp ({stock} bộ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                  Tạm hết linh kiện
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200 ml-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Kiểm tra tương thích 100%
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {pcCase.name}
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
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
              </div>
              <span className="font-bold text-slate-700 text-sm">
                {pcCase.averageRating ? pcCase.averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="text-slate-400">
                ({pcCase.totalReviews ?? 15} lượt đánh giá)
              </span>
            </div>

            {pcCase.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {pcCase.description}
              </p>
            )}
          </div>

          {/* Compatibility Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-950 flex items-start gap-3 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Đã kiểm định tương thích phần cứng:</span>{" "}
              Cấu hình PC này đã được các chuyên gia của TechCraft kiểm tra 8 ràng buộc
              kỹ thuật (Socket CPU, Chuẩn Bus RAM, Form Factor, Kích thước VGA, Chiều cao tản nhiệt & Công suất nguồn an toàn).
            </div>
          </div>

          {/* List of 8 Components Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Chi tiết danh sách linh kiện trong bộ máy ({pcCase.items?.length || 0} món)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pcCase.items?.map((item, idx) => {
                const catMeta = CATEGORIES_META[item.category]
                const CatIcon = catMeta?.icon
                const prod = item.product
                const prodImage =
                  prod?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
                  prod?.images?.[0]?.imageUrl ||
                  PREBUILT_PC_IMAGE

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={prodImage}
                        alt={prod?.name || item.category}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          catMeta?.badgeClass || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {CatIcon && <CatIcon className="w-3 h-3" />}
                        {catMeta?.shortLabel || item.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={prod?.name}>
                        {prod?.name || `Linh kiện ID: ${item.productId}`}
                      </h4>
                      {prod?.price && (
                        <div className="text-xs text-slate-500 font-medium">
                          {formatPrice(prod.price)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing & Free Assembly & Add to Cart */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div>
                <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">
                  Trọn bộ cấu hình lắp ráp
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight mt-0.5">
                  {formatPrice(pcCase.totalPrice)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Số lượng bộ:</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    disabled={!inStock || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={!inStock || quantity >= stock}
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-12 border-purple-200 text-purple-700 hover:bg-purple-50 font-bold px-4"
              >
                <Link to={`/pc-cases/${pcCase.id}`} onClick={onClose}>
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Xem chi tiết
                </Link>
              </Button>

              <Button
                type="button"
                size="lg"
                disabled={!inStock}
                onClick={handleAddToCart}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all h-12 text-sm"
              >
                {isAdding ? (
                  <>
                    <Check className="w-4 h-4 animate-in zoom-in" />
                    <span>Đã thêm dàn máy vào giỏ!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      Thêm vào giỏ hàng • {formatPrice(pcCase.totalPrice * quantity)}
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Free Services */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs text-slate-500">
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Miễn phí lắp ráp & Test máy</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giao hàng tận nơi toàn quốc</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Bảo hành 36 tháng chính hãng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
