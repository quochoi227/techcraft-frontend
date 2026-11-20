import React, { useState, useMemo, useRef } from "react"
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Calendar,
  Sparkles,
} from "lucide-react"
import type { RevenueTimelinePoint, TimePeriod } from "@/types/statistics"

const formatVND = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫"
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`
}

const formatCompactVND = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} Tr`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} k`
  }
  return String(amount)
}

interface RevenueChartProps {
  timeline: RevenueTimelinePoint[]
  currentPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
  loading?: boolean
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  timeline = [],
  currentPeriod,
  onPeriodChange,
  loading = false,
}) => {
  const [chartType, setChartType] = useState<"area" | "bar">("area")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Tính toán các giá trị min, max, peak
  const { maxRevenue, totalPeriodRevenue, totalPeriodOrders, peakPoint } = useMemo<{
    maxRevenue: number
    totalPeriodRevenue: number
    totalPeriodOrders: number
    peakPoint: RevenueTimelinePoint | null
  }>(() => {
    if (!timeline || timeline.length === 0) {
      return { maxRevenue: 1, totalPeriodRevenue: 0, totalPeriodOrders: 0, peakPoint: null }
    }

    let max = 0
    let totalRev = 0
    let totalOrders = 0
    let peak: RevenueTimelinePoint | null = null

    timeline.forEach((pt) => {
      totalRev += pt.revenue
      totalOrders += pt.orderCount
      if (pt.revenue > max) {
        max = pt.revenue
        peak = pt
      }
    })

    return {
      maxRevenue: max > 0 ? max : 1,
      totalPeriodRevenue: totalRev,
      totalPeriodOrders: totalOrders,
      peakPoint: peak,
    }
  }, [timeline])

  // SVG Chart Dimensions
  const svgWidth = 800
  const svgHeight = 280
  const paddingLeft = 60
  const paddingRight = 30
  const paddingTop = 25
  const paddingBottom = 40

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  // Tính toạ độ các điểm trên SVG
  const points = useMemo(() => {
    if (!timeline || timeline.length === 0) return []
    const count = timeline.length
    const stepX = count > 1 ? chartWidth / (count - 1) : chartWidth / 2

    return timeline.map((pt, index) => {
      const x = paddingLeft + (count === 1 ? chartWidth / 2 : index * stepX)
      const ratio = pt.revenue / (maxRevenue * 1.15) // Thêm 15% padding ở đỉnh
      const y = paddingTop + chartHeight - ratio * chartHeight
      return { x, y, data: pt, index }
    })
  }, [timeline, chartWidth, chartHeight, paddingLeft, paddingTop, maxRevenue])

  // Đường Path cho Area Chart
  const linePath = useMemo(() => {
    if (points.length === 0) return ""
    return points.reduce((path, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`
      // Đường cong mượt cubic bezier
      const prev = points[i - 1]
      const cpX = (prev.x + pt.x) / 2
      return `${path} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`
    }, "")
  }, [points])

  const areaPath = useMemo(() => {
    if (points.length === 0) return ""
    const baseY = paddingTop + chartHeight
    const firstX = points[0].x
    const lastX = points[points.length - 1].x
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`
  }, [linePath, points, paddingTop, chartHeight])

  // Các mốc Y-axis (4 vạch)
  const yTicks = useMemo(() => {
    const ticks = []
    const count = 4
    for (let i = 0; i <= count; i++) {
      const val = (maxRevenue * 1.15 * i) / count
      const y = paddingTop + chartHeight - (val / (maxRevenue * 1.15)) * chartHeight
      ticks.push({ value: val, y })
    }
    return ticks
  }, [maxRevenue, paddingTop, chartHeight])

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Xu Hướng Doanh Thu Bán Hàng
            </h3>
            {peakPoint && peakPoint.revenue > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Đỉnh: {formatCompactVND(peakPoint.revenue)} ({peakPoint.label})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng doanh thu trong giai đoạn:{" "}
            <span className="font-semibold text-slate-800">{formatVND(totalPeriodRevenue)}</span> (
            {totalPeriodOrders} đơn hàng)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setChartType("area")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "area"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Đồ thị miền"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Miền</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "bar"
                  ? "bg-white text-blue-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Biểu đồ cột"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cột</span>
            </button>
          </div>

          {/* Period Selector Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(["DAY", "MONTH", "YEAR"] as TimePeriod[]).map((p) => {
              const label = p === "DAY" ? "Ngày" : p === "MONTH" ? "Tháng" : "Năm"
              const isActive = currentPeriod === p
              return (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div
        ref={containerRef}
        className="relative mt-4 w-full select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {loading ? (
          <div className="h-[280px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Đang tải số liệu doanh thu...</span>
            </div>
          </div>
        ) : timeline.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg text-slate-400 text-sm">
            Không có dữ liệu doanh thu trong khoảng thời gian này
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[320px] overflow-visible"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Y Axis labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? "none" : "3 3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {formatCompactVND(tick.value)}
                </text>
              </g>
            ))}

            {/* Render Biểu đồ Cột (Bar Chart) */}
            {chartType === "bar" && (
              <g>
                {points.map((pt, i) => {
                  const barWidth = Math.min(36, Math.max(12, chartWidth / points.length - 6))
                  const barHeight = paddingTop + chartHeight - pt.y
                  const barX = pt.x - barWidth / 2
                  const isHovered = hoveredIndex === i

                  return (
                    <g key={i} className="transition-all duration-200">
                      <rect
                        x={barX}
                        y={pt.y}
                        width={barWidth}
                        height={Math.max(2, barHeight)}
                        rx="4"
                        fill={isHovered ? "#2563eb" : "url(#barGradient)"}
                        className="cursor-pointer transition-colors"
                        onMouseEnter={() => setHoveredIndex(i)}
                      />
                      {/* Số đơn hàng nhỏ hiển thị trên cột nếu có */}
                      {pt.data.orderCount > 0 && barWidth >= 20 && (
                        <text
                          x={pt.x}
                          y={pt.y - 6}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontWeight="bold"
                        >
                          {pt.data.orderCount}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )}

            {/* Render Đồ thị Miền (Area Chart) */}
            {chartType === "area" && (
              <g>
                <path d={areaPath} fill="url(#revenueGradient)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((pt, i) => {
                  const isHovered = hoveredIndex === i
                  const isPeak = peakPoint && pt.data.date === peakPoint.date
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : isPeak ? 4.5 : 3}
                        fill={isHovered ? "#1d4ed8" : isPeak ? "#10b981" : "#ffffff"}
                        stroke={isHovered ? "#ffffff" : isPeak ? "#10b981" : "#2563eb"}
                        strokeWidth={isHovered ? 2.5 : 2}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredIndex(i)}
                      />
                    </g>
                  )
                })}
              </g>
            )}

            {/* Hover Crosshair Cursor */}
            {activePoint && (
              <g pointerEvents="none">
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={paddingTop + chartHeight}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            )}

            {/* X Axis Date Labels */}
            {points.map((pt, i) => {
              // Lọc nhãn trục X để không bị chồng chéo
              const total = points.length
              const shouldShow =
                total <= 12 ||
                i === 0 ||
                i === total - 1 ||
                i % Math.ceil(total / 8) === 0

              if (!shouldShow) return null

              const labelText =
                currentPeriod === "DAY"
                  ? pt.data.label.slice(0, 5) // Chỉ lấy dd/MM
                  : pt.data.label

              return (
                <text
                  key={i}
                  x={pt.x}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill={hoveredIndex === i ? "#1e293b" : "#64748b"}
                  fontWeight={hoveredIndex === i ? "bold" : "normal"}
                  className="font-mono transition-colors"
                >
                  {labelText}
                </text>
              )
            })}
          </svg>
        )}

        {/* Floating Tooltip Card */}
        {activePoint && !loading && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-xl text-xs border border-slate-700/60 min-w-[170px]"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${(activePoint.y / svgHeight) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1.5 text-slate-300 font-medium pb-1.5 border-b border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{activePoint.data.label}</span>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Doanh thu:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatVND(activePoint.data.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Đơn thành công:</span>
                <span className="font-semibold text-blue-300">
                  {activePoint.data.orderCount} đơn
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
