import React from "react"
import { Link } from "react-router-dom"
import { Bot, Check, FileText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const COMPATIBILITY_CHECKS = [
  "Khớp socket giữa CPU và Bo mạch chủ",
  "Đồng bộ chuẩn RAM (DDR4 / DDR5) với CPU và Mainboard",
  "Form factor Mainboard nằm trong dải hỗ trợ của Vỏ Case",
  "Chiều dài Card đồ họa (GPU) không vượt quá không gian Case",
  "Chiều cao Tản nhiệt khí / Radiator phù hợp với Vỏ Case",
  "Công suất nguồn PSU đáp ứng tổng TDP hệ thống với hệ số an toàn 80%",
]

const POLICY_TOPICS = [
  {
    title: "Chính sách bảo hành & đổi mới 30 ngày",
    detail: "Tra cứu điều kiện bảo hành theo từng nhóm linh kiện chính hãng.",
  },
  {
    title: "Vận chuyển, lắp đặt & thanh toán COD",
    detail: "Quy trình giao nhận, kiểm tra máy trước khi thanh toán.",
  },
  {
    title: "Gợi ý cấu hình theo ngân sách thực tế",
    detail: "Trợ lý AI chỉ đề xuất các bộ PC Case đang còn đủ linh kiện trong kho.",
  },
]

export const CompatibilityAndRagSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Compatibility guarantee */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-teal-700 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                <span>Tiêu chuẩn kiểm định cấu hình</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Mọi bộ PC đều vượt qua kiểm tra tương thích phần cứng
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trước khi cấu hình được mở bán trên hệ thống, thuật toán của
                TechCraft rà soát tự động các thông số vật lý và điện năng giữa
                từng linh kiện.
              </p>

              <ul className="space-y-2.5 pt-2">
                {COMPATIBILITY_CHECKS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button variant="outline" className="bg-white font-semibold" asChild>
                <Link to="/pc-cases">Khám phá các bộ PC đạt chuẩn</Link>
              </Button>
            </div>
          </div>

          {/* AI & RAG Assistant */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-blue-300 font-semibold text-sm">
                <Bot className="w-5 h-5 shrink-0" />
                <span>Trợ lý AI TechCraft</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Hỏi đáp chính sách cửa hàng & tư vấn cấu hình trực tiếp
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Trợ lý AI kết hợp dữ liệu tài liệu chính sách nội bộ và danh
                sách PC Case thực tế để trả lời nhanh, rõ ràng cho mọi thắc mắc
                của bạn.
              </p>

              <div className="space-y-3 pt-2">
                {POLICY_TOPICS.map((topic) => (
                  <div
                    key={topic.title}
                    className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-3.5 flex items-start gap-3"
                  >
                    <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {topic.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2"
                asChild
              >
                <Link to="/ai-consultant">
                  <Bot className="w-4 h-4" />
                  Mở Trợ lý AI ngay
                </Link>
              </Button>
              <Link
                to="/orders"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
              >
                Theo dõi đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
