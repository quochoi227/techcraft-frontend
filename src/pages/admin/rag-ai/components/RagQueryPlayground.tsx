import React, { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  Cpu,
  FileText,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatIntent } from "@/types/chat"
import { chatService } from "@/services/api/chatService"
import { toast } from "sonner"

interface PlaygroundMessage {
  id: string
  role: "user" | "assistant"
  content: string
  policySources?: string[]
  detectedIntent?: ChatIntent
  timestamp: string
}

const SAMPLE_QUERIES = [
  "Chính sách bảo hành linh kiện máy tính của shop như thế nào?",
  "Tôi có thể đổi trả hàng trong vòng bao nhiêu ngày và điều kiện gì?",
  "Shop có hỗ trợ giao hàng COD và kiểm tra hàng trước khi nhận không?",
  "Chính sách hỗ trợ kỹ thuật và bảo hành tận nơi cho bộ PC Case ráp sẵn?",
  "Shop có xuất hóa đơn giá trị gia tăng (VAT) cho doanh nghiệp không?",
]

export const RagQueryPlayground: React.FC = () => {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([])
  const [inputQuery, setInputQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim()
    if (!textToSend || isLoading) return

    const userMessage: PlaygroundMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputQuery("")
    setIsLoading(true)

    try {
      // Chuẩn bị lịch sử hội thoại gửi lên Backend
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await chatService.sendMessage({
        message: textToSend,
        history,
      })

      const chatData = response.data

      const assistantMessage: PlaygroundMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content:
          chatData?.reply ||
          "Không nhận được phản hồi văn bản từ AI. Vui lòng kiểm tra lại dịch vụ Gemini Backend.",
        policySources: chatData?.policySources || [],
        detectedIntent: chatData?.detectedIntent,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Gửi câu hỏi thất bại. Vui lòng kiểm tra kết nối tới Backend."

      const errorReply: PlaygroundMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: `⚠️ **Lỗi thực thi truy vấn RAG:** ${errMsg}`,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages((prev) => [...prev, errorReply])
      toast.error("Không thể kết nối đến máy chủ AI RAG")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Đã sao chép câu trả lời")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearHistory = () => {
    setMessages([])
    toast.info("Đã làm mới phiên kiểm tra RAG")
  }

  const renderIntentBadge = (intent?: ChatIntent) => {
    switch (intent) {
      case "POLICY_INQUIRY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            <span>Tra cứu Chính sách (RAG Active)</span>
          </span>
        )
      case "PC_RECOMMENDATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Cpu className="w-3 h-3" />
            <span>Gợi ý PC Cases</span>
          </span>
        )
      case "HYBRID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Sparkles className="w-3 h-3" />
            <span>Kết hợp Chính sách & PC</span>
          </span>
        )
      case "GENERAL_CHAT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>Chào hỏi & Xã giao</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner giới thiệu Playground */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>pgvector Cosine Similarity Simulator</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Khu vực Thử nghiệm & Kiểm định Truy vấn RAG
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Thực hiện đặt câu hỏi như khách hàng để kiểm tra khả năng trích xuất vector embeddings từ các tài liệu chính sách bạn vừa nạp. Hệ thống sẽ hiển thị tài liệu nguồn (policy sources) được tham chiếu chính xác.
            </p>
          </div>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white shrink-0 self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Làm mới phiên thử nghiệm
            </Button>
          )}
        </div>
      </div>

      {/* Main chat testing box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Sẵn sàng thử nghiệm truy vấn tri thức
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                Nhập câu hỏi bất kỳ liên quan đến chính sách bảo hành, giao hàng, đổi trả để kiểm tra độ chính xác của RAG và vector embeddings.
              </p>

              {/* Sample queries pills */}
              <div className="w-full space-y-2 text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Câu hỏi mẫu gợi ý:
                </span>
                <div className="space-y-1.5">
                  {SAMPLE_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-slate-700 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm space-y-2.5 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-sm"
                    }`}
                  >
                    {/* Header info (Intent & Timestamp) */}
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      {msg.role === "assistant" ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            TechCraft AI Assistant
                          </span>
                          {renderIntentBadge(msg.detectedIntent)}
                        </div>
                      ) : (
                        <span className="font-semibold text-blue-100">
                          Quản trị viên (Tester)
                        </span>
                      )}
                      <span
                        className={
                          msg.role === "user" ? "text-blue-200" : "text-slate-400"
                        }
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Content body */}
                    {msg.role === "user" ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="prose prose-xs max-w-none text-xs text-slate-800 leading-relaxed font-normal">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Policy Sources footer (RAG Citations) */}
                    {msg.policySources && msg.policySources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                          <Database className="w-3 h-3 text-indigo-500" />
                          <span>Tài liệu nguồn được trích xuất (pgvector):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.policySources.map((source, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700 shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-blue-500" />
                              <span>{source}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copy action for assistant response */}
                    {msg.role === "assistant" && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tính toán Cosine Similarity trong pgvector & tổng hợp câu trả lời...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Query Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-end gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi kiểm tra RAG (VD: Chính sách bảo hành RAM và màn hình?)..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-xs text-slate-800 placeholder:text-slate-400 p-1"
            />
            <Button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 px-4 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Truy vấn</span>
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Nhấn Enter để gửi, Shift + Enter để xuống dòng</span>
            <span>API: POST /api/chat (Grounding: RAG + Gemini 1.5/2.0)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
