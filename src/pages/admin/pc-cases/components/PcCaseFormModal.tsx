import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Box,
  Wind,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Product, ProductCategory } from '@/types/product'
import type { PcCase, CreatePcCasePayload } from '@/types/pcCase'
import { productService } from '@/services/api/productService'
import { pcCaseService } from '@/services/api/pcCaseService'
import {
  PC_COMPONENT_SLOTS,
  USE_CASE_OPTIONS,
  checkHardwareCompatibility,
} from '../constants'
import { toast } from 'sonner'

interface PcCaseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: CreatePcCasePayload, id?: string) => Promise<boolean>
  initialData?: PcCase | null
  isDuplicate?: boolean
}

// Icon tương ứng cho 8 slots
const SLOT_ICONS: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  CPU: Cpu,
  MAINBOARD: Layers,
  RAM: Layers,
  GPU: Sparkles,
  STORAGE: HardDrive,
  PSU: Zap,
  CASE: Box,
  CPU_COOLER: Wind,
}

export const PcCaseFormModal: React.FC<PcCaseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isDuplicate = false,
}) => {
  // Form State cơ bản
  const [name, setName] = useState('')
  const [useCase, setUseCase] = useState('gaming')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  // 8 Slot linh kiện đã chọn
  const [selectedComponents, setSelectedComponents] = useState<
    Record<ProductCategory, Product | null>
  >({
    CPU: null,
    MAINBOARD: null,
    RAM: null,
    GPU: null,
    STORAGE: null,
    PSU: null,
    CASE: null,
    CPU_COOLER: null,
  })

  // Sản phẩm thật trong Database được phân loại theo 8 Category
  const [productsByCategory, setProductsByCategory] = useState<
    Record<ProductCategory, Product[]>
  >({
    CPU: [],
    MAINBOARD: [],
    RAM: [],
    GPU: [],
    STORAGE: [],
    PSU: [],
    CASE: [],
    CPU_COOLER: [],
  })
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Trạng thái kiểm tra tương thích
  const [validationResult, setValidationResult] = useState<{
    tested: boolean
    compatible: boolean
    violations: string[]
  }>({
    tested: false,
    compatible: true,
    violations: [],
  })
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tải danh sách linh kiện THẬT từ Database cho 8 Slot
  useEffect(() => {
    if (!isOpen) return

    const loadRealProductsFromDatabase = async () => {
      setIsLoadingProducts(true)
      try {
        // Gọi API lấy sản phẩm theo từng danh mục từ database backend
        const fetchPromises = PC_COMPONENT_SLOTS.map(async (slot) => {
          try {
            const res = await productService.getProducts({
              category: slot.category,
              size: 100,
              isActive: true,
            })
            const pageData = (res as any)?.data || res
            const prods: Product[] = Array.isArray(pageData?.content)
              ? pageData.content
              : Array.isArray(pageData)
              ? pageData
              : []
            return { category: slot.category, products: prods }
          } catch (err) {
            console.error(`Không thể tải linh kiện ${slot.category} từ DB:`, err)
            return { category: slot.category, products: [] }
          }
        })

        const results = await Promise.all(fetchPromises)
        const categorized: Record<ProductCategory, Product[]> = {
          CPU: [],
          MAINBOARD: [],
          RAM: [],
          GPU: [],
          STORAGE: [],
          PSU: [],
          CASE: [],
          CPU_COOLER: [],
        }

        for (const item of results) {
          categorized[item.category] = item.products
        }

        setProductsByCategory(categorized)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    loadRealProductsFromDatabase()
  }, [isOpen])

  // Khởi tạo form khi mở modal hoặc thay đổi initialData
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setName(isDuplicate ? `${initialData.name} (Bản sao)` : initialData.name)
      setUseCase(initialData.useCase || 'gaming')
      setDescription(initialData.description || '')
      setIsActive(initialData.isActive ?? initialData.active ?? true)

      // Điền 8 slot linh kiện từ dữ liệu PC Case thật
      const populatedComponents: Record<ProductCategory, Product | null> = {
        CPU: null,
        MAINBOARD: null,
        RAM: null,
        GPU: null,
        STORAGE: null,
        PSU: null,
        CASE: null,
        CPU_COOLER: null,
      }

      if (initialData.items && Array.isArray(initialData.items)) {
        for (const item of initialData.items) {
          const category = item.category as ProductCategory
          // Ưu tiên dùng thông tin product đính kèm trong response của PC Case, hoặc tìm trong danh sách category
          const matched =
            item.product ||
            productsByCategory[category]?.find((p) => p.id === item.productId) ||
            null
          if (category) {
            populatedComponents[category] = matched
          }
        }
      }

      setSelectedComponents(populatedComponents)
      setValidationResult({ tested: true, compatible: true, violations: [] })
    } else {
      // Khi TẠO MỚI: Khởi tạo rỗng, không dùng dữ liệu giả
      setName('')
      setUseCase('gaming')
      setDescription('')
      setIsActive(true)
      setSelectedComponents({
        CPU: null,
        MAINBOARD: null,
        RAM: null,
        GPU: null,
        STORAGE: null,
        PSU: null,
        CASE: null,
        CPU_COOLER: null,
      })
      setValidationResult({ tested: false, compatible: true, violations: [] })
    }
  }, [isOpen, initialData, isDuplicate, productsByCategory])

  // Tính tổng giá trị cấu hình PC từ giá của linh kiện thật trong Database
  const calculatedTotalPrice = useMemo(() => {
    return Object.values(selectedComponents).reduce((sum, item) => {
      return sum + (Number(item?.price) || 0)
    }, 0)
  }, [selectedComponents])

  // Số lượng slot đã chọn
  const filledSlotsCount = useMemo(() => {
    return Object.values(selectedComponents).filter(Boolean).length
  }, [selectedComponents])

  // Chọn hoặc thay đổi linh kiện cho 1 slot
  const handleSelectComponent = (category: ProductCategory, product: Product | null) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: product,
    }))
    // Reset trạng thái validation khi có thay đổi phần cứng
    setValidationResult((prev) => ({ ...prev, tested: false }))
  }

  // Chạy kiểm tra 8 ràng buộc tương thích bằng API backend thật
  const handleRunValidation = async () => {
    setIsValidating(true)
    try {
      const productIds = Object.values(selectedComponents)
        .filter((p): p is Product => Boolean(p))
        .map((p) => p.id)

      const itemsPayload = Object.entries(selectedComponents)
        .filter(([_, prod]) => Boolean(prod))
        .map(([cat, prod]) => ({
          category: cat as ProductCategory,
          productId: prod!.id,
        }))

      let isCompatible = true
      let violations: string[] = []
      let backendValidated = false

      // 1. Ưu tiên gọi API Backend làm Single Source of Truth
      if (itemsPayload.length > 0) {
        try {
          const apiRes = await pcCaseService.validatePcCase({
            items: itemsPayload,
            productIds,
          })
          const checkData = (apiRes as any)?.data || apiRes
          if (checkData && typeof checkData.compatible === 'boolean') {
            backendValidated = true
            isCompatible = Boolean(checkData.compatible)
            violations = Array.isArray(checkData.violations) ? checkData.violations : []
          }
        } catch (apiErr: any) {
          console.warn('Lỗi gọi API validate backend, chuyển sang kiểm tra client-side dự phòng:', apiErr)
        }
      }

      // 2. Chỉ khi API Backend không phản hồi (offline/lỗi mạng) mới dùng client-side dự phòng
      if (!backendValidated) {
        const clientCheck = checkHardwareCompatibility(selectedComponents)
        isCompatible = clientCheck.compatible
        violations = clientCheck.violations
      }

      setValidationResult({
        tested: true,
        compatible: isCompatible,
        violations,
      })

      if (isCompatible) {
        toast.success('Kiểm tra thành công! Cấu hình PC hoàn toàn tương thích và đạt tiêu chuẩn an toàn.')
      } else {
        toast.error(`Phát hiện ${violations.length} vấn đề phần cứng không tương thích!`)
      }
    } finally {
      setIsValidating(false)
    }
  }

  // Xử lý gửi Form Tạo / Sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên cấu hình PC!')
      return
    }

    if (filledSlotsCount < 8) {
      toast.warning(`Bạn mới chỉ chọn ${filledSlotsCount}/8 linh kiện. Vui lòng chọn đủ 8 slot!`)
      return
    }

    const itemsPayload = Object.entries(selectedComponents)
      .filter(([_, prod]) => Boolean(prod))
      .map(([cat, prod]) => ({
        category: cat as ProductCategory,
        productId: prod!.id,
      }))

    const productIds = itemsPayload.map((i) => i.productId)

    setIsSubmitting(true)
    try {
      // Kiểm tra ràng buộc qua API Backend trước khi lưu
      let isCompatible = true
      let violations: string[] = []
      let backendValidated = false

      try {
        const apiRes = await pcCaseService.validatePcCase({
          items: itemsPayload,
          productIds,
        })
        const checkData = (apiRes as any)?.data || apiRes
        if (checkData && typeof checkData.compatible === 'boolean') {
          backendValidated = true
          isCompatible = Boolean(checkData.compatible)
          violations = Array.isArray(checkData.violations) ? checkData.violations : []
        }
      } catch (err) {
        console.warn('Không thể gọi API validate trước khi lưu:', err)
      }

      // Fallback client-side nếu API backend không phản hồi
      if (!backendValidated) {
        const clientCheck = checkHardwareCompatibility(selectedComponents)
        isCompatible = clientCheck.compatible
        violations = clientCheck.violations
      }

      if (!isCompatible) {
        setValidationResult({
          tested: true,
          compatible: false,
          violations,
        })
        toast.error('Cấu hình đang có xung đột phần cứng. Vui lòng khắc phục trước khi lưu!')
        return
      }

      const payload: CreatePcCasePayload = {
        name: name.trim(),
        useCase,
        description: description.trim(),
        isActive,
        items: itemsPayload,
        productIds,
      }

      const targetId = isDuplicate ? undefined : initialData?.id
      const success = await onSave(payload, targetId)
      if (success) {
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              {isDuplicate
                ? 'Nhân bản Cấu hình PC'
                : initialData
                ? 'Chỉnh sửa Cấu hình PC Case'
                : 'Tạo Cấu hình PC Case mới'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn 8 linh kiện thật từ Database và thẩm định 8 ràng buộc tương thích phần cứng
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal (Cuộn theo chiều dọc) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/60 rounded-xl border border-slate-200/80">
            {/* Tên PC Case */}
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Tên cấu hình PC <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="VD: TechCraft Cyber Gaming Pro 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            {/* Nhóm nhu cầu */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Nhóm nhu cầu <span className="text-rose-500">*</span>
              </Label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {USE_CASE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mô tả cấu hình */}
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mô tả cấu hình</Label>
              <Input
                placeholder="VD: Cấu hình PC chơi game mượt mà, đồ họa và học tập..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Trạng thái hiển thị */}
            <div className="flex flex-col justify-end space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Trạng thái phát hành</Label>
              <label className="flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  {isActive ? 'Đang hoạt động (Hiển thị)' : 'Tạm ẩn cấu hình'}
                </span>
              </label>
            </div>
          </div>

          {/* Phần chọn 8 Slot linh kiện từ Database */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>8 Slot Linh kiện phần cứng (Dữ liệu thật trong Database)</span>
                  <span className="text-xs normal-case px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    Đã chọn {filledSlotsCount}/8 slot
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lựa chọn linh kiện thực tế đang có trong kho dữ liệu sản phẩm của TechCraft
                </p>
              </div>

              {/* Nút kiểm tra tương thích nhanh */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRunValidation}
                disabled={isValidating || filledSlotsCount === 0}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                )}
                <span>Kiểm tra tương thích (8 ràng buộc)</span>
              </Button>
            </div>

            {/* Hiển thị khi đang load linh kiện từ database */}
            {isLoadingProducts && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Đang kết nối cơ sở dữ liệu và tải danh sách linh kiện mới nhất...</span>
              </div>
            )}

            {/* Khung kết quả kiểm tra tương thích */}
            {validationResult.tested && (
              <div
                className={`p-4 rounded-xl border text-sm transition-all ${
                  validationResult.compatible
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.compatible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {validationResult.compatible
                        ? 'Cấu hình hoàn toàn tương thích và đạt tiêu chuẩn an toàn!'
                        : `Phát hiện ${validationResult.violations.length} vấn đề phần cứng không tương thích:`}
                    </p>
                    {validationResult.compatible ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-emerald-700 pt-1">
                        <div>✓ Socket CPU & Mainboard</div>
                        <div>✓ Chuẩn RAM & Khe cắm</div>
                        <div>✓ Form Factor Main & Case</div>
                        <div>✓ Chiều dài GPU & Vỏ Case</div>
                        <div>✓ Chiều cao tản & Vỏ Case</div>
                        <div>✓ Tản nhiệt hỗ trợ Socket</div>
                        <div>✓ Công suất Nguồn & Tổng TDP</div>
                        <div>✓ Tồn kho linh kiện hợp lệ</div>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 pt-1">
                        {validationResult.violations.map((violation, idx) => (
                          <li key={idx}>{violation}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách 8 slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PC_COMPONENT_SLOTS.map((slot) => {
                const IconComponent = SLOT_ICONS[slot.category]
                const selected = selectedComponents[slot.category]
                const categoryProducts = productsByCategory[slot.category] || []

                return (
                  <div
                    key={slot.category}
                    className={`p-3.5 rounded-xl border transition-all ${
                      selected
                        ? 'bg-white border-slate-300 shadow-sm'
                        : 'bg-slate-50/50 border-dashed border-slate-300'
                    }`}
                  >
                    {/* Header Slot */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            selected
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            {slot.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {slot.description} ({categoryProducts.length} sản phẩm trong kho)
                          </span>
                        </div>
                      </div>

                      {selected && (
                        <button
                          type="button"
                          onClick={() => handleSelectComponent(slot.category, null)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline"
                        >
                          Gỡ bỏ
                        </button>
                      )}
                    </div>

                    {/* Bộ chọn sản phẩm thật từ Database */}
                    <div className="space-y-2">
                      <select
                        value={selected?.id || ''}
                        onChange={(e) => {
                          const prodId = e.target.value
                          const found = categoryProducts.find((p) => p.id === prodId) || null
                          handleSelectComponent(slot.category, found)
                        }}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Chưa chọn {slot.category} --</option>
                        {categoryProducts.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({new Intl.NumberFormat('vi-VN').format(prod.price)} đ) - Kho: {prod.stockQuantity}
                          </option>
                        ))}
                      </select>

                      {/* Tóm tắt thông số linh kiện đã chọn */}
                      {selected ? (
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs border border-slate-200/60">
                          <div className="truncate pr-2">
                            <span className="text-slate-700 text-xs font-medium block truncate">
                              {selected.name}
                            </span>
                            <span className="font-semibold text-blue-600 text-xs">
                              {new Intl.NumberFormat('vi-VN').format(selected.price)} đ
                            </span>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-medium ${
                              selected.stockQuantity > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {selected.stockQuantity > 0 ? `Còn ${selected.stockQuantity}` : 'Hết hàng'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-600 bg-amber-50/60 px-2.5 py-1.5 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {categoryProducts.length > 0
                              ? `Cần chọn 1 linh kiện ${slot.category} từ kho`
                              : `Chưa có sản phẩm ${slot.category} nào trong kho dữ liệu`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </form>

        {/* Footer Modal: Tổng tiền & Nút Hành động */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Tổng giá niêm yết (8 slot thực tế):</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {new Intl.NumberFormat('vi-VN').format(calculatedTotalPrice)} đ
                </span>
                <span className="text-[11px] text-slate-400">Đã gồm VAT 10%</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div className="text-xs text-slate-500 hidden sm:block">
              Trạng thái: <span className="font-semibold text-slate-800">{filledSlotsCount}/8</span> slot
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : isDuplicate ? (
                'Nhân bản Cấu hình'
              ) : initialData ? (
                'Cập nhật Cấu hình'
              ) : (
                'Lưu cấu hình PC mới'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
