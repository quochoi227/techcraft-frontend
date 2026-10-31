import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  Eye,
  Star,
  Check,
  Cpu,
  Sparkles,
  Layers,
  HardDrive,
  CheckCircle2,
} from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import {
  USE_CASES_META,
  formatPrice,
  calculatePcCaseStock,
  getComponentByCategory,
} from "../constants"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface PcCaseCardProps {
  pcCase: PcCase
  viewMode?: "grid" | "list"
  onQuickView: (pcCase: PcCase) => void
}

const PREBUILT_PC_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const PcCaseCard: React.FC<PcCaseCardProps> = ({
  pcCase,
  viewMode = "grid",
  onQuickView,
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const navigate = useNavigate()
  const addPcCaseToCart = useCartStore((state) => state.addPcCase)

  const useCaseMeta = USE_CASES_META[pcCase.useCase] || USE_CASES_META.gaming
  const UseCaseIcon = useCaseMeta?.icon
  const stock = calculatePcCaseStock(pcCase)
  const inStock = stock > 0

  // Trích xuất linh kiện chính để hiển thị thông số nhanh
  const cpu = getComponentByCategory(pcCase, "CPU")
  const gpu = getComponentByCategory(pcCase, "GPU")
  const ram = getComponentByCategory(pcCase, "RAM")
  const storage = getComponentByCategory(pcCase, "STORAGE")
  const caseProduct = getComponentByCategory(pcCase, "CASE")

  // Lấy ảnh vỏ case hoặc ảnh mặc định
  const displayImage =
    caseProduct?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
    caseProduct?.images?.[0]?.imageUrl ||
    PREBUILT_PC_IMAGE

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!inStock) {
      toast.error("Cấu hình PC này hiện đang tạm hết linh kiện lắp ráp!")
      return
    }

    setIsAdding(true)
    try {
      await addPcCaseToCart(pcCase, 1)
      toast.success(`Đã thêm dàn máy "${pcCase.name}" vào giỏ hàng!`, {
        description: `Giá: ${formatPrice(pcCase.totalPrice)}`,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể thêm PC vào giỏ hàng"
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
        onClick={() => navigate(`/pc-cases/${pcCase.id}`)}
        className="group relative flex flex-col sm:flex-row items-center gap-5 bg-white rounded-2xl border border-slate-200/90 p-5 transition-all duration-300 hover:shadow-xl hover:border-purple-300 cursor-pointer"
      >
        {/* Thumbnail Image */}
        <div className="relative w-full sm:w-52 h-52 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3">
          <img
            src={displayImage}
            alt={pcCase.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
            }}
          />
          {/* Quick View Button hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(pcCase)
            }}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold"
          >
            <Eye className="w-4 h-4" /> Xem linh kiện
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full py-1">
          <div>
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                  useCaseMeta.badgeClass
                }`}
              >
                {UseCaseIcon && <UseCaseIcon className="w-3.5 h-3.5" />}
                {useCaseMeta.label}
              </span>

              {inStock ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn hàng ({stock} bộ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                  Tạm hết linh kiện
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 ml-auto">
                <CheckCircle2 className="w-3 h-3" /> Tương thích 100%
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
              {pcCase.name}
            </h3>

            {/* Spec Highlights Grid */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {cpu && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/90 truncate">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-500" /> CPU
                  </div>
                  <div className="font-bold text-slate-700 truncate mt-0.5">{cpu.name}</div>
                </div>
              )}
              {gpu && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/90 truncate">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> VGA
                  </div>
                  <div className="font-bold text-slate-700 truncate mt-0.5">{gpu.name}</div>
                </div>
              )}
              {ram && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/90 truncate">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-500" /> RAM
                  </div>
                  <div className="font-bold text-slate-700 truncate mt-0.5">{ram.name}</div>
                </div>
              )}
              {storage && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/90 truncate">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-cyan-500" /> Ổ cứng
                  </div>
                  <div className="font-bold text-slate-700 truncate mt-0.5">{storage.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-medium">Trọn bộ cấu hình</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">
                {formatPrice(pcCase.totalPrice)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/pc-cases/${pcCase.id}`)
                }}
                className="hidden sm:inline-flex gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Eye className="w-3.5 h-3.5" /> Chi tiết PC
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`gap-1.5 text-xs font-bold transition-all ${
                  inStock
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow"
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
      onClick={() => navigate(`/pc-cases/${pcCase.id}`)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Floating Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-1 pointer-events-none">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border shadow-xs backdrop-blur-xs ${
            useCaseMeta.badgeClass
          }`}
        >
          {UseCaseIcon && <UseCaseIcon className="w-3 h-3" />}
          {useCaseMeta.shortLabel}
        </span>

        {inStock ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sẵn hàng ({stock})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            Hết hàng
          </span>
        )}
      </div>

      {/* Image Box */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-center">
        <img
          src={displayImage}
          alt={pcCase.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
          }}
        />

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(pcCase)
            }}
            className="h-8 px-3.5 rounded-full bg-white/95 text-slate-800 hover:bg-white text-xs font-bold shadow-md gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> Xem 8 linh kiện
          </Button>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(pcCase.averageRating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-700 text-[11px]">
              {pcCase.averageRating ? pcCase.averageRating.toFixed(1) : "5.0"}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({pcCase.totalReviews ?? 15})
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug min-h-[2.75rem]"
            title={pcCase.name}
          >
            {pcCase.name}
          </h3>

          {/* Specs tags pills */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
            {cpu && (
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate font-medium">{cpu.name}</span>
              </div>
            )}
            {gpu && (
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate font-medium">{gpu.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Trọn bộ cấu hình</div>
            <div className="text-lg sm:text-xl font-black text-purple-700 tracking-tight">
              {formatPrice(pcCase.totalPrice)}
            </div>
          </div>

          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              inStock
                ? isAdding
                  ? "bg-emerald-600 text-white scale-95"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white active:scale-95 shadow-xs"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
            title={inStock ? "Thêm vào giỏ hàng" : "Hết linh kiện"}
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
