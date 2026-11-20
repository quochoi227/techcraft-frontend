import React from "react"
import { SearchX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductEmptyStateProps {
  onResetFilters: () => void
  searchQuery?: string
  hasActiveFilters?: boolean
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  onResetFilters,
  searchQuery,
  hasActiveFilters = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-16 bg-white rounded-2xl border border-dashed border-slate-300 min-h-[380px]">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
        Không tìm thấy linh kiện phù hợp
      </h3>

      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {searchQuery ? (
          <>
            Không có kết quả nào khớp với từ khóa{" "}
            <span className="font-semibold text-slate-800">"{searchQuery}"</span>. Vui
            lòng thử từ khóa khác hoặc xóa bớt tiêu chí lọc.
          </>
        ) : hasActiveFilters ? (
          "Không có linh kiện nào thỏa mãn các điều kiện lọc (danh mục, mức giá hoặc tình trạng hàng). Hãy thử mở rộng tiêu chí tìm kiếm."
        ) : (
          "Hiện tại danh mục này chưa có sản phẩm nào đang hoạt động. Vui lòng quay lại sau!"
        )}
      </p>

      {hasActiveFilters && (
        <Button
          type="button"
          onClick={onResetFilters}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xóa tất cả bộ lọc</span>
        </Button>
      )}
    </div>
  )
}
