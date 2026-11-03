import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Package,
  ShoppingCart,
  Bot,
  ChevronRight,
  Home,
  Sparkles,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { userService } from "@/services/api/userService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, setUser } = useAuthStore()

  // Editing state
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  // Form fields
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [address, setAddress] = useState<string>("")

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để xem thông tin tài khoản!")
      navigate("/login?redirect=/profile", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Populate local form state from current user
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
    }
  }, [user])

  // Fetch latest profile from backend on mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!isAuthenticated) return
      setIsFetching(true)
      try {
        const response = await userService.getProfile()
        const latestUser = response?.data || response
        if (latestUser && latestUser.id) {
          setUser(latestUser)
        }
      } catch (err: any) {
        console.warn("Không thể tải thông tin mới nhất từ máy chủ:", err?.message)
      } finally {
        setIsFetching(false)
      }
    }

    fetchLatestProfile()
  }, [isAuthenticated, setUser])

  const handleStartEdit = () => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
    }
    setErrors({})
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
    }
    setErrors({})
    setIsEditing(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống"
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = "Họ và tên tối đa 100 ký tự"
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Địa chỉ email không đúng định dạng"
      }
    }

    if (phone.trim()) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin chưa hợp lệ")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      }

      const response = await userService.updateProfile(payload)
      const updatedUser = response?.data || response

      if (updatedUser && updatedUser.id) {
        setUser(updatedUser)
        setIsEditing(false)
        setErrors({})
        toast.success("Cập nhật thông tin cá nhân thành công!")
      } else {
        throw new Error("Không nhận được dữ liệu phản hồi từ máy chủ")
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật thông tin cá nhân. Vui lòng thử lại!"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Thành viên"

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 pb-20">
      {/* 1. Header Banner & Breadcrumbs */}
      <section className="bg-gradient-to-b from-blue-100/30 via-white to-transparent border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Thông tin cá nhân</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tài khoản của bạn
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Xem lại và cập nhật thông tin cá nhân cùng địa chỉ giao hàng mặc định của bạn.
              </p>
            </div>

            {isFetching && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 self-start sm:self-auto">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Profile Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: User Avatar & Role Badge Card (4 cols) */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                title="Tài khoản hoạt động"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-extrabold text-lg text-slate-900 truncate px-2">
                {user.fullName || "Khách hàng TechCraft"}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs mx-auto px-2">
                {user.email}
              </p>
            </div>

            <div className="pt-1 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === "ADMIN"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {user.role === "ADMIN" ? "Quản trị viên (Admin)" : "Khách hàng thành viên"}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tham gia từ {formattedJoinDate}</span>
            </div>
          </div>

          {/* Right: Personal Info Details / Edit Form (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Card Header & Edit Toggle Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Chi tiết thông tin cá nhân
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isEditing
                        ? "Chỉnh sửa thông tin và nhấn Lưu thay đổi để hoàn tất"
                        : "Thông tin liên hệ và nhận hàng của bạn trên hệ thống"}
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                    className="gap-1.5 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa thông tin</span>
                  </Button>
                )}
              </div>

              {/* View Mode vs Edit Mode */}
              {!isEditing ? (
                /* VIEW MODE */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                    {/* Full Name */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                        <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Họ và tên:</span>
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {user.fullName || "Chưa cập nhật"}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Địa chỉ Email:</span>
                      </span>
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Số điện thoại:</span>
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {user.phone || "Chưa cập nhật"}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Vai trò tài khoản:</span>
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {user.role === "ADMIN" ? "Quản trị viên (Admin)" : "Khách hàng (User)"}
                      </p>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Địa chỉ nhận hàng mặc định:</span>
                      </span>
                      <p className="font-semibold text-slate-800 text-sm leading-relaxed">
                        {user.address || "Chưa cập nhật địa chỉ nhận hàng"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name Input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="fullName"
                        className="text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Họ và tên <span className="text-rose-500">*</span>
                        </span>
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên đầy đủ..."
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          if (errors.fullName) {
                            setErrors((prev) => {
                              const updated = { ...prev }
                              delete updated.fullName
                              return updated
                            })
                          }
                        }}
                        className={`h-11 rounded-xl text-sm ${
                          errors.fullName ? "border-rose-400 focus:ring-rose-200" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Địa chỉ Email <span className="text-rose-500">*</span>
                        </span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tenban@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) {
                            setErrors((prev) => {
                              const updated = { ...prev }
                              delete updated.email
                              return updated
                            })
                          }
                        }}
                        className={`h-11 rounded-xl text-sm ${
                          errors.email ? "border-rose-400 focus:ring-rose-200" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="phone"
                        className="text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Số điện thoại nhận hàng</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ví dụ: 0912345678"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          if (errors.phone) {
                            setErrors((prev) => {
                              const updated = { ...prev }
                              delete updated.phone
                              return updated
                            })
                          }
                        }}
                        className={`h-11 rounded-xl text-sm ${
                          errors.phone ? "border-rose-400 focus:ring-rose-200" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Role Display (Readonly) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vai trò hệ thống</span>
                      </Label>
                      <div className="h-11 px-3.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center text-sm font-semibold text-slate-600 select-none">
                        {user.role === "ADMIN" ? "Quản trị viên (Admin)" : "Khách hàng (User)"}
                      </div>
                    </div>

                    {/* Address Textarea */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label
                        htmlFor="address"
                        className="text-xs font-bold text-slate-700 flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Địa chỉ nhận hàng mặc định</span>
                      </Label>
                      <textarea
                        id="address"
                        rows={3}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/90 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none placeholder:text-slate-400"
                        disabled={isSubmitting}
                      />
                      <p className="text-[11px] text-slate-400">
                        Địa chỉ này sẽ được tự động điền sẵn khi bạn tiến hành đặt hàng để tiết kiệm thời gian.
                      </p>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hủy bỏ</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu thay đổi...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/orders"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Lịch sử đơn hàng
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Xem và theo dõi tất cả đơn hàng đã đặt
                  </p>
                </div>
              </Link>

              <Link
                to="/cart"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Giỏ hàng của bạn
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kiểm tra các linh kiện đang lưu
                  </p>
                </div>
              </Link>

              <Link
                to="/ai-consultant"
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                    Tư vấn AI thông minh
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gợi ý cấu hình PC chuẩn tương thích
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
