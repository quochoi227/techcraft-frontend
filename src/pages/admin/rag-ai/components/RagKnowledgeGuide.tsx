import React from "react"
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Database,
} from "lucide-react"

export const RagKnowledgeGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cẩm nang Chuẩn hóa Tài liệu RAG & Kiến trúc pgvector
            </h2>
            <p className="text-xs text-slate-500">
              Quy chuẩn định dạng tài liệu giúp hệ thống tìm kiếm ngữ nghĩa chính xác nhất
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Hệ thống RAG (Retrieval-Augmented Generation) của TechCraft hoạt động dựa trên việc phân giải các văn bản chính sách thành các đoạn ngữ nghĩa (chunks), mã hóa thành vector 3072 chiều qua mô hình Gemini Embedding (<strong>gemini-embedding-2</strong>) và lưu trữ trong cơ sở dữ liệu PostgreSQL mở rộng với <strong>pgvector</strong>. Khi người dùng đặt câu hỏi, hệ thống sẽ tính toán khoảng cách cosine để trích xuất các thông tin chính xác nhất.
        </p>
      </div>

      {/* Grid: Chuẩn bị tài liệu & Lưu ý */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Do's */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Khuyến nghị tối ưu nội dung (Best Practices)</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Sử dụng tiêu đề rõ ràng:</strong> Phân chia văn bản thành các mục rõ ràng (VD: "Chính sách đổi trả trong 7 ngày", "Quy định bảo hành Mainboard & CPU").
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Trình bày dạng gạch đầu dòng:</strong> Liệt kê cụ thể các mốc thời gian, số ngày, chi phí vận chuyển, các trường hợp được chấp nhận hoặc từ chối.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Bao gồm từ khóa ngữ nghĩa:</strong> Đề cập rõ tên các loại linh kiện (VGA, RAM, SSD, Nguồn PSU, Tản nhiệt AIO, Vỏ Case) để tăng điểm tương đồng cosine.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Ưu tiên file DOCX, Markdown hoặc Text:</strong> Các định dạng văn bản thuần có độ tin cậy trích xuất cao hơn so với tài liệu phức tạp.
              </span>
            </li>
          </ul>
        </div>

        {/* Don'ts */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Những điều cần tránh</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Không tải file PDF scan dạng ảnh:</strong> Bộ phân giải Apache PDFBox chỉ đọc được text vector, không hỗ trợ nhận diện chữ (OCR) trên ảnh chụp scan.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Tránh trùng lặp tiêu đề:</strong> Hệ thống yêu cầu mỗi tài liệu có một tiêu đề duy nhất để tránh xung đột vector index.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Không nạp bảng biểu quá phức tạp:</strong> Các bảng biểu dạng ma trận nhiều cột lồng nhau trong Word có thể bị biến đổi thứ tự dòng khi trích xuất text.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Kích thước không vượt quá 15MB:</strong> Đảm bảo dung lượng file dưới 15MB để tránh quá tải bộ nhớ và timeout khi gọi Gemini Embedding.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* System Technical Architecture Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">
              Thông số Kỹ thuật Hệ Vector TechCraft
            </h3>
            <p className="text-xs text-slate-400">
              Cơ chế phân giải nội dung và lưu trữ ngữ nghĩa trong Backend
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400">Embedding Model</span>
            <div className="text-sm font-bold text-blue-400">gemini-embedding-2</div>
            <p className="text-[11px] text-slate-400">Google Gemini API</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400">Kích thước Vector</span>
            <div className="text-sm font-bold text-indigo-400">3072 Chiều</div>
            <p className="text-[11px] text-slate-400">Float precision vector</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400">Chỉ mục Tìm kiếm</span>
            <div className="text-sm font-bold text-emerald-400">IVFFlat (Cosine)</div>
            <p className="text-[11px] text-slate-400">vector_cosine_ops</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400">Cơ chế Phân loại</span>
            <div className="text-sm font-bold text-amber-400">Intent Classifier</div>
            <p className="text-[11px] text-slate-400">POLICY vs PC_BUILD</p>
          </div>
        </div>
      </div>
    </div>
  )
}
