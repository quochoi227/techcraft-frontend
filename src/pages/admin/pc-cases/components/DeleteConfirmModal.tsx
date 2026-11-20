import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PcCase } from '@/types/pcCase'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  pcCase: PcCase | null
  isDeleting: boolean
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pcCase,
  isDeleting,
}) => {
  if (!isOpen || !pcCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Xác nhận xóa Cấu hình PC?
          </h3>
          <p className="text-sm text-slate-500">
            Bạn có chắc chắn muốn xóa cấu hình{' '}
            <span className="font-semibold text-slate-800">"{pcCase.name}"</span> khỏi hệ thống?
          </p>
          <p className="text-xs text-rose-500 pt-1">
            * Cấu hình này sẽ không còn xuất hiện trong danh sách gợi ý của Chatbot AI.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xác nhận xóa'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
