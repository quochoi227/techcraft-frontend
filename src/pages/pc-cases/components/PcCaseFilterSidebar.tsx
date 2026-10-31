import React, { useState } from "react"
import {
  Filter,
  RotateCcw,
  Check,
  DollarSign,
  PackageCheck,
  ChevronDown,
  Gamepad2,
  Sparkles,
} from "lucide-react"
import {
  USE_CASES_META,
  PC_PRICE_RANGE_PRESETS,
  type PriceRangePreset,
} from "../constants"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface PcCaseFilterSidebarProps {
  selectedUseCase: string // "ALL" | "gaming" | "rendering" | "office" | "ai"
  onSelectUseCase: (useCase: string) => void
  selectedPricePresetId: string
  onSelectPricePreset: (preset: PriceRangePreset) => void
  minPriceInput: string
  maxPriceInput: string
  onChangeMinPrice: (val: string) => void
  onChangeMaxPrice: (val: string) => void
  onApplyCustomPrice: () => void
  onlyInStock: boolean
  onToggleInStock: (val: boolean) => void
  onResetFilters: () => void
  totalCount?: number
  isMobileDrawer?: boolean
  onCloseMobileDrawer?: () => void
}

export const PcCaseFilterSidebar: React.FC<PcCaseFilterSidebarProps> = ({
  selectedUseCase,
  onSelectUseCase,
  selectedPricePresetId,
  onSelectPricePreset,
  minPriceInput,
  maxPriceInput,
  onChangeMinPrice,
  onChangeMaxPrice,
  onApplyCustomPrice,
  onlyInStock,
  onToggleInStock,
  onResetFilters,
  totalCount,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const [isUseCaseExpanded, setIsUseCaseExpanded] = useState(true)
  const [isPriceExpanded, setIsPriceExpanded] = useState(true)
  const [isStockExpanded, setIsStockExpanded] = useState(true)

  const useCasesList = ["ALL", "gaming", "rendering", "office", "ai"]

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApplyCustomPrice()
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer()
    }
  }

  return (
    <aside
      className={`space-y-6 ${
        isMobileDrawer ? "p-4" : "p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Lọc cấu hình PC</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-purple-600 flex items-center gap-1 font-semibold transition-colors"
          title="Thiết lập lại bộ lọc"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* 1. Nhu cầu sử dụng (Use Case) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsUseCaseExpanded(!isUseCaseExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-purple-500" />
            Nhu cầu sử dụng
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isUseCaseExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isUseCaseExpanded && (
          <div className="space-y-1 pt-1">
            {useCasesList.map((ucKey) => {
              const isAll = ucKey === "ALL"
              const isSelected = selectedUseCase === ucKey
              const meta = !isAll ? USE_CASES_META[ucKey] : null
              const Icon = meta?.icon

              return (
                <button
                  key={ucKey}
                  type="button"
                  onClick={() => {
                    onSelectUseCase(ucKey)
                    if (isMobileDrawer && onCloseMobileDrawer) {
                      onCloseMobileDrawer()
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon ? (
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-white" : meta?.colorClass || "text-slate-400"
                        }`}
                      />
                    ) : (
                      <Sparkles className={`w-4 h-4 ${isSelected ? "text-white" : "text-purple-500"}`} />
                    )}
                    <span>{isAll ? "Tất cả nhu cầu" : meta?.label}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Mức ngân sách (Price Range) */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Mức ngân sách (VNĐ)
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isPriceExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isPriceExpanded && (
          <div className="space-y-3 pt-1">
            {/* Presets */}
            <div className="space-y-1.5">
              {PC_PRICE_RANGE_PRESETS.map((preset) => {
                const isSelected = selectedPricePresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectPricePreset(preset)
                      if (isMobileDrawer && onCloseMobileDrawer) {
                        onCloseMobileDrawer()
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-purple-50 text-purple-900 font-bold border border-purple-300"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Custom Inputs */}
            <form onSubmit={handleCustomPriceSubmit} className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">
                Tự nhập mức giá (VNĐ):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={minPriceInput}
                  onChange={(e) => onChangeMinPrice(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={maxPriceInput}
                  onChange={(e) => onChangeMaxPrice(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs font-semibold text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                Áp dụng ngân sách
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Tình trạng linh kiện */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsStockExpanded(!isStockExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-500" />
            Tình trạng lắp ráp
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isStockExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isStockExpanded && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 select-none">
              <Checkbox
                checked={onlyInStock}
                onCheckedChange={(checked) => onToggleInStock(Boolean(checked))}
              />
              <span>Chỉ hiển thị cấu hình đủ linh kiện</span>
            </label>
          </div>
        )}
      </div>

      {/* Mobile Drawer Close Button */}
      {isMobileDrawer && (
        <div className="pt-6">
          <Button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={onCloseMobileDrawer}
          >
            Xem kết quả {totalCount !== undefined ? `(${totalCount} cấu hình)` : ""}
          </Button>
        </div>
      )}
    </aside>
  )
}
