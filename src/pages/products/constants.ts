import {
  Cpu,
  CircuitBoard,
  Layers,
  Sparkles,
  HardDrive,
  Zap,
  Box,
  Wind,
  type LucideIcon,
} from "lucide-react"
import type { ProductCategory } from "@/types/product"

export interface CategoryMeta {
  label: string
  shortLabel: string
  value: ProductCategory
  icon: LucideIcon
  colorClass: string
  bgLightClass: string
  borderClass: string
  badgeClass: string
  description: string
}

export const CATEGORIES_META: Record<ProductCategory, CategoryMeta> = {
  CPU: {
    label: "Vi xử lý (CPU)",
    shortLabel: "CPU",
    value: "CPU",
    icon: Cpu,
    colorClass: "text-blue-600",
    bgLightClass: "bg-blue-50",
    borderClass: "border-blue-200",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Bộ vi xử lý Intel Core & AMD Ryzen thế hệ mới",
  },
  MAINBOARD: {
    label: "Bo mạch chủ (Mainboard)",
    shortLabel: "Mainboard",
    value: "MAINBOARD",
    icon: CircuitBoard,
    colorClass: "text-indigo-600",
    bgLightClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Bo mạch chủ chipset Z790, B760, X670, B650...",
  },
  RAM: {
    label: "Bộ nhớ trong (RAM)",
    shortLabel: "RAM",
    value: "RAM",
    icon: Layers,
    colorClass: "text-amber-600",
    bgLightClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Bộ nhớ RAM DDR4, DDR5 tốc độ cao với đèn RGB",
  },
  GPU: {
    label: "Card đồ họa (VGA / GPU)",
    shortLabel: "Card VGA",
    value: "GPU",
    icon: Sparkles,
    colorClass: "text-purple-600",
    bgLightClass: "bg-purple-50",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Card đồ họa NVIDIA RTX 40 series & AMD Radeon",
  },
  STORAGE: {
    label: "Ổ cứng (SSD / HDD)",
    shortLabel: "Ổ cứng",
    value: "STORAGE",
    icon: HardDrive,
    colorClass: "text-cyan-600",
    bgLightClass: "bg-cyan-50",
    borderClass: "border-cyan-200",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    description: "SSD NVMe M.2 PCIe Gen 4, Gen 5 tốc độ đọc siêu nhanh",
  },
  PSU: {
    label: "Nguồn máy tính (PSU)",
    shortLabel: "Nguồn PSU",
    value: "PSU",
    icon: Zap,
    colorClass: "text-emerald-600",
    bgLightClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Bộ nguồn 80 Plus Bronze/Gold/Platinum, chuẩn ATX 3.0",
  },
  CASE: {
    label: "Vỏ thùng máy (Case)",
    shortLabel: "Vỏ Case",
    value: "CASE",
    icon: Box,
    colorClass: "text-rose-600",
    bgLightClass: "bg-rose-50",
    borderClass: "border-rose-200",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Vỏ case Mid Tower, Dual-Chamber mặt kính cường lực",
  },
  CPU_COOLER: {
    label: "Tản nhiệt CPU (Cooler)",
    shortLabel: "Tản nhiệt",
    value: "CPU_COOLER",
    icon: Wind,
    colorClass: "text-sky-600",
    bgLightClass: "bg-sky-50",
    borderClass: "border-sky-200",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    description: "Tản nhiệt khí tháp đôi & tản nhiệt nước AIO 240/360mm",
  },
}

export const CATEGORY_OPTIONS: { label: string; value: ProductCategory | "ALL" }[] = [
  { label: "Tất cả danh mục", value: "ALL" },
  { label: "Vi xử lý (CPU)", value: "CPU" },
  { label: "Bo mạch chủ (Mainboard)", value: "MAINBOARD" },
  { label: "Bộ nhớ trong (RAM)", value: "RAM" },
  { label: "Card đồ họa (VGA)", value: "GPU" },
  { label: "Ổ cứng (SSD / HDD)", value: "STORAGE" },
  { label: "Nguồn máy tính (PSU)", value: "PSU" },
  { label: "Vỏ case máy tính", value: "CASE" },
  { label: "Tản nhiệt CPU", value: "CPU_COOLER" },
]

export interface PriceRangePreset {
  id: string
  label: string
  minPrice?: number
  maxPrice?: number
}

export const PRICE_RANGE_PRESETS: PriceRangePreset[] = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-2m", label: "Dưới 2 triệu", maxPrice: 2000000 },
  { id: "2m-5m", label: "Từ 2 - 5 triệu", minPrice: 2000000, maxPrice: 5000000 },
  { id: "5m-10m", label: "Từ 5 - 10 triệu", minPrice: 5000000, maxPrice: 10000000 },
  { id: "10m-20m", label: "Từ 10 - 20 triệu", minPrice: 10000000, maxPrice: 20000000 },
  { id: "over-20m", label: "Trên 20 triệu", minPrice: 20000000 },
]

