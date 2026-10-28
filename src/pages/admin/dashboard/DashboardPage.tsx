import React from "react"
import { TrendingUp, ShoppingBag, Package, Users } from "lucide-react"

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Tổng quan & Thống kê
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi doanh số linh kiện, trạng thái đơn hàng và hiệu suất AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Doanh thu tháng này</div>
            <div className="text-xl font-bold text-slate-900">425.800.000đ</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Đơn hàng mới</div>
            <div className="text-xl font-bold text-slate-900">18 đơn</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Linh kiện sắp hết</div>
            <div className="text-xl font-bold text-slate-900">6 sản phẩm</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Thành viên mới</div>
            <div className="text-xl font-bold text-slate-900">142 tài khoản</div>
          </div>
        </div>
      </div>
    </div>
  )
}
