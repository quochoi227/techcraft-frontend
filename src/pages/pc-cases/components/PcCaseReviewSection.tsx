import React, { useState } from "react"
import { Star, MessageSquare, CheckCircle2, User, Send, Loader2 } from "lucide-react"
import type { Review } from "@/types/review"
import { reviewService } from "@/services/api/reviewService"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Link } from "react-router-dom"

interface PcCaseReviewSectionProps {
  pcCaseId: string
  pcCaseName: string
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  onReviewAdded?: (newReview: Review) => void
}

export const PcCaseReviewSection: React.FC<PcCaseReviewSectionProps> = ({
  pcCaseId,
  pcCaseName,
  reviews = [],
  averageRating = 5.0,
  totalReviews = 0,
  onReviewAdded,
}) => {
  const { isAuthenticated, user } = useAuthStore()

  // Form State
  const [selectedRating, setSelectedRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Local reviews list state so newly submitted review shows up immediately
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews)

  // Calculate rating distribution
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  localReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)))
    ratingCounts[star] = (ratingCounts[star] || 0) + 1
  })

  const countTotal = localReviews.length || totalReviews || 1

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để viết đánh giá!")
      return
    }

    if (!selectedRating || selectedRating < 1) {
      toast.error("Vui lòng chọn số sao đánh giá (1 - 5 sao)")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await reviewService.createPcCaseReview(pcCaseId, {
        rating: selectedRating,
        comment: comment.trim() || undefined,
      })

      const newReview = response?.data || {
        id: `rev-${Date.now()}`,
        userId: user?.id || "",
        userFullName: user?.fullName || "Khách hàng",
        userEmail: user?.email,
        rating: selectedRating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      }

      setLocalReviews([newReview, ...localReviews])
      setComment("")
      setSelectedRating(5)
      toast.success("Cảm ơn bạn! Đánh giá bộ PC đã được ghi nhận thành công.")
      if (onReviewAdded) onReviewAdded(newReview)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bạn chỉ có thể đánh giá bộ máy tính này sau khi đã đặt mua và nhận hàng thành công."
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Rating Overview Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-center gap-8">
        {/* Score & Stars */}
        <div className="text-center md:text-left shrink-0 md:pr-8 md:border-r border-slate-200 space-y-2">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {averageRating ? averageRating.toFixed(1) : "5.0"}
            <span className="text-xl sm:text-2xl font-bold text-slate-400">/5</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating || 5)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Dựa trên {localReviews.length || totalReviews || 0} lượt trải nghiệm cấu hình
          </p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0
            const percentage = countTotal > 0 ? Math.round((count / countTotal) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-slate-600 flex items-center gap-1">
                  {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-400 font-medium">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Review Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          Viết đánh giá cho cấu hình này
        </h4>

        {!isAuthenticated ? (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 text-center sm:text-left">
              Vui lòng đăng nhập bằng tài khoản đã mua cấu hình máy tính này để gửi đánh giá xác thực.
            </span>
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 font-bold">
              <Link to="/login">Đăng nhập ngay</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chất lượng linh kiện & hiệu năng bộ máy:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || selectedRating) >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  )
                })}
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  {selectedRating === 5 && "Tuyệt vời (5 sao)"}
                  {selectedRating === 4 && "Hài lòng (4 sao)"}
                  {selectedRating === 3 && "Bình thường (3 sao)"}
                  {selectedRating === 2 && "Chưa hài lòng (2 sao)"}
                  {selectedRating === 1 && "Kém (1 sao)"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhận xét thực tế khi sử dụng bộ PC (tùy chọn):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Chia sẻ trải nghiệm chơi game, render, nhiệt độ hoặc dịch vụ lắp ráp của dàn máy "${pcCaseName}"...`}
                rows={3}
                maxLength={500}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Lưu ý: Chỉ tài khoản đã mua bộ PC và đơn hàng ĐÃ GIAO mới đủ điều kiện đánh giá.</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-bold text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang gửi đánh giá...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Gửi nhận xét
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Customer Reviews List */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-slate-900">
          Nhận xét từ khách hàng ({localReviews.length})
        </h4>

        {localReviews.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Chưa có nhận xét nào cho cấu hình này</p>
            <p className="text-xs text-slate-400">
              Hãy là người đầu tiên trải nghiệm và chia sẻ đánh giá về hiệu năng dàn máy này!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {localReviews.map((rev, index) => (
              <div key={rev.id || index} className="py-5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {rev.userFullName ? rev.userFullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {rev.userFullName || "Khách hàng TechCraft"}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã mua PC
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Gần đây"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (rev.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-10">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
