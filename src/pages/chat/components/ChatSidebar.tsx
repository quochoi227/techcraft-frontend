import React from "react"
import {
  Sparkles,
  RotateCcw,
  Zap,
  CheckCircle,
  FileCheck2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SuggestedPrompt } from "@/types/chat"

interface ChatSidebarProps {
  onSelectPrompt: (prompt: string) => void
  onClearChat: () => void
  messageCount: number
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "pc-1",
    title: "PC Gaming 20 - 25 triệu",
    prompt: "Tư vấn cho mình cấu hình PC chơi game tầm 20 đến 25 triệu mượt mà các tựa game AAA và Esports.",
    category: "pc_build",
    badge: "Gaming",
  },
  {
    id: "pc-2",
    title: "PC Đồ họa & Render 3D",
    prompt: "Mình cần build một bộ máy phục vụ thiết kế đồ họa 3D, dựng video 4K với ngân sách khoảng 35 triệu.",
    category: "pc_build",
    badge: "Đồ họa",
  },
  {
    id: "pc-3",
    title: "PC Văn phòng tiết kiệm",
    prompt: "Gợi ý cấu hình PC phục vụ học tập, văn phòng và đa nhiệm mượt mà trong tầm giá dưới 12 triệu.",
    category: "pc_build",
    badge: "Văn phòng",
  },
  {
    id: "policy-1",
    title: "Chính sách đổi trả & bảo hành",
    prompt: "Chính sách đổi trả và bảo hành linh kiện máy tính của TechCraft quy định như thế nào?",
    category: "policy",
    badge: "Bảo hành",
  },
  {
    id: "policy-2",
    title: "Vận chuyển & Thanh toán COD",
    prompt: "Shop có hỗ trợ giao hàng tận nơi và cho phép kiểm tra, thanh toán COD khi nhận hàng không?",
    category: "policy",
    badge: "Giao hàng",
  },
  {
    id: "compat-1",
    title: "Kiểm tra tương thích linh kiện",
    prompt: "Hệ thống kiểm tra tương thích giữa CPU, Mainboard, RAM và nguồn PSU tại TechCraft hoạt động ra sao?",
    category: "compatibility",
    badge: "Kỹ thuật",
  },
]

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onSelectPrompt,
  onClearChat,
  messageCount,
}) => {
  return (
    <aside className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-1 text-slate-800">
      {/* Box 1: Quick Actions & Reset */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Trợ lý AI TechCraft</span>
          </div>

          {messageCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearChat}
              className="h-7 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-1 rounded-lg transition-colors"
              title="Xóa lịch sử hội thoại hiện tại"
            >
              <RotateCcw className="w-3 h-3" />
              Làm mới
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Tư vấn cấu hình PC chuẩn theo ngân sách và giải đáp chính sách bán hàng dựa trên cơ sở dữ liệu nội bộ.
        </p>

        {/* Feature Pills */}
        <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-blue-50/70 text-blue-800">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Chỉ gợi ý cấu hình sẵn có và tương thích 100%</span>
          </div>
          <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-emerald-50/70 text-emerald-800">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Trích xuất chính sách chính thức (RAG)</span>
          </div>
          <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-indigo-50/70 text-indigo-800">
            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Thêm dàn máy vào giỏ hàng chỉ với 1 click</span>
          </div>
        </div>
      </div>

      {/* Box 2: Suggested Questions */}
      {/* <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5 shrink-0">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Câu hỏi gợi ý nhanh</span>
        </div>

        <div className="space-y-1.5">
          {SUGGESTED_PROMPTS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectPrompt(item.prompt)}
              className="w-full text-left p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/70 hover:border-blue-200 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600">
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                "{item.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div> */}

      {/* Box 3: Hotline & Support Help */}
      {/* <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 shadow-xs space-y-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Hỗ trợ kỹ thuật trực tiếp</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cần tư vấn cấu hình custom hoặc hỗ trợ gấp?
        </p>
        <div className="pt-0.5 space-y-1 text-xs">
          <a
            href="tel:0123456789"
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="font-semibold">Hotline: 0123.456.789</span>
          </a>
          <a
            href="mailto:admin@techcraft.com"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">admin@techcraft.com</span>
          </a>
        </div>
      </div> */}
    </aside>
  )
}
