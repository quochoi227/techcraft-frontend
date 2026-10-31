import React from "react"

interface PcCaseSkeletonProps {
  viewMode?: "grid" | "list"
  count?: number
}

export const PcCaseSkeleton: React.FC<PcCaseSkeletonProps> = ({
  viewMode = "grid",
  count = 6,
}) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-center gap-5 bg-white rounded-2xl border border-slate-200/90 p-5 animate-pulse"
          >
            <div className="w-full sm:w-52 h-52 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 w-full space-y-3 py-2">
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded-full bg-slate-200" />
                <div className="h-5 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="h-6 w-4/5 rounded bg-slate-200" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="h-7 w-32 rounded bg-slate-200" />
                <div className="h-9 w-28 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden animate-pulse p-4 space-y-4"
        >
          <div className="aspect-4/3 w-full rounded-xl bg-slate-200" />
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-full rounded bg-slate-200" />
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-6 w-28 rounded bg-slate-200" />
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
