import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Gamepad2,
  Palette,
  Briefcase,
  HelpCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UiChatMessage, ChatMessage } from "@/types/chat"
import { chatService } from "@/services/api/chatService"
import { AiMessageItem } from "./components/AiMessageItem"
import { ChatSidebar, SUGGESTED_PROMPTS } from "./components/ChatSidebar"
import { toast } from "sonner"

const STORAGE_KEY = "techcraft_ai_chat_history"

export const AiConsultantPage: React.FC = () => {
  const [messages, setMessages] = useState<UiChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fallback nếu JSON parse lỗi
    }
    return []
  })

  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isInitialMount = useRef(true)
  const prevMessagesLength = useRef(messages.length)

  // Lưu lịch sử chat vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Bỏ qua nếu localStorage đầy
    }
  }, [messages])

  // Quản lý cuộn thông minh nội bộ khung chat (KHÔNG cuộn toàn bộ trang/window)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    // Lần đầu vào trang (mount): nếu có sẵn tin nhắn, cuộn ngay xuống đáy khung chat
    // bằng scrollTop (tuyệt đối không dùng scrollIntoView gây cuộn cả trang window)
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (messages.length > 0) {
        container.scrollTop = container.scrollHeight
      }
      return
    }

    const currentLen = messages.length
    const prevLen = prevMessagesLength.current
    prevMessagesLength.current = currentLen

    if (currentLen === 0 || currentLen === prevLen) return

    const lastMsg = messages[currentLen - 1]

    if (lastMsg.role === "user") {
      // Khi người dùng vừa gửi tin nhắn: cuộn xuống cuối để thấy tin nhắn vừa gửi và hiệu ứng chờ AI
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        })
      }, 50)
    } else if (lastMsg.role === "assistant") {
      // Khi AI vừa phản hồi:
      // Cuộn để người dùng nhìn thấy CÂU HỎI của mình và PHẦN ĐẦU câu trả lời của AI
      // Người dùng đọc được ngay từ dòng đầu tiên mà không cần phải cuộn ngược lên!
      setTimeout(() => {
        const userMsg = currentLen >= 2 ? messages[currentLen - 2] : null
        const targetElem =
          (userMsg && document.getElementById(userMsg.id)) ||
          document.getElementById(lastMsg.id)

        if (targetElem) {
          const targetOffset = targetElem.offsetTop - container.offsetTop
          container.scrollTo({
            top: Math.max(0, targetOffset - 16),
            behavior: "smooth",
          })
        } else {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          })
        }
      }, 100)
    }
  }, [messages])

  // Cuộn nhẹ khi trạng thái isLoading kích hoạt
  useEffect(() => {
    if (isLoading && !isInitialMount.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [isLoading])

  // Tự động căn chỉnh chiều cao của ô nhập liệu textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        110
      )}px`
    }
  }, [inputMessage])

  /**
   * Gửi tin nhắn đến API
   */
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputMessage).trim()
    if (!rawText || isLoading) return

    // 1. Tạo tin nhắn người dùng
    const userMsgId = `user_${Date.now()}`
    const userMessage: UiChatMessage = {
      id: userMsgId,
      role: "user",
      content: rawText,
      timestamp: new Date().toISOString(),
      status: "success",
    }

    // 2. Chuẩn bị lịch sử hội thoại cho API (lọc các tin nhắn thành công gần nhất)
    const currentHistory: ChatMessage[] = messages
      .filter((m) => m.status !== "error")
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }))

    // Cập nhật giao diện với tin nhắn của user
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Đóng mobile sidebar nếu đang mở
    setShowMobileSidebar(false)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      // 3. Gọi Backend POST /chat
      const response = await chatService.sendMessage({
        message: rawText,
        history: currentHistory,
      })

      if (response && response.data) {
        const aiResponse = response.data
        const aiMsg: UiChatMessage = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: aiResponse.reply,
          suggestedPcCases: aiResponse.suggestedPcCases || [],
          policySources: aiResponse.policySources || [],
          detectedIntent: aiResponse.detectedIntent,
          timestamp: aiResponse.timestamp || new Date().toISOString(),
          status: "success",
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        throw new Error("Phản hồi từ AI không đúng định dạng mong đợi")
      }
    } catch (err: any) {
      const errorText =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau ít phút!"

      const errorMsg: UiChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "error",
        errorMessage: errorText,
      }
      setMessages((prev) => [...prev, errorMsg])
      toast.error(errorText)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  /**
   * Xử lý phím Enter để gửi, Shift + Enter để xuống hàng
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Thử lại một tin nhắn thất bại
   */
  const handleRetry = (failedMessage: UiChatMessage) => {
    const failedIndex = messages.findIndex((m) => m.id === failedMessage.id)
    if (failedIndex > 0) {
      const priorUserMsg = messages[failedIndex - 1]
      if (priorUserMsg && priorUserMsg.role === "user") {
        setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id))
        handleSendMessage(priorUserMsg.content)
      }
    }
  }

  /**
   * Làm mới / xóa đoạn chat
   */
  const handleClearChat = () => {
    if (messages.length === 0) return
    if (window.confirm("Bạn có chắc chắn muốn làm mới và xóa toàn bộ đoạn trò chuyện hiện tại?")) {
      setMessages([])
      localStorage.removeItem(STORAGE_KEY)
      toast.success("Đã làm mới đoạn trò chuyện!")
    }
  }

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col p-2.5 sm:p-3 lg:p-4 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Compact Top Navigation Bar */}
      <div className="shrink-0 mb-2 sm:mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate flex items-center gap-1.5">
              TechCraft AI Consultant
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h1>
            <nav className="flex items-center gap-1 text-[11px] text-slate-500 truncate -mt-0.5">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-700 truncate">
                Tư vấn cấu hình PC & chính sách shop
              </span>
            </nav>
          </div>
        </div>

        {/* Right Status Badges & Mobile Menu Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Sẵn sàng</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Gemini AI + pgvector RAG</span>
          </div>

          {/* Mobile button to open suggested questions sidebar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden h-7 px-2 text-xs font-semibold border-slate-200 text-slate-700 gap-1 rounded-lg"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Gợi ý</span>
          </Button>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-7 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-1 rounded-lg transition-colors"
              title="Làm mới đoạn chat"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace: Sidebar + Chat Box */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:flex w-72 xl:w-80 shrink-0 h-full overflow-hidden">
          <ChatSidebar
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onClearChat={handleClearChat}
            messageCount={messages.length}
          />
        </div>

        {/* Central Chat Panel (Fills 100% remaining space) */}
        <div className="flex-1 min-h-0 h-full bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
          {/* Top Chat Bar */}
          <div className="shrink-0 px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                Hỏi đáp & Gợi ý cấu hình PC trực tiếp
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Kiểm tra tương thích 100% & RAG tài liệu chính sách
            </span>
          </div>

          {/* Messages Feed Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-slate-50/30 scroll-smooth"
          >
            {messages.length === 0 ? (
              /* Compact Welcome Screen (fits completely on any laptop screen) */
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-2 px-2 space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Xin chào! Tôi có thể giúp gì cho dàn PC của bạn?
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    Chọn một gợi ý dưới đây hoặc nhập ngân sách, nhu cầu để được tư vấn bộ máy tối ưu nhất.
                  </p>
                </div>

                {/* 4 Compact Starter Cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Tư vấn cho mình cấu hình PC chơi game tầm 20 - 25 triệu mượt mà các game hot hiện nay"
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all group flex items-start gap-2.5 cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <Gamepad2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">
                        PC Gaming 20 - 25 Triệu
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Tối ưu FPS cho Black Myth, GTA V, CS2
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Mình cần build một bộ máy phục vụ thiết kế đồ họa 3D, dựng video 4K với ngân sách khoảng 35 triệu"
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all group flex items-start gap-2.5 cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">
                        PC Đồ Họa 3D & Render 4K
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Premiere, Blender, AutoCAD, 3Ds Max
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Gợi ý cấu hình PC học tập, làm việc văn phòng giá rẻ khoảng 8 đến 12 triệu"
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all group flex items-start gap-2.5 cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">
                        PC Học Tập & Văn Phòng
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Chạy êm ái, bền bỉ, tiết kiệm điện năng
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Chính sách bảo hành, đổi trả và giao hàng COD của TechCraft như thế nào?"
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all group flex items-start gap-2.5 cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">
                        Chính Sách Cửa Hàng
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Bảo hành, đổi trả và ship COD tận nơi
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Message List */
              <>
                {messages.map((message) => (
                  <div id={message.id} key={message.id}>
                    <AiMessageItem message={message} onRetry={handleRetry} />
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3 max-w-2xl mr-auto">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md shadow-blue-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-sm flex items-center gap-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                      </div>
                      <span className="font-semibold text-slate-700">
                        TechCraft AI đang phân tích dữ liệu & cấu hình...
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Prompts Carousel Bar (above input) */}
          <div className="shrink-0 px-3.5 py-1.5 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Gợi ý nhanh:
            </span>
            {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                disabled={isLoading}
                onClick={() => handleSendMessage(p.prompt)}
                className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Input Box Area (ALWAYS visible at the bottom without scrolling) */}
          <div className="shrink-0 p-2.5 sm:p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="relative flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập yêu cầu tư vấn cấu hình PC hoặc câu hỏi chính sách... (Enter để gửi, Shift+Enter xuống dòng)"
                rows={1}
                disabled={isLoading}
                className="flex-1 max-h-28 min-h-[40px] py-2 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white resize-none transition-all placeholder:text-slate-400"
              />

              <Button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 shadow-sm transition-all"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1 text-xs">Gửi</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-1 text-center">
              <span className="text-[10px] text-slate-400">
                TechCraft AI tư vấn tự động dựa trên danh mục PC Case có sẵn và tài liệu chính sách của cửa hàng.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Modal/Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-80 max-w-full h-full bg-white shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">
                Gợi ý câu hỏi & Hỗ trợ
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSidebar(false)}
                className="h-7 w-7 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ChatSidebar
                onSelectPrompt={(prompt) => {
                  setShowMobileSidebar(false)
                  handleSendMessage(prompt)
                }}
                onClearChat={() => {
                  setShowMobileSidebar(false)
                  handleClearChat()
                }}
                messageCount={messages.length}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
