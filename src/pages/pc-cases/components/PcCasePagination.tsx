import React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PcCasePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
  pageSize?: number
}

export const PcCasePagination: React.FC<PcCasePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize = 12,
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const total = totalPages
    const current = currentPage + 1

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push("...")

      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)

      if (current < total - 2) pages.push("...")
      pages.push(total)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements ?? 0)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-2 border-t border-slate-200/80">
      <div className="text-xs text-slate-500 font-medium">
        {totalElements !== undefined ? (
          <span>
            Hiển thị <span className="font-bold text-slate-800">{startItem}</span> -{" "}
            <span className="font-bold text-slate-800">{endItem}</span> trên tổng số{" "}
            <span className="font-bold text-slate-800">{totalElements}</span> cấu hình PC
          </span>
        ) : (
          <span>
            Trang <span className="font-bold text-slate-800">{currentPage + 1}</span> /{" "}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(0)}
          className="h-9 w-9 p-0 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 w-9 p-0 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 text-center text-xs text-slate-400 font-bold select-none"
                >
                  ...
                </span>
              )
            }

            const pageIndex = (p as number) - 1
            const isCurrent = pageIndex === currentPage

            return (
              <Button
                key={`page-${p}`}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageIndex)}
                className={`h-9 w-9 p-0 text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 w-9 p-0 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          className="h-9 w-9 p-0 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          title="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
