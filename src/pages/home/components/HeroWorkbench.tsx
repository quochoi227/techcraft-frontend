import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bot, CheckCircle2, Cpu, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { USE_CASES_META, PC_PRICE_RANGE_PRESETS } from "@/pages/pc-cases/constants"

const WORKBENCH_USE_CASES = ["gaming", "rendering", "office", "ai"] as const
const WORKBENCH_BUDGETS = PC_PRICE_RANGE_PRESETS.filter((p) => p.id !== "all")

export const HeroWorkbench: React.FC = () => {
  const navigate = useNavigate()
  const [selectedUseCase, setSelectedUseCase] = useState<string>("gaming")
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("15m-30m")

  const activeUseCase = USE_CASES_META[selectedUseCase]
  const activeBudget =
    WORKBENCH_BUDGETS.find((b) => b.id === selectedBudgetId) || WORKBENCH_BUDGETS[1]

  const handleFindPcCases = () => {
    const params = new URLSearchParams()
    if (selectedUseCase) {
      params.set("useCase", selectedUseCase)
    }
    if (activeBudget.minPrice !== undefined) {
      params.set("minPrice", String(activeBudget.minPrice))
    }
    if (activeBudget.maxPrice !== undefined) {
      params.set("maxPrice", String(activeBudget.maxPrice))
    }
    navigate(`/pc-cases?${params.toString()}`)
  }

  return (
    <section className="relative bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left column: Value proposition & primary actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Kiểm tra tương thích phần cứng tự động trước khi đặt hàng</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl">
              Lắp ráp PC chuẩn xác, tư vấn cấu hình thông minh cùng TechCraft
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Chọn từ kho linh kiện chính hãng hoặc các bộ PC đã được kiểm định
              socket, công suất nguồn và kích thước thùng máy. Trợ lý AI hỗ trợ
              gợi ý theo ngân sách và giải đáp chính sách cửa hàng tức thì.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-sm"
                asChild
              >
                <Link to="/ai-consultant">
                  <Bot className="w-4 h-4" />
                  Tư vấn cấu hình AI
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold" asChild>
                <Link to="/pc-cases">Xem bộ PC lắp sẵn</Link>
              </Button>
              <Button size="lg" variant="ghost" className="font-semibold text-slate-700" asChild>
                <Link to="/products">Kho linh kiện lẻ</Link>
              </Button>
            </div>

            <dl className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 max-w-xl">
              <div>
                <dt className="text-xs text-slate-500 font-medium">Danh mục linh kiện</dt>
                <dd className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  8 nhóm chuẩn
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 font-medium">Ràng buộc kỹ thuật</dt>
                <dd className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  9 bước kiểm tra
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 font-medium">Hỗ trợ đổi mới</dt>
                <dd className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  30 ngày đầu
                </dd>
              </div>
            </dl>
          </div>

          {/* Right column: Interactive Configuration Workbench */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Lọc nhanh cấu hình theo nhu cầu
                    </h2>
                    <p className="text-xs text-slate-500">
                      Chọn mục đích và mức ngân sách dự kiến
                    </p>
                  </div>
                </div>
              </div>

              {/* Use-case selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Mục đích sử dụng
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKBENCH_USE_CASES.map((key) => {
                    const meta = USE_CASES_META[key]
                    const Icon = meta.icon
                    const isSelected = selectedUseCase === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedUseCase(key)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? "bg-white border-blue-600 text-slate-900 ring-1 ring-blue-600"
                            : "bg-white/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span className="text-xs font-semibold truncate">
                          {meta.shortLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Budget selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ngân sách dự kiến
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKBENCH_BUDGETS.map((preset) => {
                    const isSelected = selectedBudgetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedBudgetId(preset.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left tabular-nums transition-colors ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active profile summary */}
              <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {activeUseCase?.label} ({activeBudget.label})
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {activeUseCase?.description}. Chỉ hiển thị các cấu hình còn đủ
                  linh kiện tồn kho và đạt chuẩn tương thích.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  type="button"
                  onClick={handleFindPcCases}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Xem cấu hình phù hợp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="font-semibold bg-white"
                  asChild
                >
                  <Link to="/ai-consultant">Nhờ AI tư vấn thêm</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
