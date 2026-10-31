import {
  Gamepad2,
  Palette,
  Briefcase,
  Brain,
  type LucideIcon,
} from "lucide-react"
import type { PcCase } from "@/types/pcCase"
import type { ProductCategory } from "@/types/product"

export interface UseCaseMeta {
  value: string
  label: string
  shortLabel: string
  icon: LucideIcon
  colorClass: string
  bgLightClass: string
  borderClass: string
  badgeClass: string
  description: string
}

export const USE_CASES_META: Record<string, UseCaseMeta> = {
  gaming: {
    value: "gaming",
    label: "Gaming & Esports",
    shortLabel: "Gaming",
    icon: Gamepad2,
    colorClass: "text-purple-600",
    bgLightClass: "bg-purple-50",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Cấu hình tối ưu FPS cao, đồ họa sắc nét cho game thủ chuyên nghiệp",
  },
  rendering: {
    value: "rendering",
    label: "Đồ họa & Render 3D",
    shortLabel: "Đồ họa 3D",
    icon: Palette,
    colorClass: "text-amber-600",
    bgLightClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Dành riêng cho dựng phim 4K, Render Blender, AutoCAD, Premiere",
  },
  office: {
    value: "office",
    label: "Học tập & Văn phòng",
    shortLabel: "Văn phòng",
    icon: Briefcase,
    colorClass: "text-teal-600",
    bgLightClass: "bg-teal-50",
    borderClass: "border-teal-200",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    description: "Vận hành êm ái, tiết kiệm điện năng cho công việc và học tập hằng ngày",
  },
  ai: {
    value: "ai",
    label: "AI & Deep Learning",
    shortLabel: "Trí tuệ nhân tạo (AI)",
    icon: Brain,
    colorClass: "text-blue-600",
    bgLightClass: "bg-blue-50",
    borderClass: "border-blue-200",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Huấn luyện mô hình LLM, Machine Learning và xử lý dữ liệu lớn",
  },
}

export const USE_CASE_OPTIONS: { label: string; value: string }[] = [
  { label: "Tất cả nhu cầu", value: "ALL" },
  { label: "Gaming & Esports", value: "gaming" },
  { label: "Đồ họa & Render 3D", value: "rendering" },
  { label: "Học tập & Văn phòng", value: "office" },
  { label: "AI & Deep Learning", value: "ai" },
]

export interface PriceRangePreset {
  id: string
  label: string
  minPrice?: number
  maxPrice?: number
}

export const PC_PRICE_RANGE_PRESETS: PriceRangePreset[] = [
  { id: "all", label: "Tất cả mức ngân sách" },
  { id: "under-15m", label: "Dưới 15 triệu", maxPrice: 15000000 },
  { id: "15m-30m", label: "Từ 15 - 30 triệu", minPrice: 15000000, maxPrice: 30000000 },
  { id: "30m-50m", label: "Từ 30 - 50 triệu", minPrice: 30000000, maxPrice: 50000000 },
  { id: "over-50m", label: "Trên 50 triệu (Cao cấp)", minPrice: 50000000 },
]

export type PcSortOptionValue =
  | "NEWEST"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "NAME_ASC"
  | "NAME_DESC"

export interface PcSortOption {
  value: PcSortOptionValue
  label: string
  sortBy: "createdAt" | "totalPrice" | "name"
  sortDir: "asc" | "desc"
}

export const PC_SORT_OPTIONS: PcSortOption[] = [
  {
    value: "NEWEST",
    label: "Mới nhất",
    sortBy: "createdAt",
    sortDir: "desc",
  },
  {
    value: "PRICE_ASC",
    label: "Giá: Thấp đến Cao",
    sortBy: "totalPrice",
    sortDir: "asc",
  },
  {
    value: "PRICE_DESC",
    label: "Giá: Cao đến Thấp",
    sortBy: "totalPrice",
    sortDir: "desc",
  },
  {
    value: "NAME_ASC",
    label: "Tên: A → Z",
    sortBy: "name",
    sortDir: "asc",
  },
  {
    value: "NAME_DESC",
    label: "Tên: Z → A",
    sortBy: "name",
    sortDir: "desc",
  },
]

export const formatPrice = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) return "0 ₫"
  return `${price.toLocaleString("vi-VN")} ₫`
}

/**
 * Tính số lượng máy tính tối đa có thể lắp ráp từ tồn kho các linh kiện
 */
export const calculatePcCaseStock = (pcCase: PcCase): number => {
  if (!pcCase.items || pcCase.items.length === 0) return 0
  const stocks = pcCase.items
    .map((item) => item.product?.stockQuantity)
    .filter((s): s is number => typeof s === "number")

  if (stocks.length === 0) return 10
  return Math.min(...stocks)
}

/**
 * Lấy linh kiện cụ thể theo Category từ danh sách linh kiện trong PC Case
 */
export const getComponentByCategory = (
  pcCase: PcCase,
  category: ProductCategory
) => {
  return pcCase.items?.find((i) => i.category === category)?.product
}
