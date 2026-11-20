import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
  Tag,
  ShieldCheck,
  Cpu,
} from "lucide-react"
import type { UiChatMessage, ChatIntent } from "@/types/chat"
import { AiPcCaseCard } from "./AiPcCaseCard"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"

interface AiMessageItemProps {
  message: UiChatMessage
  onRetry?: (failedMessage: UiChatMessage) => void
}

const getIntentBadge = (intent?: ChatIntent) => {
  switch (intent) {
    case "PC_RECOMMENDATION":
      return {
        label: "Gợi ý cấu hình PC",
        icon: Cpu,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      }
    case "POLICY_INQUIRY":
      return {
        label: "Chính sách cửa hàng",
        icon: ShieldCheck,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      }
    case "HYBRID":
      return {
        label: "Tư vấn & Chính sách",
        icon: Sparkles,
        className: "bg-purple-50 text-purple-700 border-purple-200",
      }
    case "GENERAL_CHAT":
      return {
        label: "Hỗ trợ khách hàng",
        icon: Tag,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      }
    default:
      return null
  }
}

export const AiMessageItem: React.FC<AiMessageItemProps> = ({
  message,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false)
  const user = useAuthStore((s) => s.user)

  const isUser = message.role === "user"
  const intentMeta = !isUser ? getIntentBadge(message.detectedIntent) : null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success("Đã sao chép nội dung vào bộ nhớ tạm")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Không thể sao chép nội dung")
    }
  }

  // Format timestamp (e.g. 19:45)
  const formattedTime = (() => {
    try {
      const d = new Date(message.timestamp)
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  })()

  // --------------------------------------------------------------------------
  // USER MESSAGE
  // --------------------------------------------------------------------------
  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-3xl ml-auto group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-sm text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 px-1">
            {formattedTime}
          </span>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
          {user?.fullName ? (
            user.fullName.slice(0, 2).toUpperCase()
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // ASSISTANT (AI) MESSAGE
  // --------------------------------------------------------------------------
  return (
    <div className="flex items-start gap-3 max-w-4xl mr-auto group">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md shadow-blue-500/20">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Header tag */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            TechCraft AI
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>

          {intentMeta && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${intentMeta.className}`}
            >
              <intentMeta.icon className="w-3 h-3" />
              {intentMeta.label}
            </span>
          )}

          {formattedTime && (
            <span className="text-[11px] text-slate-400">{formattedTime}</span>
          )}
        </div>

        {/* Error State */}
        {message.status === "error" ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Không thể nhận phản hồi từ AI</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              {message.errorMessage ||
                "Hệ thống đang gặp sự cố tạm thời khi kết nối đến dịch vụ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại."}
            </p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(message)}
                className="h-8 text-xs font-semibold border-rose-300 text-rose-800 hover:bg-rose-100 gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Thử lại câu hỏi
              </Button>
            )}
          </div>
        ) : (
          /* Main Assistant Message Bubble */
          <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm text-slate-800 space-y-4">
            {/* Markdown Body */}
            <div className="ai-markdown-content text-sm sm:text-[15px] leading-relaxed text-slate-800 space-y-3 break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-slate-900 pb-1 border-b border-slate-100 mt-2 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block" />
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold text-slate-800 mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-1.5 leading-relaxed text-slate-700">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 my-2 text-slate-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 my-2 text-slate-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-900">
                      {children}
                    </strong>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 rounded-lg border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-slate-50 font-bold text-slate-700">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 font-semibold text-slate-800">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-slate-600">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 pl-3.5 py-1.5 my-2 rounded-r-lg italic text-slate-700 text-xs">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-600 font-semibold border border-slate-200">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Suggested PC Cases Grid */}
            {message.suggestedPcCases && message.suggestedPcCases.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Bộ cấu hình PC gợi ý theo yêu cầu ({message.suggestedPcCases.length}):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {message.suggestedPcCases.map((pcCase) => (
                    <AiPcCaseCard key={pcCase.id} pcCase={pcCase} />
                  ))}
                </div>
              </div>
            )}

            {/* Policy Citations / Sources */}
            {message.policySources && message.policySources.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Nguồn chính sách đối chiếu:
                </span>
                {message.policySources.map((source, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}

            {/* Message Action Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100/80 text-xs text-slate-400">
              <span className="text-[11px]">
                Phản hồi tạo bởi AI dựa trên dữ liệu TechCraft
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 gap-1 rounded-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