export type SortOptionValue =
  | "NEWEST"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "NAME_ASC"
  | "NAME_DESC"
  | "STOCK_DESC"

export interface SortOption {
  value: SortOptionValue
  label: string
  sortBy: "createdAt" | "price" | "name" | "stockQuantity"
  sortDir: "asc" | "desc"
}

export const SORT_OPTIONS: SortOption[] = [
  {
    value: "NEWEST",
    label: "Mới nhất",
    sortBy: "createdAt",
    sortDir: "desc",
  },
  {
    value: "PRICE_ASC",
    label: "Giá: Thấp đến Cao",
    sortBy: "price",
    sortDir: "asc",
  },
  {
    value: "PRICE_DESC",
    label: "Giá: Cao đến Thấp",
    sortBy: "price",
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
  {
    value: "STOCK_DESC",
    label: "Tồn kho nhiều nhất",
    sortBy: "stockQuantity",
    sortDir: "desc",
  },
]

export const formatPrice = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) return "0 ₫"
  return `${price.toLocaleString("vi-VN")} ₫`
}

export interface FormattedDetail {
  primary: string
  secondary: string
  specsList: { label: string; value: string }[]
}

export const formatDetail = (
  category: ProductCategory,
  detail?: Record<string, any>
): FormattedDetail => {
  if (!detail) {
    return {
      primary: category,
      secondary: "",
      specsList: [],
    }
  }

  const specsList: { label: string; value: string }[] = []

  switch (category) {
    case "CPU": {
      const socket = detail.socket || "LGA1700"
      const cores = detail.cores ?? 8
      const threads = detail.threads ?? 16
      const baseClock = detail.baseClockGhz || detail.base_clock_ghz
      const boostClock = detail.boostClockGhz || detail.boost_clock_ghz
      const tdp = detail.tdpW || detail.tdp_w || 125
      const memoryType = detail.memoryType || detail.memory_type || "DDR4/DDR5"
      const iGpu = detail.integratedGpu ?? detail.integrated_gpu

      specsList.push(
        { label: "Socket", value: socket },
        { label: "Số nhân / luồng", value: `${cores} nhân / ${threads} luồng` },
        { label: "Xung nhịp Turbo", value: boostClock ? `${boostClock} GHz` : "N/A" },
        { label: "Xung nhịp cơ bản", value: baseClock ? `${baseClock} GHz` : "N/A" },
        { label: "Công suất TDP", value: `${tdp}W` },
        { label: "Hỗ trợ RAM", value: memoryType },
        { label: "GPU tích hợp", value: iGpu ? "Có" : "Không" }
      )

      return {
        primary: `Socket ${socket} • ${cores}C/${threads}T • ${boostClock ? `Turbo ${boostClock}GHz` : `TDP ${tdp}W`}`,
        secondary: `Hỗ trợ ${memoryType} • ${iGpu ? "Tích hợp iGPU" : "Không kèm iGPU"}`,
        specsList,
      }
    }

    case "GPU": {
      const vram = detail.vramGb || detail.vram_gb || 16
      const vramType = detail.vramType || detail.vram_type || "GDDR6X"
      const tdp = detail.tdpW || detail.tdp_w || 250
      const length = detail.lengthMm || detail.length_mm || 300
      const pcie = detail.pcieSlot || detail.pcie_slot || "x16"

      specsList.push(
        { label: "Dung lượng VRAM", value: `${vram} GB` },
        { label: "Loại bộ nhớ VRAM", value: vramType },
        { label: "Chiều dài Card", value: `${length} mm` },
        { label: "Công suất tiêu thụ", value: `${tdp}W` },
        { label: "Giao tiếp khe cắm", value: `PCIe ${pcie}` }
      )

      return {
        primary: `${vram}GB ${vramType} • Chiều dài ${length}mm`,
        secondary: `PCIe ${pcie} • Công suất TDP ${tdp}W`,
        specsList,
      }
    }

    case "MAINBOARD": {
      const socket = detail.socket || "LGA1700"
      const formFactor = detail.formFactor || detail.form_factor || "ATX"
      const chipset = detail.chipset || "B760"
      const memoryType = detail.memoryType || detail.memory_type || "DDR5"
      const slots = detail.memorySlots || detail.memory_slots || 4
      const maxMem = detail.maxMemoryGb || detail.max_memory_gb || 128
      const m2 = detail.m2Slots || detail.m2_slots || 3
      const pcie = detail.pcieVersion || detail.pcie_version || "5.0"

      specsList.push(
        { label: "Socket CPU", value: socket },
        { label: "Kích thước (Form Factor)", value: formFactor },
        { label: "Chipset", value: chipset },
        { label: "Loại RAM", value: `${memoryType} (${slots} khe, max ${maxMem}GB)` },
        { label: "Số khe M.2 SSD", value: `${m2} khe` },
        { label: "Phiên bản PCIe", value: `PCIe ${pcie}` }
      )

      return {
        primary: `Socket ${socket} • ${chipset} • Chuẩn ${formFactor}`,
        secondary: `${slots}x ${memoryType} (max ${maxMem}GB) • ${m2}x M.2 PCIe ${pcie}`,
        specsList,
      }
    }

    case "RAM": {
      const type = detail.type || "DDR5"
      const speed = detail.speedMhz || detail.speed_mhz || 6000
      const cap = detail.capacityGb || detail.capacity_gb || 16
      const sticks = detail.sticks || 2
      const total = detail.totalGb || detail.total_gb || cap * sticks

      specsList.push(
        { label: "Thế hệ RAM", value: type },
        { label: "Tốc độ Bus", value: `${speed} MHz` },
        { label: "Cấu hình thanh", value: `${sticks} thanh x ${cap}GB` },
        { label: "Tổng dung lượng", value: `${total} GB` }
      )

      return {
        primary: `${type} • Bus ${speed}MHz • Tổng ${total}GB`,
        secondary: `Bộ kit ${sticks} thanh x ${cap}GB`,
        specsList,
      }
    }

    case "STORAGE": {
      const type = detail.type || "NVMe SSD"
      const cap = detail.capacityGb || detail.capacity_gb || 1000
      const iface = detail.interface || "M.2 PCIe 4.0"
      const read = detail.readMbps || detail.read_mbps || 7000
      const write = detail.writeMbps || detail.write_mbps || 6000

      specsList.push(
        { label: "Loại ổ cứng", value: type },
        { label: "Dung lượng", value: cap >= 1000 ? `${cap / 1000} TB` : `${cap} GB` },
        { label: "Chuẩn giao tiếp", value: iface },
        { label: "Tốc độ đọc tuần tự", value: `${read} MB/s` },
        { label: "Tốc độ ghi tuần tự", value: `${write} MB/s` }
      )

      return {
        primary: `${type} ${cap >= 1000 ? `${cap / 1000}TB` : `${cap}GB`} • ${iface}`,
        secondary: `Đọc ${read} MB/s • Ghi ${write} MB/s`,
        specsList,
      }
    }

    case "PSU": {
      const watt = detail.wattageW || detail.wattage_w || 750
      const eff = detail.efficiency || "80+ Gold"
      const mod = detail.modular || "Full"
      const ff = detail.formFactor || detail.form_factor || "ATX"

      specsList.push(
        { label: "Công suất định mức", value: `${watt}W` },
        { label: "Chứng nhận hiệu suất", value: eff },
        { label: "Dây cáp module", value: `${mod} Modular` },
        { label: "Form Factor", value: ff }
      )

      return {
        primary: `Công suất ${watt}W • Chuẩn ${eff}`,
        secondary: `${mod} Modular • Kích thước ${ff}`,
        specsList,
      }
    }

    case "CASE": {
      const ffSupport = detail.formFactorSupport || detail.form_factor_support
      const ffText = Array.isArray(ffSupport) ? ffSupport.join(", ") : "ATX, mATX, ITX"
      const maxGpu = detail.maxGpuLengthMm || detail.max_gpu_length_mm || 380
      const maxCooler = detail.maxCoolerHeightMm || detail.max_cooler_height_mm || 165

      specsList.push(
        { label: "Hỗ trợ Mainboard", value: ffText },
        { label: "Chiều dài GPU tối đa", value: `${maxGpu} mm` },
        { label: "Chiều cao tản CPU tối đa", value: `${maxCooler} mm` }
      )

      return {
        primary: `Hỗ trợ ${ffText} • GPU max ${maxGpu}mm`,
        secondary: `Chiều cao tản CPU tối đa ${maxCooler}mm`,
        specsList,
      }
    }

    case "CPU_COOLER": {
      const type = detail.type || "Air"
      const height = detail.heightMm || detail.height_mm
      const rad = detail.radiatorSizeMm || detail.radiator_size_mm
      const tdp = detail.tdpSupportW || detail.tdp_support_w || 220
      const sockets = detail.socketSupport || detail.socket_support
      const socketText = Array.isArray(sockets) ? sockets.join(", ") : "LGA1700, AM5"

      specsList.push(
        { label: "Loại tản nhiệt", value: type === "Air" ? "Tản nhiệt khí" : `Tản nước AIO (${rad}mm)` },
        { label: "Chiều cao tản khí", value: height ? `${height} mm` : "N/A" },
        { label: "Hỗ trợ TDP", value: `${tdp}W` },
        { label: "Socket hỗ trợ", value: socketText }
      )

      return {
        primary: `${type === "Air" ? "Tản khí" : `AIO ${rad}mm`} • TDP max ${tdp}W`,
        secondary: height ? `Chiều cao ${height}mm • ${socketText}` : socketText,
        specsList,
      }
    }

    default:
      return {
        primary: category,
        secondary: "",
        specsList: [],
      }
  }
}
