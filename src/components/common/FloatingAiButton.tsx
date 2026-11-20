import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Bot, Sparkles } from "lucide-react"

export const FloatingAiButton: React.FC = () => {
  const location = useLocation()

  // Không hiển thị nếu người dùng đang ở trực tiếp trên trang tư vấn AI hoặc trang admin
  if (
    location.pathname.startsWith("/ai-consultant") ||
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/admin")
  ) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <Link
        to="/ai-consultant"
        className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Glowing badge */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>

        <Bot className="w-5 h-5 text-white stroke-[2.2]" />

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            Hỏi AI Tư Vấn
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
          <span className="text-[10px] text-blue-100 font-medium -mt-0.5">
            Cấu hình PC & Chính sách
          </span>
        </div>
      </Link>
    </div>
  )
}
