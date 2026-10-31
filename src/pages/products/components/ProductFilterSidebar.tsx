import React, { useState } from "react"
import {
  Filter,
  RotateCcw,
  Check,
  DollarSign,
  PackageCheck,
  ChevronDown,
  Layers,
} from "lucide-react"
import type { ProductCategory } from "@/types/product"
import {
  CATEGORIES_META,
  PRICE_RANGE_PRESETS,
  type PriceRangePreset,
} from "../constants"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductFilterSidebarProps {
  selectedCategory: ProductCategory | "ALL"
  onSelectCategory: (category: ProductCategory | "ALL") => void
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

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
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
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true)
  const [isPriceExpanded, setIsPriceExpanded] = useState(true)
  const [isStockExpanded, setIsStockExpanded] = useState(true)

  const categoriesList: (ProductCategory | "ALL")[] = [
    "ALL",
    "CPU",
    "MAINBOARD",
    "RAM",
    "GPU",
    "STORAGE",
    "PSU",
    "CASE",
    "CPU_COOLER",
  ]

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
      {/* Header of Filter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
          title="Thiết lập lại bộ lọc"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* 1. Category Filter Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            Danh mục linh kiện
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isCategoryExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isCategoryExpanded && (
          <div className="space-y-1 pt-1">
            {categoriesList.map((catKey) => {
              const isAll = catKey === "ALL"
              const isSelected = selectedCategory === catKey
              const meta = !isAll ? CATEGORIES_META[catKey as ProductCategory] : null
              const Icon = meta?.icon

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    onSelectCategory(catKey)
                    if (isMobileDrawer && onCloseMobileDrawer) {
                      onCloseMobileDrawer()
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
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
                      <Layers className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-500"}`} />
                    )}
                    <span>{isAll ? "Tất cả linh kiện" : meta?.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Price Range Filter Section */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Khoảng giá (VNĐ)
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isPriceExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isPriceExpanded && (
          <div className="space-y-3 pt-1">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              {PRICE_RANGE_PRESETS.map((preset) => {
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
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-300"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Custom Min / Max Price Inputs */}
            <form onSubmit={handleCustomPriceSubmit} className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">
                Tự nhập khoảng giá (VNĐ):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder="Tối thiểu"
                    value={minPriceInput}
                    onChange={(e) => onChangeMinPrice(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Tối đa"
                    value={maxPriceInput}
                    onChange={(e) => onChangeMaxPrice(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Áp dụng khoảng giá
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Availability Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsStockExpanded(!isStockExpanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-blue-500" />
            Tình trạng hàng
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
              <span>Chỉ hiển thị sản phẩm còn hàng</span>
            </label>
          </div>
        )}
      </div>

      {/* Mobile Drawer Close Button */}
      {isMobileDrawer && (
        <div className="pt-6">
          <Button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onCloseMobileDrawer}
          >
            Xem kết quả {totalCount !== undefined ? `(${totalCount} sản phẩm)` : ""}
          </Button>
        </div>
      )}
    </aside>
  )
}
