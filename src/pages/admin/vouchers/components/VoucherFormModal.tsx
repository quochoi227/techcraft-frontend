import React, { useState, useEffect } from "react"
import {
  X,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Loader2,
  Check,
} from "lucide-react"
import type {
  Voucher,
  DiscountType,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "@/types/voucher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface VoucherFormModalProps {
  isOpen: boolean
  voucherToEdit: Voucher | null
  onClose: () => void
  onSubmit: (payload: CreateVoucherPayload | UpdateVoucherPayload, id?: string) => Promise<void>
  isSubmitting?: boolean
}

// Chuyển ISO sang định dạng YYYY-MM-DDTHH:mm cho input type="datetime-local"
const toDateTimeLocal = (isoString?: string) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

// Chuyển datetime-local string sang ISO string
const toIsoString = (localString: string) => {
  if (!localString) return ""
  return new Date(localString).toISOString()
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  isOpen,
  voucherToEdit,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditMode = Boolean(voucherToEdit)

  // Form Fields
  const [code, setCode] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState<number | "">(10)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("")
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">(0)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [usageLimit, setUsageLimit] = useState<number | "">("")
  const [userUsageLimit, setUserUsageLimit] = useState<number | "">(1)
  const [isActive, setIsActive] = useState<boolean>(true)

  // Populate form on open or mode change
  useEffect(() => {
    if (!isOpen) return

    if (voucherToEdit) {
      setCode(voucherToEdit.code || "")
      setName(voucherToEdit.name || "")
      setDescription(voucherToEdit.description || "")
      setDiscountType(voucherToEdit.discountType || "PERCENTAGE")
      setDiscountValue(voucherToEdit.discountValue || 0)
      setMaxDiscountAmount(
        voucherToEdit.maxDiscountAmount !== undefined && voucherToEdit.maxDiscountAmount !== null
          ? voucherToEdit.maxDiscountAmount
          : ""
      )
      setMinOrderAmount(
        voucherToEdit.minOrderAmount !== undefined && voucherToEdit.minOrderAmount !== null
          ? voucherToEdit.minOrderAmount
          : 0
      )
      setStartDate(toDateTimeLocal(voucherToEdit.startDate))
      setEndDate(toDateTimeLocal(voucherToEdit.endDate))
      setUsageLimit(
        voucherToEdit.usageLimit !== undefined && voucherToEdit.usageLimit !== null
          ? voucherToEdit.usageLimit
          : ""
      )
      setUserUsageLimit(
        voucherToEdit.userUsageLimit !== undefined && voucherToEdit.userUsageLimit !== null
          ? voucherToEdit.userUsageLimit
          : 1
      )
      setIsActive(voucherToEdit.active !== false)
    } else {
      // Default new voucher (bắt đầu từ hôm nay, kết thúc sau 30 ngày)
      const now = new Date()
      const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

      setCode("")
      setName("")
      setDescription("")
      setDiscountType("PERCENTAGE")
      setDiscountValue(10)
      setMaxDiscountAmount(100000)
      setMinOrderAmount(500000)
      setStartDate(toDateTimeLocal(now.toISOString()))
      setEndDate(toDateTimeLocal(end.toISOString()))
      setUsageLimit(100)
      setUserUsageLimit(1)
      setIsActive(true)
    }
  }, [isOpen, voucherToEdit])

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validation
    if (!isEditMode) {
      const cleanCode = code.trim().toUpperCase()
      if (!cleanCode) {
        toast.error("Vui lòng nhập mã giảm giá!")
        return
      }
      if (!/^[A-Za-z0-9_-]{2,50}$/.test(cleanCode)) {
        toast.error("Mã giảm giá từ 2-50 ký tự, chỉ gồm chữ cái, số, gạch nối hoặc gạch dưới!")
        return
      }
    }

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên chương trình giảm giá!")
      return
    }

    if (discountValue === "" || Number(discountValue) <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0!")
      return
    }

    if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
      toast.error("Mức giảm theo phần trăm không được vượt quá 100%!")
      return
    }

    if (!startDate) {
      toast.error("Vui lòng chọn thời gian bắt đầu hiệu lực!")
      return
    }

    if (!endDate) {
      toast.error("Vui lòng chọn thời gian kết thúc hiệu lực!")
      return
    }

    const startMs = new Date(startDate).getTime()
    const endMs = new Date(endDate).getTime()
    if (endMs <= startMs) {
      toast.error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!")
      return
    }

    // 2. Prepare payload
    const payload: any = {
      name: name.trim(),
      description: description.trim() || undefined,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount:
        discountType === "PERCENTAGE" && maxDiscountAmount !== ""
          ? Number(maxDiscountAmount)
          : undefined,
      minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : 0,
      startDate: toIsoString(startDate),
      endDate: toIsoString(endDate),
      usageLimit: usageLimit !== "" ? Number(usageLimit) : undefined,
      userUsageLimit: userUsageLimit !== "" ? Number(userUsageLimit) : 1,
      isActive,
    }

    if (!isEditMode) {
      payload.code = code.trim().toUpperCase()
    }

    await onSubmit(payload, voucherToEdit?.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditMode ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? `Mã: ${voucherToEdit?.code} (Mã không thể thay đổi sau khi tạo)`
                  : "Thiết lập chương trình chiết khấu và khuyến mãi cho khách hàng"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-200/80 shadow-2xs"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Row 1: Code & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="vcode" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Mã Voucher <span className="text-rose-500">*</span></span>
                </Label>
                <Input
                  id="vcode"
                  type="text"
                  placeholder="VD: TECH50K"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isEditMode || isSubmitting}
                  className={`h-11 rounded-xl uppercase font-mono font-bold tracking-wider ${
                    isEditMode ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                  }`}
                  required={!isEditMode}
                />
              </div>

              <div className="sm:col-span-8 space-y-1.5">
                <Label htmlFor="vname" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Tên chương trình khuyến mãi <span className="text-rose-500">*</span></span>
                </Label>
                <Input
                  id="vname"
                  type="text"
                  placeholder="VD: Tri ân khách hàng thân thiết TechCraft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="vdesc" className="text-xs font-bold text-slate-700">
                Mô tả điều kiện & chi tiết khuyến mãi
              </Label>
              <textarea
                id="vdesc"
                rows={2}
                placeholder="VD: Giảm ngay 50k cho đơn từ 500k khi mua linh kiện CPU/RAM/VGA..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200/90 p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Row 2: Discount Type & Discount Value */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mức độ chiết khấu
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Loại giảm giá</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType("PERCENTAGE")}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold border transition-all ${
                        discountType === "PERCENTAGE"
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Phần trăm (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscountType("FIXED_AMOUNT")}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold border transition-all ${
                        discountType === "FIXED_AMOUNT"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Tiền mặt (₫)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dval" className="text-xs font-bold text-slate-700">
                    {discountType === "PERCENTAGE" ? "Tỷ lệ giảm (%)" : "Số tiền giảm (₫)"}{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="dval"
                    type="number"
                    min={discountType === "PERCENTAGE" ? 1 : 1000}
                    max={discountType === "PERCENTAGE" ? 100 : undefined}
                    step={discountType === "PERCENTAGE" ? 1 : 1000}
                    placeholder={discountType === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    disabled={isSubmitting}
                    className="h-11 rounded-xl font-bold text-sm bg-white"
                    required
                  />
                </div>

                {discountType === "PERCENTAGE" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="maxdisc" className="text-xs font-bold text-slate-700">
                      Mức giảm tối đa (₫) (Tùy chọn)
                    </Label>
                    <Input
                      id="maxdisc"
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="VD: 200000 (Để trống nếu không giới hạn)"
                      value={maxDiscountAmount}
                      onChange={(e) =>
                        setMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={isSubmitting}
                      className="h-11 rounded-xl text-xs bg-white"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="minorder" className="text-xs font-bold text-slate-700">
                    Giá trị đơn hàng tối thiểu (₫)
                  </Label>
                  <Input
                    id="minorder"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="VD: 500000 (0 nếu không yêu cầu)"
                    value={minOrderAmount}
                    onChange={(e) =>
                      setMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    disabled={isSubmitting}
                    className="h-11 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Validity Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sdate" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian bắt đầu <span className="text-rose-500">*</span></span>
                </Label>
                <Input
                  id="sdate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edate" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian kết thúc <span className="text-rose-500">*</span></span>
                </Label>
                <Input
                  id="edate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            {/* Row 4: Usage Limits & Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="usgLimit" className="text-xs font-bold text-slate-700">
                  Tổng lượt dùng tối đa
                </Label>
                <Input
                  id="usgLimit"
                  type="number"
                  min={1}
                  placeholder="VD: 100 (Trống = vô hạn)"
                  value={usageLimit}
                  onChange={(e) =>
                    setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usrLimit" className="text-xs font-bold text-slate-700">
                  Lượt dùng / Mỗi khách hàng
                </Label>
                <Input
                  id="usrLimit"
                  type="number"
                  min={1}
                  placeholder="VD: 1"
                  value={userUsageLimit}
                  onChange={(e) =>
                    setUserUsageLimit(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <Label className="text-xs font-bold text-slate-700 mb-2">Trạng thái kích hoạt</Label>
                <label className="flex items-center gap-2 cursor-pointer h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {isActive ? "Đang kích hoạt" : "Tạm dừng"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-semibold h-11 px-5"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-11 px-6 shadow-sm gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEditMode ? "Cập nhật voucher" : "Tạo mã giảm giá"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
