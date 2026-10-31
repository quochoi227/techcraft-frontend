import React, { useState } from "react"
import { Star, MessageSquare, ShieldCheck, CheckCircle2, User, Send, Loader2 } from "lucide-react"
import type { Review } from "@/types/review"
import { reviewService } from "@/services/api/reviewService"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Link } from "react-router-dom"

interface ProductReviewSectionProps {
  productId: string
  productName: string
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  onReviewAdded?: (newReview: Review) => void
}

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  productName,
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
      const response = await reviewService.createProductReview(productId, {
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
      toast.success("Cảm ơn bạn! Đánh giá đã được ghi nhận thành công.")
      if (onReviewAdded) onReviewAdded(newReview)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bạn chỉ có thể đánh giá linh kiện sau khi đã mua và nhận hàng thành công."
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

          <p className="text-xs font-semibold text-slate-500">
            Dựa trên {localReviews.length || totalReviews || 0} lượt đánh giá thực tế
          </p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0
            const percent = countTotal > 0 ? Math.round((count / countTotal) * 100) : 0

            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-10 text-right font-medium text-slate-500">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Write Review Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Viết nhận xét cho sản phẩm này</span>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Rating Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                1. Đánh giá chất lượng sản phẩm:
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || selectedRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-600">
                  {hoverRating || selectedRating} sao
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                2. Nội dung nhận xét, cảm nhận của bạn:
              </label>
              <textarea
                rows={3}
                placeholder={`Chia sẻ cảm nhận về hiệu năng, nhiệt độ, khả năng tương thích của "${productName}"...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Đánh giá chỉ hiển thị với đơn hàng đã giao thành công.
              </span>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi nhận xét</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Vui lòng <strong>đăng nhập</strong> tài khoản để có thể viết đánh giá cho sản phẩm bạn đã mua.
            </span>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0">
              <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                Đăng nhập ngay
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 3. List of Reviews */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <span>Nhận xét từ khách hàng</span>
          <span className="text-xs font-semibold text-slate-400">
            ({localReviews.length})
          </span>
        </h3>

        {localReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <p className="text-xs sm:text-sm text-slate-500">
              Chưa có nhận xét nào cho linh kiện này. Hãy là người đầu tiên trải nghiệm và chia sẻ đánh giá!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {rev.userFullName ? rev.userFullName.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {rev.userFullName || rev.userEmail || "Khách hàng TechCraft"}
                      </div>
                      <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Đã mua hàng tại TechCraft
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-amber-400 justify-end">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                    </span>
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
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
