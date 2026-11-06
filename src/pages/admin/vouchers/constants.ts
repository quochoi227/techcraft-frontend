import type { DiscountType, Voucher } from "@/types/voucher"

export const formatVND = (price?: number | null): string => {
  if (typeof price !== "number" || isNaN(price)) return "0 ₫"
  return `${price.toLocaleString("vi-VN")} ₫`
}

export const DISCOUNT_TYPES: Array<{
  value: DiscountType | "ALL"
  label: string
}> = [
  { value: "ALL", label: "Tất cả hình thức" },
  { value: "PERCENTAGE", label: "Giảm theo phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Giảm số tiền cố định (₫)" },
]

export const DISCOUNT_TYPE_META: Record<
  DiscountType,
  {
    label: string
    shortLabel: string
    badgeClass: string
  }
> = {
  PERCENTAGE: {
    label: "Giảm theo phần trăm (%)",
    shortLabel: "Phần trăm (%)",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  FIXED_AMOUNT: {
    label: "Giảm số tiền cố định (₫)",
    shortLabel: "Tiền mặt (₫)",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
}

export interface VoucherStatusInfo {
  label: string
  badgeClass: string
  dotClass: string
  isUsable: boolean
}

export const getVoucherStatusInfo = (voucher: Voucher): VoucherStatusInfo => {
  const now = new Date()
  const startDate = voucher.startDate ? new Date(voucher.startDate) : null
  const endDate = voucher.endDate ? new Date(voucher.endDate) : null

  if (!voucher.active) {
    return {
      label: "Đã tạm dừng",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
      isUsable: false,
    }
  }

  if (endDate && now > endDate) {
    return {
      label: "Đã hết hạn",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      isUsable: false,
    }
  }

  if (startDate && now < startDate) {
    return {
      label: "Chưa bắt đầu",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
      isUsable: false,
    }
  }

  if (
    voucher.usageLimit !== undefined &&
    voucher.usageLimit !== null &&
    voucher.usageLimit > 0 &&
    voucher.usedCount >= voucher.usageLimit
  ) {
    return {
      label: "Hết lượt sử dụng",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      dotClass: "bg-orange-500",
      isUsable: false,
    }
  }

  return {
    label: "Đang hoạt động",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    isUsable: true,
  }
}

export const formatDiscountValue = (voucher: Partial<Voucher>): string => {
  if (voucher.discountType === "PERCENTAGE") {
    const val = voucher.discountValue || 0
    if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0) {
      return `Giảm ${val}% (Tối đa ${formatVND(voucher.maxDiscountAmount)})`
    }
    return `Giảm ${val}%`
  }

  return `Giảm ${formatVND(voucher.discountValue || 0)}`
}
