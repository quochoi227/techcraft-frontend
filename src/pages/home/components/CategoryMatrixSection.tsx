import React from "react"
import { Link } from "react-router-dom"
import { CATEGORIES_META } from "@/pages/products/constants"
import type { ProductCategory } from "@/types/product"

const ORDERED_CATEGORIES: ProductCategory[] = [
  "CPU",
  "MAINBOARD",
  "RAM",
  "GPU",
  "STORAGE",
  "PSU",
  "CASE",
  "CPU_COOLER",
]

export const CategoryMatrixSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-14 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Danh mục linh kiện máy tính
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Đầy đủ 8 nhóm phần cứng cốt lõi với thông số kỹ thuật chi tiết cho từng sản phẩm
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Xem tất cả linh kiện
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {ORDERED_CATEGORIES.map((categoryKey) => {
            const meta = CATEGORIES_META[categoryKey]
            const Icon = meta.icon
            return (
              <Link
                key={categoryKey}
                to={`/products?category=${categoryKey}`}
                className="group bg-white rounded-xl border border-slate-200/90 p-4 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg ${meta.bgLightClass} ${meta.colorClass} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    {meta.shortLabel}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
