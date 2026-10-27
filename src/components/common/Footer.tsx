import React from "react"
import { Link } from "react-router-dom"
import { Cpu, MapPin, Phone } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                TechCraft PC
              </span>
            </Link>

            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Hệ thống cung cấp linh kiện máy tính chính hãng, giải pháp Workstation
              và Custom PC hiệu năng cao với sự hỗ trợ của trợ lý ảo AI.
            </p>

            <div className="space-y-2 pt-1 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Hà Nội:</strong> 102 Thái Hà, Đống Đa |{" "}
                  <strong>TP.HCM:</strong> 245 Cống Quỳnh, Q.1
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Hotline:</strong> 1900 8899 (8:00 - 21:30 hàng ngày)
                </span>
              </div>
            </div>
          </div>

          {/* Cột 2: Dịch vụ & Tiện ích */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-bold text-sm text-slate-900 mb-4 tracking-tight">
              Dịch vụ & Tiện ích
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/compatibility-checker"
                  className="hover:text-blue-600 transition-colors"
                >
                  Compatibility Checker
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-diagnostic"
                  className="hover:text-blue-600 transition-colors"
                >
                  AI Diagnostic Tool
                </Link>
              </li>
              <li>
                <Link
                  to="/custom-pc"
                  className="hover:text-blue-600 transition-colors"
                >
                  Custom Rig Builder
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty-lookup"
                  className="hover:text-blue-600 transition-colors"
                >
                  Tra cứu bảo hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách & Hỗ trợ */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-bold text-sm text-slate-900 mb-4 tracking-tight">
              Chính sách & Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/policies/warranty"
                  className="hover:text-blue-600 transition-colors"
                >
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/shipping"
                  className="hover:text-blue-600 transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng copyright & chứng nhận */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 TechCraft PC Inc. High-performance computing crafted with precision. All rights reserved.</p>
          <p className="text-right">
            Chứng nhận đại lý ủy quyền: <span className="text-slate-500 font-medium">Intel, AMD, NVIDIA, ASUS ROG</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
