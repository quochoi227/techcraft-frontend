import React, { useState } from "react"
import {
  Calendar,
  RotateCw,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type DatePreset =
  | "LAST_7_DAYS"
  | "LAST_14_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "ALL"
  | "CUSTOM"

interface StatisticsDateFilterProps {
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
  onRefresh: () => void
  onExportCsv: () => void
  loading?: boolean
  isUsingFallback?: boolean
}

export const StatisticsDateFilter: React.FC<StatisticsDateFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
  onRefresh,
  onExportCsv,
  loading = false,
  isUsingFallback = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("LAST_14_DAYS")
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customStart, setCustomStart] = useState(startDate)
  const [customEnd, setCustomEnd] = useState(endDate)

  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset)

    const now = new Date()
    const formatDate = (d: Date) => d.toISOString().split("T")[0]

    let start = ""
    let end = formatDate(now)

    switch (preset) {
      case "LAST_7_DAYS": {
        const d = new Date()
        d.setDate(d.getDate() - 6)
        start = formatDate(d)
        setIsCustomOpen(false)
        onDateChange(start, end)
        break
      }
      case "LAST_14_DAYS": {
        const d = new Date()
        d.setDate(d.getDate() - 13)
        start = formatDate(d)
        setIsCustomOpen(false)
        onDateChange(start, end)
        break
      }
      case "LAST_30_DAYS": {
        const d = new Date()
        d.setDate(d.getDate() - 29)
        start = formatDate(d)
        setIsCustomOpen(false)
        onDateChange(start, end)
        break
      }
      case "THIS_MONTH": {
        const d = new Date(now.getFullYear(), now.getMonth(), 1)
        start = formatDate(d)
        setIsCustomOpen(false)
        onDateChange(start, end)
        break
      }
      case "THIS_YEAR": {
        const d = new Date(now.getFullYear(), 0, 1)
        start = formatDate(d)
        setIsCustomOpen(false)
        onDateChange(start, end)
        break
      }
      case "ALL": {
        start = ""
        end = ""
        setIsCustomOpen(false)
        onDateChange("", "")
        break
      }
      case "CUSTOM": {
        setIsCustomOpen(true)
        break
      }
    }
  }

  const handleApplyCustom = () => {
    onDateChange(customStart, customEnd)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          Kỳ xem:
        </span>

        {[
          { label: "7 ngày qua", value: "LAST_7_DAYS" as DatePreset },
          { label: "14 ngày qua", value: "LAST_14_DAYS" as DatePreset },
          { label: "30 ngày qua", value: "LAST_30_DAYS" as DatePreset },
          { label: "Tháng này", value: "THIS_MONTH" as DatePreset },
          { label: "Năm nay", value: "THIS_YEAR" as DatePreset },
          { label: "Toàn bộ", value: "ALL" as DatePreset },
          { label: "Tùy chọn", value: "CUSTOM" as DatePreset },
        ].map((item) => {
          const isActive = selectedPreset === item.value
          return (
            <button
              key={item.value}
              onClick={() => handlePresetSelect(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Action Buttons & Status indicator */}
      <div className="flex flex-wrap items-center gap-2">
        {isUsingFallback && (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            Dữ liệu dự phòng
          </span>
        )}
        
        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs font-medium gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          <span>Làm mới</span>
        </Button>

        {/* Export CSV button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="h-8 text-xs font-medium gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Báo Cáo</span>
        </Button>
      </div>

      {/* Custom Date Range Collapsible */}
      {isCustomOpen && (
        <div className="w-full pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Từ ngày:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Đến ngày:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Button
            size="sm"
            onClick={handleApplyCustom}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Áp dụng khoảng ngày
          </Button>
        </div>
      )}
    </div>
  )
}
