import React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="text-7xl font-extrabold text-blue-600 mb-2">404</span>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Trang không tồn tại
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Đường dẫn bạn truy cập có thể đã bị di chuyển hoặc không tồn tại trên hệ thống TechCraft PC.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/" className="gap-2">
            <Home className="w-4 h-4" /> Về trang chủ
          </Link>
        </Button>
        <Button asChild>
          <Link to="/register" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Đến trang Đăng ký
          </Link>
        </Button>
      </div>
    </div>
  )
}
