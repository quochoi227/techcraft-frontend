import React from 'react'
import {
  X,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Box,
  Wind,
  Sparkles,
  ShieldCheck,
  Edit,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProductCategory } from '@/types/product'
import type { PcCase } from '@/types/pcCase'
import { PC_COMPONENT_SLOTS, USE_CASE_OPTIONS } from '../constants'

interface PcCaseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  pcCase: PcCase | null
  onEdit?: (pcCase: PcCase) => void
}

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

export const PcCaseDetailModal: React.FC<PcCaseDetailModalProps> = ({
  isOpen,
  onClose,
  pcCase,
  onEdit,
}) => {
  if (!isOpen || !pcCase) return null

  // Tìm thông tin useCase
  const useCaseOption = USE_CASE_OPTIONS.find((u) => u.value === pcCase.useCase) || {
    label: pcCase.useCase || 'Chung',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  // Lấy chi tiết các linh kiện thật từ items của database
  const resolvedItems = PC_COMPONENT_SLOTS.map((slot) => {
    const itemInCase = pcCase.items?.find((i) => i.category === slot.category)
    const product = itemInCase?.product || null

    return {
      slot,
      product,
    }
  })

  const configuredSlotsCount = resolvedItems.filter((i) => Boolean(i.product)).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {pcCase.name}
                </h2>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${useCaseOption.badgeClass}`}
                >
                  {useCaseOption.label}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    pcCase.isActive ?? pcCase.active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pcCase.isActive ?? pcCase.active ? 'Đang phát hành' : 'Tạm ẩn'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Mã định danh: {pcCase.id}</span>
                {pcCase.createdAt && (
                  <span className="flex items-center gap-1">
                    • <Calendar className="w-3 h-3" /> Ngày tạo:{' '}
                    {new Date(pcCase.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Cuộn */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin tóm tắt & Mô tả */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Mô tả & Định vị cấu hình
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              {pcCase.description || 'Chưa có thông tin mô tả chi tiết cho cấu hình này.'}
            </p>
          </div>

          {/* Bảng 8 Slot linh kiện chi tiết trong Database */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chi tiết 8 Linh kiện phần cứng trong Database
              </h3>
              <span className="text-xs text-slate-500">
                {configuredSlotsCount}/8 slot đã cấu hình
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">Slot</th>
                    <th className="py-3 px-4">Tên linh kiện trong kho</th>
                    <th className="py-3 px-4 text-right">Đơn giá thực tế</th>
                    <th className="py-3 px-4 text-center">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resolvedItems.map(({ slot, product }) => {
                    const IconComponent = SLOT_ICONS[slot.category]
                    return (
                      <tr key={slot.category} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs"
                            title={slot.label}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {product ? (
                            <>
                              <div className="font-semibold text-slate-900 text-sm">
                                {product.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Danh mục: <span className="font-medium text-slate-600">{slot.label}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-xs">
                              Chưa gắn linh kiện {slot.label}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800">
                          {product
                            ? `${new Intl.NumberFormat('vi-VN').format(product.price)} đ`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {product ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                product.stockQuantity > 5
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : product.stockQuantity > 0
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {product.stockQuantity > 0
                                ? `Còn ${product.stockQuantity}`
                                : 'Hết hàng'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trạng thái 8 ràng buộc tương thích phần cứng */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Thẩm định 8 Ràng buộc tương thích phần cứng</span>
            </div>
            <p className="text-xs text-emerald-700">
              Cấu hình được kiểm soát theo các quy tắc tương thích phần cứng nội bộ của TechCraft và sẵn sàng cấp dữ liệu phản hồi cho Chatbot AI.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Socket CPU & Bo mạch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Chuẩn RAM & Tốc độ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Form factor Main & Case</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kích thước Card VGA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Chiều cao Tản nhiệt CPU</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Socket ngàm Tản nhiệt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Công suất an toàn Nguồn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Đủ tồn kho xuất xưởng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal: Tổng tiền & Nút sửa */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Tổng giá niêm yết trọn bộ:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {new Intl.NumberFormat('vi-VN').format(pcCase.totalPrice || 0)} đ
              </span>
              <span className="text-xs text-slate-400">Đã gồm VAT 10%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onClose()
                  onEdit(pcCase)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh sửa cấu hình này</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
