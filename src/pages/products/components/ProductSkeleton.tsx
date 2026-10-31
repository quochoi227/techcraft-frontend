import React from "react"

interface ProductSkeletonProps {
  viewMode?: "grid" | "list"
  count?: number
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  viewMode = "grid",
  count = 8,
}) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse"
          >
            {/* Image placeholder */}
            <div className="w-full sm:w-48 h-48 rounded-lg bg-slate-200 shrink-0" />

            {/* Content placeholder */}
            <div className="flex-1 w-full space-y-3 py-2">
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-slate-200" />
                <div className="h-5 w-24 rounded-full bg-slate-200" />
              </div>
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="flex items-center justify-between pt-4">
                <div className="h-7 w-28 rounded bg-slate-200" />
                <div className="h-9 w-28 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden animate-pulse p-4 space-y-4"
        >
          {/* Image placeholder */}
          <div className="aspect-square w-full rounded-lg bg-slate-200" />

          {/* Details placeholder */}
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-full rounded bg-slate-200" />
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-4/5 rounded bg-slate-100 pt-1" />
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="h-9 w-9 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
