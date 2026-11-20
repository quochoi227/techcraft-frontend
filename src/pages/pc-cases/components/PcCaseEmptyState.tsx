import React from "react"
import { SearchX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PcCaseEmptyStateProps {
  onResetFilters: () => void
  searchQuery?: string
  hasActiveFilters?: boolean
}

export const PcCaseEmptyState: React.FC<PcCaseEmptyStateProps> = ({
  onResetFilters,
  searchQuery,
  hasActiveFilters = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-16 bg-white rounded-3xl border border-dashed border-slate-300 min-h-[380px]">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shadow-sm">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
        Không tìm thấy cấu hình PC phù hợp
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {searchQuery ? (
          <>
            Không có cấu hình nào khớp với từ khóa{" "}
            <span className="font-semibold text-slate-800">"{searchQuery}"</span>. Vui
            lòng thử từ khóa khác hoặc xóa bớt tiêu chí lọc.
          </>
        ) : hasActiveFilters ? (
          "Không có cấu hình nào thỏa mãn các điều kiện lọc (nhu cầu, mức ngân sách hoặc tình trạng linh kiện). Hãy thử mở rộng tiêu chí tìm kiếm."
        ) : (
          "Hiện tại chưa có cấu hình PC nào đang hoạt động. Vui lòng quay lại sau!"
        )}
      </p>

      {hasActiveFilters && (
        <Button
          type="button"
          onClick={onResetFilters}
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xóa tất cả bộ lọc</span>
        </Button>
      )}
    </div>
  )
}
