import React, { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Cpu,
  Search,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Package,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore"
import { useCartStore } from "@/stores/cartStore"
import { authService } from "@/services/api/authService"
import { toast } from "sonner"

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const cartCount = useCartStore((state) => state.getTotalCount())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      clearAuth()
      toast.success("Đã đăng xuất khỏi tài khoản thành công")
      navigate("/")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <Cpu className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  TechCraft
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 -mt-1">
                  PC & Components
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                Linh kiện máy tính
              </NavLink>
              <NavLink
                to="/pc-cases"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                Cấu hình PC
              </NavLink>
              <NavLink
                to="/ai-consultant"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                Tư vấn AI
              </NavLink>
            </nav>
          </div>

          {/* Search Box */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, linh kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100/80 border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              <span
                className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center transition-all duration-200 ${
                  cartCount > 0 ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                }`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>

            {/* Vertical separator */}
            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

            {/* Auth Buttons or Logged-in User Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-3">
                {user.role === "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-9 gap-1.5 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/70 text-xs font-semibold"
                  >
                    <Link to="/admin/products">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Trang Admin</span>
                    </Link>
                  </Button>
                )}

                {/* Dropdown Menu when clicking user avatar or name */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 max-w-[130px] truncate text-left">
                        {user.fullName || user.email}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-slate-200/90">
                    {/* User Info Header in dropdown */}
                    <div className="px-2.5 py-2">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {user.fullName || "Khách hàng TechCraft"}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            user.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {user.role === "ADMIN" ? "Quản trị viên (Admin)" : "Khách hàng thành viên"}
                        </span>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Profile */}
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer rounded-xl"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>Thông tin cá nhân</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Orders History */}
                    <DropdownMenuItem asChild>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer rounded-xl"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>Lịch sử đơn hàng</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin shortcut if admin */}
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/products"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer rounded-xl"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Bảng điều khiển Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer rounded-xl"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium px-4 h-9"
                >
                  <Link to="/register">Đăng ký</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 h-9 shadow-sm"
                >
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Search Box on Mobile */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            {/* Navigation links */}
            <div className="flex flex-col space-y-1 text-sm font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                Linh kiện máy tính
              </Link>
              <Link
                to="/pc-cases"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                Cấu hình PC
              </Link>
              <Link
                to="/ai-consultant"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                Tư vấn AI
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1 pt-1">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>Thông tin cá nhân</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>Lịch sử đơn hàng</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Trang Quản trị Admin</span>
                      </Link>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full text-xs font-bold gap-2 mt-2"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-1/2"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/register">Đăng ký</Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-1/2 bg-blue-600"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
