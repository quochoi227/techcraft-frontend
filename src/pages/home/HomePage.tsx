import React from "react"
import { Link } from "react-router-dom"
import { Cpu, Bot, ArrowRight, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export const HomePage: React.FC = () => {
  return (
    <div className="flex-1">
      {/* Hero Section Banner */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            Trợ lý AI build PC thông minh đầu tiên tại Việt Nam
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Xây dựng dàn PC hoàn hảo với{" "}
            <span className="text-blue-600">Trợ lý AI TechCraft</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Hệ thống cung cấp linh kiện máy tính chính hãng 100%, tư vấn cấu hình
            theo ngân sách và nhu cầu với thuật toán kiểm tra tương thích tự động.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-md"
              asChild
            >
              <Link to="/register">
                Tạo tài khoản ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/products">Khám phá linh kiện</Link>
            </Button>
          </div>

          {/* Quick highlight features */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Kiểm tra tương thích 100%
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động rà soát socket CPU, kích thước GPU, nguồn PSU và case.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Gợi ý cấu hình tối ưu AI
                </h3>
                <p className="text-xs text-slate-500">
                  Lựa chọn bộ máy phù hợp nhất theo ngân sách và công việc của bạn.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Chính hãng & Đổi mới 30 ngày
                </h3>
                <p className="text-xs text-slate-500">
                  Bảo hành điện tử, hỗ trợ kỹ thuật và đổi mới tức thì linh kiện lỗi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
