import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Eye, ArrowRight, Sparkles, Cpu } from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import { pcCaseService } from "@/services/api/pcCaseService"
import { MOCK_PC_CASES } from "../mockData"
import {
  USE_CASES_META,
  formatPrice,
  calculatePcCaseStock,
  getComponentByCategory,
} from "../constants"
import { Button } from "@/components/ui/button"

interface RelatedPcCasesProps {
  currentPcCaseId: string
  useCase: string
}

const PREBUILT_PC_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const RelatedPcCases: React.FC<RelatedPcCasesProps> = ({
  currentPcCaseId,
  useCase,
}) => {
  const [relatedList, setRelatedList] = useState<PcCase[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const fetchRelated = async () => {
      setIsLoading(true)
      try {
        const response = await pcCaseService.getPcCases({
          useCase: useCase && useCase !== "ALL" ? useCase : undefined,
          size: 6,
        })
        const items = response?.data?.content || []
        const filtered = items.filter((p) => p.id !== currentPcCaseId).slice(0, 3)

        if (isMounted) {
          if (filtered.length > 0) {
            setRelatedList(filtered)
          } else {
            // Fallback to MOCK_PC_CASES
            const mockFiltered = MOCK_PC_CASES.filter(
              (p) => p.id !== currentPcCaseId && (p.useCase === useCase || true)
            ).slice(0, 3)
            setRelatedList(mockFiltered)
          }
        }
      } catch (err) {
        console.warn("Lỗi tải cấu hình tương tự từ API, dùng mock data:", err)
        const mockFiltered = MOCK_PC_CASES.filter(
          (p) => p.id !== currentPcCaseId
        ).slice(0, 3)
        if (isMounted) setRelatedList(mockFiltered)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchRelated()

    return () => {
      isMounted = false
    }
  }, [currentPcCaseId, useCase])

  if (isLoading || relatedList.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Cấu hình PC tương tự có thể bạn quan tâm
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các dàn máy được tối ưu cho cùng phân khúc nhu cầu và tầm giá
          </p>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 text-xs font-semibold"
        >
          <Link to={`/pc-cases?useCase=${useCase}`}>
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {relatedList.map((pc) => {
          const meta = USE_CASES_META[pc.useCase] || USE_CASES_META.gaming
          const MetaIcon = meta?.icon
          const cpu = getComponentByCategory(pc, "CPU")
          const gpu = getComponentByCategory(pc, "GPU")
          const caseProduct = getComponentByCategory(pc, "CASE")
          const stock = calculatePcCaseStock(pc)
          const inStock = stock > 0

          const imgUrl =
            caseProduct?.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
            caseProduct?.images?.[0]?.imageUrl ||
            PREBUILT_PC_IMAGE

          return (
            <Link
              key={pc.id}
              to={`/pc-cases/${pc.id}`}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 p-4"
            >
              {/* Image & Badge */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3 mb-3">
                <img
                  src={imgUrl}
                  alt={pc.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = PREBUILT_PC_IMAGE
                  }}
                />
                <span
                  className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-xs ${meta?.badgeClass}`}
                >
                  {MetaIcon && <MetaIcon className="w-3 h-3" />}
                  {meta?.shortLabel}
                </span>

                <span
                  className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-xs ${
                    inStock
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>

              {/* Title */}
              <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                {pc.name}
              </h4>

              {/* Key Specs */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 flex-1">
                {cpu && (
                  <div className="truncate font-medium text-slate-700 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{cpu.name}</span>
                  </div>
                )}
                {gpu && (
                  <div className="truncate text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                    <span className="truncate">{gpu.name}</span>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Trọn bộ</div>
                  <div className="text-sm sm:text-base font-extrabold text-purple-700">
                    {formatPrice(pc.totalPrice)}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs font-bold border-purple-200 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors"
                >
                  <Eye className="w-3 h-3 mr-1" /> Chi tiết
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
