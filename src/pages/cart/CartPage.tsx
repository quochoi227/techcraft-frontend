import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronRight,
  Home,
  Loader2,
  Cpu,
  Layers,
  Box,
  CheckSquare,
} from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { useAuthStore } from "@/stores/authStore"
import { useCheckoutStore } from "@/stores/checkoutStore"
import type { CartItem } from "@/types/cart"
import type { CheckoutItem } from "@/types/order"
import { CATEGORIES_META, formatPrice } from "@/pages/products/constants"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const setCheckoutItems = useCheckoutStore((state) => state.setCheckoutItems)
  const {
    items,
    isLoading,
    isSyncing,
    fetchCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    getTotalCount,
  } = useCartStore()

  // Track which items are currently being updated/deleted to show smooth per-item spinner
  const [busyItemIds, setBusyItemIds] = useState<Record<string, boolean>>({})
  // Track expanded PC Case components accordions
  const [expandedPcCases, setExpandedPcCases] = useState<Record<string, boolean>>({})
  // Selection state for cart items
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [hasInitializedSelection, setHasInitializedSelection] = useState<boolean>(false)

  // Fetch latest cart from backend on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  // Auto-select all in-stock items when items first load or become available
  useEffect(() => {
    if (items.length > 0 && !hasInitializedSelection) {
      const inStockIds = items
        .filter((item) => (item.stockQuantity ?? 0) > 0)
        .map((item) => item.id)
      setSelectedItemIds(inStockIds)
      setHasInitializedSelection(true)
    }
  }, [items, hasInitializedSelection])

  // Clean up selected items that no longer exist in cart
  useEffect(() => {
    const existingIds = new Set(items.map((i) => i.id))
    setSelectedItemIds((prev) => prev.filter((id) => existingIds.has(id)))
  }, [items])

  const totalCount = getTotalCount()

  // Items with available stock
  const inStockItems = items.filter((item) => (item.stockQuantity ?? 0) > 0)
  const isAllSelected =
    inStockItems.length > 0 &&
    inStockItems.every((item) => selectedItemIds.includes(item.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(inStockItems.map((item) => item.id))
    }
  }

  const toggleSelectItem = (itemId: string, inStock: boolean) => {
    if (!inStock) return
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Selected items calculation
  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id))
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const selectedAmount = selectedItems.reduce(
    (sum, item) => sum + (item.subtotal || item.unitPrice * item.quantity),
    0
  )

  const handleUpdateQuantity = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return
    const maxStock = item.stockQuantity || 999
    if (newQty > maxStock) {
      toast.error(`Số lượng tồn kho tối đa có sẵn là ${maxStock}`)
      return
    }

    setBusyItemIds((prev) => ({ ...prev, [item.id]: true }))
    try {
      await updateItemQuantity(item, newQty)
      toast.success("Đã cập nhật số lượng", { duration: 1500 })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể cập nhật số lượng"
      toast.error(msg)
    } finally {
      setBusyItemIds((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  const handleRemoveItem = async (item: CartItem) => {
    setBusyItemIds((prev) => ({ ...prev, [item.id]: true }))
    try {
      const itemName = item.itemType === "PC_CASE" ? item.pcCaseName : item.productName
      await removeItem(item)
      toast.success(`Đã xóa "${itemName || "sản phẩm"}" khỏi giỏ hàng`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể xóa sản phẩm"
      toast.error(msg)
    } finally {
      setBusyItemIds((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn làm sạch toàn bộ giỏ hàng?")) return
    try {
      await clearCart()
      setSelectedItemIds([])
      toast.success("Đã làm sạch toàn bộ giỏ hàng")
    } catch (err: any) {
      toast.error("Không thể xóa toàn bộ giỏ hàng")
    }
  }

  const togglePcCaseDetails = (itemId: string) => {
    setExpandedPcCases((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để tiến hành đặt hàng!")
      return
    }

    const checkoutItems: CheckoutItem[] = selectedItems.map((item) => {
      const isPcCase = item.itemType === "PC_CASE"
      const displayImage = isPcCase
        ? "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"
        : item.productImage || item.product?.images?.[0]?.imageUrl || PLACEHOLDER_IMAGE

      return {
        id: item.id,
        itemType: item.itemType,
        productId: item.productId || item.product?.id,
        productName: item.productName || item.product?.name,
        productPrice: item.productPrice || item.product?.price,
        productImage: displayImage,
        category: item.category || item.product?.category,
        product: item.product,
        pcCaseId: item.pcCaseId || item.pcCase?.id,
        pcCaseName: item.pcCaseName || item.pcCase?.name,
        useCase: item.useCase || item.pcCase?.useCase,
        pcCase: item.pcCase,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        stockQuantity: item.stockQuantity,
      }
    })

    setCheckoutItems(checkoutItems)

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiến hành đặt hàng!")
      navigate("/login?redirect=/checkout")
      return
    }

    navigate("/checkout")
  }

  // -----------------------------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------------------------
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex-1 min-h-[75vh] flex items-center justify-center py-16 px-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-xs space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingCart className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn chưa có linh kiện hoặc bộ PC nào trong giỏ hàng. Hãy khám phá
              ngay các linh kiện chính hãng hoặc nhờ AI gợi ý dàn máy phù hợp nhất!
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm"
              asChild
            >
              <Link to="/products">
                <Box className="w-4 h-4" />
                <span>Khám phá linh kiện máy tính</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50/80 font-bold gap-2"
              asChild
            >
              <Link to="/ai-consultant">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Nhờ AI gợi ý cấu hình PC</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Breadcrumbs                                */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-transparent border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Giỏ hàng</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Giỏ hàng của bạn
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {totalCount} sản phẩm
              </span>
              {isSyncing && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Đồng bộ máy chủ...</span>
                </span>
              )}
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 font-semibold transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Cart Layout                                           */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Guest Warning / Notice Banner */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-slate-900">
                  Bạn đang mua sắm với tư cách Khách
                </p>
                <p className="text-slate-600">
                  Hãy đăng nhập để đồng bộ giỏ hàng tự động lên hệ thống và tiến hành đặt hàng.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                onClick={() => navigate("/login?redirect=/cart")}
              >
                Đăng nhập ngay
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --------------------------------------------------------- */}
          {/* Left Column: Cart Items List (2 cols)                     */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selection Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  disabled={inStockItems.length === 0}
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Chọn tất cả ({inStockItems.length} sản phẩm có sẵn)
                </span>
              </label>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>
                  Đã chọn:{" "}
                  <strong className="text-blue-600 font-extrabold text-sm">
                    {selectedItems.length}
                  </strong>{" "}
                  mục ({selectedCount} cái)
                </span>
              </div>
            </div>

            {/* List of Cart Items */}
            {items.map((item) => {
              const isPcCase = item.itemType === "PC_CASE"
              const isBusy = busyItemIds[item.id] || false
              const isExpanded = expandedPcCases[item.id] || false
              const inStock = (item.stockQuantity ?? 0) > 0
              const isChecked = selectedItemIds.includes(item.id)

              // Metadata cho linh kiện lẻ
              const categoryMeta =
                !isPcCase && item.category ? CATEGORIES_META[item.category] : null
              const CategoryIcon = categoryMeta?.icon

              // Hình ảnh đại diện
              const displayImage = isPcCase
                ? "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"
                : item.productImage ||
                  item.product?.images?.[0]?.imageUrl ||
                  PLACEHOLDER_IMAGE

              return (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-xs ${
                    isChecked
                      ? isPcCase
                        ? "border-purple-400 ring-2 ring-purple-100"
                        : "border-blue-400 ring-2 ring-blue-100"
                      : isPcCase
                      ? "border-purple-200/80 hover:border-purple-300"
                      : "border-slate-200/90 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Item Selection Checkbox */}
                    <div className="pt-1 sm:pt-0 shrink-0">
                      <Checkbox
                        checked={isChecked}
                        disabled={!inStock}
                        onCheckedChange={() => toggleSelectItem(item.id, inStock)}
                        aria-label={`Chọn ${isPcCase ? item.pcCaseName : item.productName}`}
                      />
                    </div>

                    {/* Item Main Row */}
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                      {/* Item Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={displayImage}
                          alt={isPcCase ? item.pcCaseName : item.productName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                          }}
                        />
                        {isPcCase && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-600 text-white">
                            PC BUILD
                          </div>
                        )}
                      </div>

                      {/* Item Content */}
                      <div className="flex-1 min-w-0 w-full space-y-1.5">
                        {/* Type & Category Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isPcCase ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Cpu className="w-3 h-3" />
                              Cấu hình PC • {item.useCase || "Đa năng"}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                categoryMeta?.badgeClass ||
                                "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                              {categoryMeta?.shortLabel || item.category || "Linh kiện"}
                            </span>
                          )}

                          {/* Stock status indicator */}
                          {inStock ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Còn hàng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Hết hàng (không thể chọn)
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                          {isPcCase ? item.pcCaseName : item.productName}
                        </h3>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-sm sm:text-base font-extrabold text-blue-600">
                            {formatPrice(item.unitPrice)}
                          </span>
                          <span className="text-xs text-slate-400">/ cái</span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal & Delete */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Subtotal */}
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Thành tiền
                          </div>
                          <div className="text-base sm:text-lg font-black text-slate-900">
                            {formatPrice(item.subtotal || item.unitPrice * item.quantity)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stepper */}
                          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
                            <button
                              type="button"
                              disabled={isBusy || item.quantity <= 1}
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition"
                              title="Giảm 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-slate-800">
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-blue-600" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              type="button"
                              disabled={isBusy || item.quantity >= (item.stockQuantity || 999)}
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition"
                              title="Tăng 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemoveItem(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PC CASE: Collapsible Components Breakdown */}
                  {isPcCase && item.pcCase?.items && item.pcCase.items.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-purple-100 pl-7 sm:pl-8">
                      <button
                        type="button"
                        onClick={() => togglePcCaseDetails(item.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {isExpanded
                            ? "Thu gọn danh sách linh kiện trong bộ PC"
                            : `Xem ${item.pcCase.items.length} linh kiện trong cấu hình PC này`}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 bg-purple-50/50 rounded-xl p-3 border border-purple-100 text-xs space-y-2 animate-in fade-in">
                          <div className="font-semibold text-purple-950 pb-1 border-b border-purple-100/70">
                            Danh sách linh kiện được kiểm tra tương thích 100%:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.pcCase.items.map((component, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 bg-white/90 p-2 rounded-lg border border-purple-100"
                              >
                                <span className="font-bold text-purple-700 shrink-0 text-[11px]">
                                  [{component.category}]
                                </span>
                                <span className="text-slate-800 font-medium truncate">
                                  {component.product?.name || `Linh kiện ID: ${component.productId}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Link to="/products">
                  <span>← Tiếp tục mua sắm linh kiện</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* Right Column: Order Summary Card (1 col)                  */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-1 space-y-4 sticky top-20">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-base text-slate-900">
                  Tóm tắt đơn hàng
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Đã chọn {selectedItems.length} mục
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Số lượng sản phẩm đã chọn:</span>
                  <span className="font-bold text-slate-800">{selectedCount} cái</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(selectedAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-emerald-600">Miễn phí toàn quốc</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Hỗ trợ lắp ráp & cài đặt:</span>
                  <span className="font-bold text-emerald-600">Miễn phí 100%</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Tổng thanh toán</div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      (Đã bao gồm VAT)
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">
                    {formatPrice(selectedAmount)}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <Button
                  size="lg"
                  disabled={selectedItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all h-12 text-sm"
                  onClick={handleProceedToCheckout}
                >
                  <span>
                    {selectedItems.length > 0
                      ? `Tiến hành đặt hàng (${selectedItems.length})`
                      : "Vui lòng chọn sản phẩm"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {selectedItems.length === 0 && (
                  <p className="text-[11px] text-center text-slate-400 pt-2 font-medium">
                    Chọn ít nhất một món hàng bên danh sách để tiếp tục
                  </p>
                )}
              </div>

              {/* Security & Benefits Guarantee */}
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
      </main>
    </div>
  )
}
