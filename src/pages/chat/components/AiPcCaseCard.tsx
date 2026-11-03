import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  ExternalLink,
  Star,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import {
  USE_CASES_META,
  formatPrice,
  calculatePcCaseStock,
  getComponentByCategory,
} from "@/pages/pc-cases/constants"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface AiPcCaseCardProps {
  pcCase: PcCase
}

const DEFAULT_PC_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const AiPcCaseCard: React.FC<AiPcCaseCardProps> = ({ pcCase }) => {
  const [isAdding, setIsAdding] = useState(false)
  const navigate = useNavigate()
  const addPcCaseToCart = useCartStore((state) => state.addPcCase)

  const useCaseMeta = USE_CASES_META[pcCase.useCase] || USE_CASES_META.gaming
  const UseCaseIcon = useCaseMeta?.icon || Sparkles
  const stock = calculatePcCaseStock(pcCase)
  const inStock = stock > 0

  // Trích xuất linh kiện chính
  const cpu = getComponentByCategory(pcCase, "CPU")
  const gpu = getComponentByCategory(pcCase, "GPU")
  const ram = getComponentByCategory(pcCase, "RAM")
  const storage = getComponentByCategory(pcCase, "STORAGE")
  const caseProduct = getComponentByCategory(pcCase, "CASE")

  // Lấy ảnh vỏ case hoặc ảnh mặc định
  const displayImage =
    caseProduct?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
    caseProduct?.images?.[0]?.imageUrl ||
    DEFAULT_PC_IMAGE

  const totalReviewsCount = pcCase.totalReviews ?? pcCase.reviews?.length ?? 0
  const hasReviews = totalReviewsCount > 0 && typeof pcCase.averageRating === "number" && pcCase.averageRating > 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!inStock) {
      toast.error("Bộ PC này hiện đang tạm hết linh kiện lắp ráp!")
      return
    }

    setIsAdding(true)
    try {
      await addPcCaseToCart(pcCase, 1)
      toast.success(`Đã thêm bộ PC "${pcCase.name}" vào giỏ hàng!`, {
        description: `Giá niêm yết: ${formatPrice(pcCase.totalPrice)}`,
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

  return (
    <div
      onClick={() => navigate(`/pc-cases/${pcCase.id}`)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 overflow-hidden text-left cursor-pointer"
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-b border-slate-100">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
          <UseCaseIcon className="w-3.5 h-3.5" />
          {useCaseMeta.shortLabel}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            inStock
              ? "bg-emerald-100/80 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          {inStock ? `Sẵn hàng (${stock})` : "Tạm hết hàng"}
        </span>
      </div>

      <div className="p-3.5 flex gap-3.5 items-start">
        {/* Image */}
        <div className="relative w-24 h-24 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1.5">
          <img
            src={displayImage}
            alt={pcCase.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
              {pcCase.name}
            </h4>

            {/* Rating */}
            {hasReviews ? (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">
                  {pcCase.averageRating?.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({totalReviewsCount})
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Cấu hình lắp sẵn tối ưu
              </span>
            )}

            {/* Price */}
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-base font-extrabold text-blue-600">
                {formatPrice(pcCase.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Specs Row */}
      <div className="px-3.5 pb-3 pt-1 border-t border-slate-100/80 bg-slate-50/50 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
        {cpu && (
          <div className="flex items-center gap-1 truncate" title={cpu.name}>
            <Cpu className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="truncate">{cpu.name}</span>
          </div>
        )}
        {gpu && (
          <div className="flex items-center gap-1 truncate" title={gpu.name}>
            <Layers className="w-3 h-3 text-purple-500 shrink-0" />
            <span className="truncate">{gpu.name}</span>
          </div>
        )}
        {ram && (
          <div className="flex items-center gap-1 truncate" title={ram.name}>
            <Layers className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{ram.name}</span>
          </div>
        )}
        {storage && (
          <div className="flex items-center gap-1 truncate" title={storage.name}>
            <HardDrive className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{storage.name}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8 font-semibold text-slate-700 border-slate-200 hover:bg-white hover:text-blue-600 gap-1"
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/pc-cases/${pcCase.id}`}>
            <ExternalLink className="w-3 h-3" />
            Xem cấu hình
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!inStock || isAdding}
          className="flex-1 text-xs h-8 font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-sm"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3 h-3" />
          {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
        </Button>
      </div>
    </div>
  )
}
