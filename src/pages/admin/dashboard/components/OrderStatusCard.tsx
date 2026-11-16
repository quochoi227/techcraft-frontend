import React, { useState, useMemo } from "react"
import { ShoppingBag, CheckCircle2, Clock, Truck, XCircle, Info } from "lucide-react"
import type { OrderStatistics } from "@/types/statistics"
import type { OrderStatus } from "@/types/order"

interface OrderStatusCardProps {
  orderStats: OrderStatistics | null
  loading?: boolean
}

interface StatusColorConfig {
  color: string
  hoverColor: string
  bgColor: string
  textColor: string
  icon: React.ElementType
}

const STATUS_CONFIG_MAP: Record<OrderStatus, StatusColorConfig> = {
  PENDING: {
    color: "#f59e0b",
    hoverColor: "#d97706",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    icon: Clock,
  },
  CONFIRMED: {
    color: "#3b82f6",
    hoverColor: "#2563eb",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: CheckCircle2,
  },
  SHIPPING: {
    color: "#6366f1",
    hoverColor: "#4f46e5",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    icon: Truck,
  },
  DELIVERED: {
    color: "#10b981",
    hoverColor: "#059669",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    color: "#ef4444",
    hoverColor: "#dc2626",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    icon: XCircle,
  },
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  orderStats,
  loading = false,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<OrderStatus | null>(null)

  const breakdown = orderStats?.breakdown ?? []
  const totalOrders = orderStats?.totalOrders ?? 0

  // Tính các cung (arc) cho Donut SVG
  const slices = useMemo(() => {
    if (totalOrders === 0 || breakdown.length === 0) return []

    const radius = 64
    const circumference = 2 * Math.PI * radius
    let accumulatedAngle = 0

    return breakdown.map((item) => {
      const percentage = item.percentage / 100
      const strokeDasharray = `${percentage * circumference} ${circumference}`
      const strokeDashoffset = -accumulatedAngle * circumference
      accumulatedAngle += percentage

      const config = STATUS_CONFIG_MAP[item.status] || {
        color: "#94a3b8",
        hoverColor: "#64748b",
        bgColor: "bg-slate-50",
        textColor: "text-slate-700",
        icon: Info,
      }

      return {
        ...item,
        config,
        strokeDasharray,
        strokeDashoffset,
      }
    })
  }, [breakdown, totalOrders])

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Cơ Cấu Trạng Thái Đơn Hàng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ lệ phân bổ theo tiến trình xử lý và giao hàng
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Đang tải phân tích đơn hàng...</span>
        </div>
      ) : totalOrders === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
          Chưa có đơn hàng nào trong khoảng thời gian này
        </div>
      ) : (
        <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center select-none">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full -rotate-90 transform"
            >
              {/* Vòng nền mờ */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#f1f5f9"
                strokeWidth="16"
                fill="none"
              />

              {/* Các lát cắt trạng thái */}
              {slices.map((slice) => {
                const isHovered = hoveredStatus === slice.status
                return (
                  <circle
                    key={slice.status}
                    cx="80"
                    cy="80"
                    r="64"
                    stroke={isHovered ? slice.config.hoverColor : slice.config.color}
                    strokeWidth={isHovered ? "20" : "16"}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    fill="none"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredStatus(slice.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                )
              })}
            </svg>

            {/* Thông tin ở giữa Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {totalOrders}
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Đơn hàng
              </span>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="flex-1 w-full space-y-2.5">
            {slices.map((slice) => {
              const isHovered = hoveredStatus === slice.status
              const Icon = slice.config.icon

              return (
                <div
                  key={slice.status}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isHovered ? "bg-slate-50 shadow-xs" : "hover:bg-slate-50/60"
                  }`}
                  onMouseEnter={() => setHoveredStatus(slice.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.config.color }}
                      ></span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {slice.statusName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{slice.count} đơn</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({slice.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${slice.percentage}%`,
                        backgroundColor: slice.config.color,
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
