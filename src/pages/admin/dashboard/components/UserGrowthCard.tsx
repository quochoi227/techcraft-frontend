import React, { useState, useMemo } from "react"
import { Users, ShieldCheck, UserPlus } from "lucide-react"
import type { UserStatistics } from "@/types/statistics"

interface UserGrowthCardProps {
  userStats: UserStatistics | null
  loading?: boolean
}

export const UserGrowthCard: React.FC<UserGrowthCardProps> = ({
  userStats,
  loading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const timeline = userStats?.timeline ?? []

  const maxUsers = useMemo(() => {
    if (timeline.length === 0) return 1
    const max = Math.max(...timeline.map((t) => t.newUsersCount))
    return max > 0 ? max : 1
  }, [timeline])

  const activePoint =
    hoveredIndex !== null && timeline[hoveredIndex] ? timeline[hoveredIndex] : null

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Tăng Trưởng Khách Hàng & Người Dùng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê lượng tài khoản mới đăng ký và mức độ kích hoạt xác thực
          </p>
        </div>

        {/* Small stats badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
            <UserPlus className="w-3.5 h-3.5" />
            <span>+{userStats?.newUsersInPeriod ?? 0} mới</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{userStats?.verifiedUsers ?? 0} đã xác thực</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Đang tải biểu đồ tăng trưởng người dùng...</span>
        </div>
      ) : timeline.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
          Chưa có dữ liệu người dùng đăng ký trong khoảng thời gian này
        </div>
      ) : (
        <div className="mt-4">
          {/* Timeline Mini Bar Chart */}
          <div
            className="relative h-32 flex items-end gap-1.5 pt-6 pb-2 px-1 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {timeline.map((point, idx) => {
              const heightRatio = point.newUsersCount / maxUsers
              const heightPercent = Math.max(8, heightRatio * 100)
              const isHovered = hoveredIndex === idx

              return (
                <div
                  key={point.date || idx}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  {/* Số lượng phía trên cột */}
                  {point.newUsersCount > 0 && (
                    <span
                      className={`text-[10px] font-bold mb-1 transition-colors ${
                        isHovered ? "text-purple-600" : "text-slate-400"
                      }`}
                    >
                      {point.newUsersCount}
                    </span>
                  )}

                  {/* Cột */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 ${
                      isHovered
                        ? "bg-purple-600 shadow-sm"
                        : "bg-purple-200 hover:bg-purple-300"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
              )
            })}

            {/* Hover Tooltip */}
            {activePoint && (
              <div
                className="absolute z-20 pointer-events-none transform -translate-x-1/2 -top-4 bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1.5 rounded-md shadow-lg text-[11px] whitespace-nowrap"
                style={{
                  left: `${
                    ((hoveredIndex! + 0.5) / timeline.length) * 100
                  }%`,
                }}
              >
                <div className="font-semibold">{activePoint.label}</div>
                <div className="text-purple-300 font-bold">
                  +{activePoint.newUsersCount} tài khoản mới
                </div>
              </div>
            )}
          </div>

          {/* Timeline Dates labels under the columns */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-2 border-t border-slate-100">
            <span>{timeline[0]?.label}</span>
            {timeline.length > 2 && (
              <span>{timeline[Math.floor(timeline.length / 2)]?.label}</span>
            )}
            <span>{timeline[timeline.length - 1]?.label}</span>
          </div>

          {/* Summary Footer Badges */}
          <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="block text-[11px] text-slate-500 font-medium">Tổng User</span>
              <span className="text-sm font-bold text-slate-900">
                {userStats?.totalUsers ?? 0}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="block text-[11px] text-slate-500 font-medium">Đang Hoạt Động</span>
              <span className="text-sm font-bold text-emerald-600">
                {userStats?.activeUsers ?? 0}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="block text-[11px] text-slate-500 font-medium">Đã Xác Thực</span>
              <span className="text-sm font-bold text-blue-600">
                {userStats?.verifiedUsers ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
