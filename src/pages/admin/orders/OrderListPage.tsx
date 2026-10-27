import React from "react"

export const OrderListPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Quản lý đơn hàng
      </h1>
      <p className="text-sm text-slate-500">
        Xem và cập nhật trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
      </p>
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
        Chức năng Quản lý đơn hàng đang trong lộ trình phát triển.
      </div>
    </div>
  )
}
