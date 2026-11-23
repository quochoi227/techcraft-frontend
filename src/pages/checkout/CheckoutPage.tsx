import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  MapPin,
  User as UserIcon,
  Phone,
  FileText,
  ArrowLeft,
  Loader2,
  Box,
  Cpu,
  ChevronRight,
  Home,
  Check,
  Copy,
  Banknote,
  QrCode,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Ticket,
  Tag,
  X,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useCheckoutStore } from "@/stores/checkoutStore"
import { useCartStore } from "@/stores/cartStore"
import { orderService } from "@/services/api/orderService"
import { paymentService } from "@/services/api/paymentService"
import { voucherService } from "@/services/api/voucherService"
import { formatPrice, CATEGORIES_META } from "@/pages/products/constants"
import { getPcCaseThumbnail } from "@/pages/pc-cases/constants"
import type { Order, CreateOrderPayload, PaymentMethod, PaymentInfo } from "@/types/order"
import type { Voucher, ValidateVoucherResponse } from "@/types/voucher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()
  const {
    items,
    getTotalAmount,
    getTotalCount,
    clearCheckout,
  } = useCheckoutStore()

  // Form Fields State
  const [fullName, setFullName] = useState<string>(user?.fullName || "")
  const [phone, setPhone] = useState<string>(user?.phone || "")
  const [shippingAddress, setShippingAddress] = useState<string>(user?.address || "")
  const [note, setNote] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD")

  // SePay Payment States
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Voucher States
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>("")
  const [appliedVoucher, setAppliedVoucher] = useState<ValidateVoucherResponse | null>(null)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState<boolean>(false)
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false)
  const [isLoadingAvailableVouchers, setIsLoadingAvailableVouchers] = useState<boolean>(false)

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false)

  // Redirect if not authenticated (with preservation of checkout state)
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiến hành đặt hàng!")
      navigate("/login?redirect=/checkout", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Fill in user profile defaults when available
  useEffect(() => {
    if (user) {
      if (!fullName && user.fullName) setFullName(user.fullName)
      if (!phone && user.phone) setPhone(user.phone)
      if (!shippingAddress && user.address) setShippingAddress(user.address)
    }
  }, [user, fullName, phone, shippingAddress])

  // Fetch available vouchers
  useEffect(() => {
    if (!isAuthenticated) return

    const loadAvailableVouchers = async () => {
      setIsLoadingAvailableVouchers(true)
      try {
        const res = await voucherService.getAvailableVouchers()
        const data = res?.data || (res as any)
        if (Array.isArray(data)) {
          setAvailableVouchers(data)
        }
      } catch (err) {
        console.warn("Không thể tải danh sách voucher khả dụng:", err)
      } finally {
        setIsLoadingAvailableVouchers(false)
      }
    }

    loadAvailableVouchers()
  }, [isAuthenticated])

  const totalAmount = getTotalAmount()
  const totalCount = getTotalCount()

  // Discount and Final calculations
  const discountAmount = appliedVoucher?.discountAmount || 0
  const finalAmount = Math.max(0, totalAmount - discountAmount)

  // Re-validate applied voucher if cart totalAmount changes
  useEffect(() => {
    if (!appliedVoucher || totalAmount <= 0) return

    const revalidate = async () => {
      try {
        const res = await voucherService.validateVoucher({
          code: appliedVoucher.code || "",
          orderAmount: totalAmount,
        })
        const valData = res?.data || (res as any)
        if (valData && valData.valid) {
          setAppliedVoucher(valData)
        } else {
          toast.warning(
            valData?.message ||
              "Giá trị đơn hàng thay đổi khiến voucher không còn đủ điều kiện áp dụng."
          )
          setAppliedVoucher(null)
        }
      } catch {
        // Giữ nguyên nếu lỗi mạng tạm thời
      }
    }

    revalidate()
  }, [totalAmount])

  // Apply Voucher handler
  const handleApplyVoucherCode = async (codeToApply?: string) => {
    const targetCode = (codeToApply || voucherCodeInput).trim().toUpperCase()
    if (!targetCode) {
      toast.error("Vui lòng nhập mã giảm giá!")
      return
    }

    if (totalAmount <= 0) {
      toast.error("Đơn hàng chưa có giá trị để áp dụng voucher!")
      return
    }

    setIsValidatingVoucher(true)
    try {
      const res = await voucherService.validateVoucher({
        code: targetCode,
        orderAmount: totalAmount,
      })
      const data = res?.data || (res as any)

      if (data && data.valid) {
        setAppliedVoucher(data)
        setVoucherCodeInput(targetCode)
        setIsVoucherModalOpen(false)
        toast.success(
          data.message || `Đã áp dụng mã ${targetCode} thành công! -${formatPrice(data.discountAmount)}`
        )
      } else {
        toast.error(data?.message || "Mã giảm giá không hợp lệ hoặc không đủ điều kiện!")
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Không thể áp dụng mã giảm giá"
      toast.error(msg)
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  // Remove Applied Voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCodeInput("")
    toast.info("Đã hủy áp dụng mã giảm giá")
  }

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId)
    setCopiedOrderId(true)
    toast.success("Đã sao chép mã đơn hàng!")
    setTimeout(() => setCopiedOrderId(false), 2000)
  }

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${fieldName}!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Tự động kiểm tra trạng thái thanh toán SePay mỗi 3 giây
  useEffect(() => {
    if (!createdOrder || createdOrder.paymentMethod !== "SEPAY" || createdOrder.paymentStatus === "PAID") {
      return
    }

    // Tải thông tin thanh toán VietQR nếu chưa có
    paymentService.getPaymentInfo(createdOrder.id)
      .then((res) => {
        const data = res?.data || (res as any)
        if (data) setPaymentInfo(data)
      })
      .catch((err) => {
        console.warn("Không thể tải chi tiết thanh toán:", err)
      })

    const interval = setInterval(async () => {
      try {
        const res = await paymentService.getPaymentStatus(createdOrder.id)
        const data = (res?.data || res) as any
        if (data?.paymentStatus === "PAID") {
          setCreatedOrder((prev) =>
            prev ? { ...prev, paymentStatus: "PAID", status: "CONFIRMED" } : null
          )
          toast.success("Thanh toán thành công qua SePay! Đơn hàng của bạn đã được xác nhận tự động.")
          clearInterval(interval)
        }
      } catch {
        // ignore polling errors
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [createdOrder])

  const handleCheckPaymentStatus = async () => {
    if (!createdOrder) return
    setIsCheckingPayment(true)
    try {
      const res = await paymentService.getPaymentStatus(createdOrder.id)
      const data = (res?.data || res) as any
      if (data?.paymentStatus === "PAID") {
        setCreatedOrder((prev) =>
          prev ? { ...prev, paymentStatus: "PAID", status: "CONFIRMED" } : null
        )
        toast.success("Thanh toán thành công qua SePay! Đơn hàng đã được xác nhận.")
      } else {
        toast.info("Hệ thống chưa ghi nhận thanh toán. Nếu bạn vừa chuyển tiền, vui lòng đợi 3-5 giây để SePay bắn webhook.")
      }
    } catch {
      toast.error("Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau ít phút!")
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error("Không có sản phẩm nào trong đơn đặt hàng!")
      return
    }

    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên người nhận hàng")
      return
    }

    const cleanPhone = phone.trim()
    if (!cleanPhone) {
      toast.error("Vui lòng nhập số điện thoại nhận hàng")
      return
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Số điện thoại nhận hàng chưa đúng định dạng (VD: 0912345678)")
      return
    }

    if (!shippingAddress.trim()) {
      toast.error("Vui lòng cung cấp địa chỉ giao hàng cụ thể")
      return
    }

    setIsSubmitting(true)

    try {
      // Build order payload matching backend expectations
      const payload: CreateOrderPayload = {
        shippingAddress: `${shippingAddress.trim()} (Người nhận: ${fullName.trim()}, SĐT: ${cleanPhone})`,
        paymentMethod,
        note: note.trim() || undefined,
        voucherCode: appliedVoucher?.code || undefined,
        items: items.map((item) => ({
          productId: item.productId || (item.itemType === "PRODUCT" ? item.product?.id : undefined),
          pcCaseId: item.pcCaseId || (item.itemType === "PC_CASE" ? item.pcCase?.id : undefined),
          quantity: item.quantity,
        })),
      }

      const response = await orderService.createOrder(payload)
      const orderData = (response?.data || response) as Order

      // Synchronize cart with backend (backend automatically removed ordered items from cart_items)
      await fetchCart().catch(() => {})

      // Clear checkout store
      clearCheckout()

      // Show success screen
      setCreatedOrder(orderData)
      window.scrollTo({ top: 0, behavior: "smooth" })
      toast.success("Tạo đơn hàng thành công! TechCraft sẽ sớm liên hệ xác nhận.")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể hoàn tất đặt hàng. Vui lòng thử lại!"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------------------------------
  // 1. ORDER SUCCESS CONFIRMATION VIEW
  // -----------------------------------------------------------------
  if (createdOrder) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* Success Banner Card */}
          <div className="bg-white rounded-3xl border border-emerald-200/80 p-8 sm:p-10 text-center shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-50 rounded-full blur-2xl pointer-events-none" />

            <div className="relative w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" /> Đặt hàng thành công!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Cảm ơn bạn đã tin tưởng TechCraft!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Đơn hàng của bạn đã được ghi nhận trên hệ thống. Nhân viên tư vấn của TechCraft
                sẽ liên hệ với bạn qua số điện thoại để xác nhận đơn hàng trước khi gửi.
              </p>
            </div>

            {/* Order Code Pill */}
            <div className="inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700">
              <span className="text-slate-400">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-blue-600 tracking-wider">
                #{String(createdOrder.id).slice(0, 8).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => handleCopyOrderId(String(createdOrder.id))}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                title="Sao chép toàn bộ mã đơn hàng"
              >
                {copiedOrderId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* SEPAY PAYMENT BANNER OR VIETQR PAYMENT CARD */}
          {createdOrder.paymentMethod === "SEPAY" && (
            <>
              {createdOrder.paymentStatus === "PAID" ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-900">
                    Đã nhận thanh toán qua SePay thành công!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                    Hệ thống đã tự động ghi nhận khoản thanh toán {formatPrice(createdOrder.totalAmount)}. Đơn hàng đang được TechCraft chuẩn bị để đóng gói và gửi tới bạn.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Chờ quét mã VietQR
                        </span>
                        <span className="text-xs text-slate-400">Xác nhận tự động trong 3 giây</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Chuyển khoản thanh toán đơn hàng (SePay Sandbox)
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCheckingPayment}
                      onClick={handleCheckPaymentStatus}
                      className="gap-2 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 self-start sm:self-center"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayment ? "animate-spin" : ""}`} />
                      <span>{isCheckingPayment ? "Đang kiểm tra..." : "Tôi đã chuyển tiền"}</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left: VietQR Image */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="relative bg-white p-3 rounded-xl shadow-xs border border-slate-200">
                        <img
                          src={
                            paymentInfo?.qrCodeUrl ||
                            createdOrder.paymentQrUrl ||
                            `https://qr.sepay.vn/img?bank=Vietcombank&acc=0000000001&template=compact&amount=${createdOrder.totalAmount}&des=${createdOrder.orderCode || String(createdOrder.id).slice(0, 8).toUpperCase()}`
                          }
                          alt="Mã VietQR thanh toán SePay"
                          className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg"
                        />
                      </div>
                      <p className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                        Mở app ngân hàng quét mã QR hoặc chuyển khoản thủ công
                      </p>
                    </div>

                    {/* Right: Bank Details with Copy */}
                    <div className="md:col-span-7 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-500 font-medium">Ngân hàng thụ hưởng:</span>
                        <span className="font-bold text-slate-800">
                          {paymentInfo?.bankName || "Vietcombank"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-slate-500 font-medium block">Số tài khoản:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                            {paymentInfo?.accountNumber || "0000000001"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(paymentInfo?.accountNumber || "0000000001", "Số tài khoản")}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                        >
                          {copiedField === "Số tài khoản" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Sao chép</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {paymentInfo?.accountName || "TECHCRAFT"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                        <div>
                          <span className="text-slate-500 font-medium block">Số tiền thanh toán:</span>
                          <span className="font-black text-emerald-600 text-base sm:text-lg">
                            {formatPrice(createdOrder.totalAmount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(String(createdOrder.totalAmount), "Số tiền")}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs transition"
                        >
                          {copiedField === "Số tiền" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Sao chép</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-900 font-bold block">Nội dung chuyển khoản (bắt buộc):</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                paymentInfo?.transferContent || createdOrder.orderCode || String(createdOrder.id).slice(0, 8).toUpperCase(),
                                "Nội dung chuyển khoản"
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition"
                          >
                            {copiedField === "Nội dung chuyển khoản" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Sao chép</span>
                          </button>
                        </div>
                        <p className="font-mono font-black text-blue-700 text-sm sm:text-base tracking-wider bg-white p-2 rounded-lg border border-amber-200 text-center select-all">
                          {paymentInfo?.transferContent || createdOrder.orderCode || String(createdOrder.id).slice(0, 8).toUpperCase()}
                        </p>
                        <div className="flex items-start gap-1.5 text-[11px] text-amber-800 pt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            Vui lòng nhập <strong>chính xác</strong> nội dung chuyển khoản trên để hệ thống ghi nhận tự động.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Order Details Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Thông tin giao hàng & thanh toán</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  createdOrder.paymentStatus === "PAID"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {createdOrder.paymentStatus === "PAID" ? "Đã thanh toán (CONFIRMED)" : "Chờ xác nhận (PENDING)"}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Người nhận hàng:</span>
                <p className="font-bold text-slate-800">
                  {fullName} ({phone.trim()})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Phương thức thanh toán:</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  {createdOrder.paymentMethod === "SEPAY" ? (
                    <>
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Chuyển khoản VietQR (SePay)</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          createdOrder.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {createdOrder.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </>
                  )}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-400 font-medium">Địa chỉ nhận hàng:</span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {createdOrder.shippingAddress || shippingAddress}
                </p>
              </div>

              {createdOrder.note && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-slate-400 font-medium">Ghi chú giao hàng:</span>
                  <p className="font-medium text-slate-700 italic">
                    "{createdOrder.note}"
                  </p>
                </div>
              )}
            </div>

            {/* Items summary */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                Chi tiết sản phẩm ({createdOrder.items?.length || totalCount} món)
              </h3>
              <div className="divide-y divide-slate-100">
                {(createdOrder.items || []).map((item, idx) => {
                  const isPcCase = item.itemType === "PC_CASE"
                  const title = isPcCase
                    ? item.pcCaseName || item.pcCase?.name
                    : item.productName || item.product?.name || "Linh kiện"
                  const unitPrice = item.unitPrice || 0
                  const qty = item.quantity || 1

                  return (
                    <div
                      key={item.id || idx}
                      className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                          {isPcCase ? (
                            <Cpu className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Box className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{title}</p>
                          <p className="text-xs text-slate-400">
                            Số lượng: {qty} × {formatPrice(unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="font-black text-slate-900 shrink-0">
                        {formatPrice(unitPrice * qty)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price Breakdown in Confirmation */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-bold text-slate-800">
                    {formatPrice(createdOrder.subtotalAmount || totalAmount)}
                  </span>
                </div>

                {createdOrder.discountAmount !== undefined && createdOrder.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>
                        Giảm giá voucher ({createdOrder.voucherCode || "Ưu đãi"}):
                      </span>
                    </span>
                    <span className="font-bold">
                      -{formatPrice(createdOrder.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-emerald-600">Miễn phí 100%</span>
                </div>

                {/* Final Total */}
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-base">
                  <span className="font-bold text-slate-700">Tổng thanh toán:</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-600">
                    {formatPrice(createdOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm"
              asChild
            >
              <Link to="/orders">
                <Box className="w-4 h-4" />
                <span>Xem lịch sử đơn hàng</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold gap-2"
              asChild
            >
              <Link to="/products">
                <Box className="w-4 h-4" />
                <span>Tiếp tục mua sắm</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold gap-2 px-4"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------
  // 2. EMPTY CHECKOUT STATE
  // -----------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-[75vh] flex items-center justify-center py-16 px-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-xs space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Box className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chưa có sản phẩm để đặt hàng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn chưa chọn món hàng nào để thanh toán. Hãy chọn sản phẩm từ giỏ hàng
              hoặc nhấn "Mua ngay" trên trang linh kiện hay PC Case bạn mong muốn!
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm"
              asChild
            >
              <Link to="/cart">
                <span>Xem giỏ hàng của bạn</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold gap-2"
              asChild
            >
              <Link to="/products">
                <span>Khám phá linh kiện máy tính</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------
  // 3. MAIN CHECKOUT FORM & REVIEW
  // -----------------------------------------------------------------
  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-16">
      {/* Header Banner & Breadcrumbs */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-transparent border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link
              to="/cart"
              className="hover:text-blue-600 transition-colors"
            >
              <span>Giỏ hàng</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Đặt hàng & Thanh toán</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Xác nhận đơn hàng & Thanh toán
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Vui lòng kiểm tra lại thông tin nhận hàng, áp dụng voucher và danh sách sản phẩm trước khi hoàn tất đặt hàng.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Giao dịch an toàn & bảo mật 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleConfirmOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ------------------------------------------------------- */}
            {/* Left Column: Delivery Form & Payment Method (7 cols)    */}
            {/* ------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Recipient Information Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      1. Thông tin giao nhận hàng
                    </h2>
                    <p className="text-xs text-slate-400">
                      Đơn hàng sẽ được nhân viên giao tận nơi theo địa chỉ này
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Họ và tên người nhận <span className="text-rose-500">*</span></span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Số điện thoại nhận hàng <span className="text-rose-500">*</span></span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ví dụ: 0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  {/* Shipping Address */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="shippingAddress" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span></span>
                    </Label>
                    <Input
                      id="shippingAddress"
                      type="text"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  {/* Note */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="note" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ghi chú đơn hàng (Tùy chọn)</span>
                    </Label>
                    <textarea
                      id="note"
                      rows={2}
                      placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao 15 phút..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Service Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      2. Hình thức vận chuyển
                    </h2>
                    <p className="text-xs text-slate-400">
                      Đối tác vận chuyển chuyên nghiệp bảo hiểm linh kiện 100%
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>Giao hàng tiêu chuẩn toàn quốc</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Miễn phí 100%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Thời gian giao hàng dự kiến: 2 - 4 ngày làm việc. Đóng gói chuyên dụng chống sốc.
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 shrink-0">0 ₫</span>
                </div>
              </div>

              {/* 3. Payment Method Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      3. Phương thức thanh toán
                    </h2>
                    <p className="text-xs text-slate-400">
                      Thanh toán an toàn, kiểm tra hàng thoải mái trước khi trả tiền
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === "COD"
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Khuyên dùng
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Bạn chỉ cần thanh toán tiền mặt cho shipper sau khi đã kiểm tra kiện hàng đầy đủ.
                          </p>
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-blue-600 shrink-0" />
                    </div>
                  </label>

                  {/* SEPAY VIETQR */}
                  <label
                    className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === "SEPAY"
                        ? "border-emerald-600 bg-emerald-50/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="SEPAY"
                          checked={paymentMethod === "SEPAY"}
                          onChange={() => setPaymentMethod("SEPAY")}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>Chuyển khoản VietQR tự động (SePay)</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Tự động 24/7
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Quét mã QR bằng mọi ứng dụng ngân hàng (Vietcombank, MB, Techcombank,...). Hệ thống tự động xác nhận đơn ngay khi giao dịch thành công.
                          </p>
                        </div>
                      </div>
                      <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                    </div>
                  </label>
                </div>
              </div>

              {/* Back to Cart link */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <Link to="/cart">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại giỏ hàng</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* Right Column: Order Items, Voucher & Summary (5 cols)   */}
            {/* ------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-base text-slate-900">
                    Đơn hàng ({totalCount} món)
                  </h2>
                  <span className="text-xs font-bold text-blue-600">
                    {items.length} mặt hàng
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1 space-y-3">
                  {items.map((item, index) => {
                    const isPcCase = item.itemType === "PC_CASE"
                    const categoryMeta =
                      !isPcCase && item.category ? CATEGORIES_META[item.category] : null
                    const CategoryIcon = categoryMeta?.icon

                    const displayImage = isPcCase
                      ? getPcCaseThumbnail(item.pcCase)
                      : item.productImage ||
                        item.product?.images?.[0]?.imageUrl ||
                        PLACEHOLDER_IMAGE

                    return (
                      <div key={item.id || index} className="pt-3 first:pt-0 flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={displayImage}
                            alt={isPcCase ? item.pcCaseName : item.productName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                            }}
                          />
                          {isPcCase && (
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-extrabold bg-purple-600 text-white px-1 rounded">
                              PC
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPcCase ? (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                Cấu hình PC • {item.useCase || "Đa năng"}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                  categoryMeta?.badgeClass ||
                                  "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                {CategoryIcon && <CategoryIcon className="w-2.5 h-2.5 inline mr-1" />}
                                {categoryMeta?.shortLabel || item.category || "Linh kiện"}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-xs text-slate-900 leading-snug truncate">
                            {isPcCase ? item.pcCaseName : item.productName}
                          </h3>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">
                              SL: <strong className="text-slate-800">{item.quantity}</strong> × {formatPrice(item.unitPrice)}
                            </span>
                            <span className="font-black text-slate-900">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* --------------------------------------------------- */}
                {/* Voucher Section                                     */}
                {/* --------------------------------------------------- */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mã giảm giá (Voucher)</span>
                    </Label>

                    {availableVouchers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Chọn voucher ({availableVouchers.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Applied Voucher Card */}
                  {appliedVoucher ? (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-emerald-800">
                              {appliedVoucher.code}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-white/70 px-1.5 py-0.2 rounded border border-emerald-200">
                              -{formatPrice(appliedVoucher.discountAmount)}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 truncate">
                            {appliedVoucher.name || "Áp dụng thành công"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="Gỡ mã giảm giá"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Voucher Input Box */
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Nhập mã ưu đãi (VD: TECH50K)"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleApplyVoucherCode()
                          }
                        }}
                        className="h-10 text-xs font-mono font-semibold uppercase rounded-xl border-slate-200"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isValidatingVoucher || !voucherCodeInput.trim()}
                        onClick={() => handleApplyVoucherCode()}
                        className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 gap-1.5 shadow-2xs"
                      >
                        {isValidatingVoucher ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Áp dụng</span>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 animate-in fade-in">
                      <span className="flex items-center gap-1 font-semibold">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Giảm giá voucher ({appliedVoucher?.code}):</span>
                      </span>
                      <span className="font-bold">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-600">Miễn phí 100%</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Hỗ trợ lắp ráp & kiểm tra:</span>
                    <span className="font-bold text-emerald-600">Miễn phí</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Tổng thanh toán:</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        (Đã bao gồm VAT & áp dụng voucher)
                      </div>
                    </div>
                    <div className="text-2xl font-black text-blue-600 tracking-tight">
                      {formatPrice(finalAmount)}
                    </div>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all h-12 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Xác nhận đặt hàng</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Trust Services Guarantees */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Bảo hành chính hãng 100% linh kiện</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Giao hàng nhanh toàn quốc có bảo hiểm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Đổi mới trong 30 ngày nếu phát sinh lỗi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Available Vouchers Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Mã giảm giá dành cho bạn
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Chọn voucher phù hợp để tiết kiệm tối đa cho đơn hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-5 space-y-3 flex-1">
              {isLoadingAvailableVouchers ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Đang tải các ưu đãi...</span>
                </div>
              ) : availableVouchers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Hiện chưa có mã giảm giá công khai nào khả dụng.
                </div>
              ) : (
                availableVouchers.map((v) => {
                  const isEligible = !v.minOrderAmount || totalAmount >= v.minOrderAmount
                  const isCurrentApplied = appliedVoucher?.code === v.code

                  const discountText =
                    v.discountType === "PERCENTAGE"
                      ? `Giảm ${v.discountValue}%${
                          v.maxDiscountAmount ? ` (Tối đa ${formatPrice(v.maxDiscountAmount)})` : ""
                        }`
                      : `Giảm ${formatPrice(v.discountValue)}`

                  const formattedEnd = v.endDate
                    ? new Date(v.endDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""

                  return (
                    <div
                      key={v.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentApplied
                          ? "border-emerald-500 bg-emerald-50/40"
                          : isEligible
                          ? "border-slate-200 hover:border-blue-300 bg-white"
                          : "border-slate-100 bg-slate-50/60 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {v.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {discountText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{v.name}</p>
                          <div className="text-[11px] text-slate-400 space-x-2">
                            <span>
                              Đơn tối thiểu:{" "}
                              <strong>{formatPrice(v.minOrderAmount || 0)}</strong>
                            </span>
                            {formattedEnd && <span>• HSD: {formattedEnd}</span>}
                          </div>
                        </div>

                        <div>
                          {isCurrentApplied ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleRemoveVoucher}
                              className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              Gỡ bỏ
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={!isEligible || isValidatingVoucher}
                              onClick={() => handleApplyVoucherCode(v.code)}
                              className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                            >
                              {isEligible ? "Áp dụng" : "Chưa đủ ĐK"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-xs font-semibold"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
