import React, { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Cpu, Search, ShoppingCart, Menu, X, LogOut, ShieldCheck, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { authService } from "@/services/api/authService"
import { toast } from "sonner"

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { user, isAuthenticated, clearAuth } = useAuthStore()

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  TechCraft PC
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                  AI-Powered
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `transition-colors hover:text-blue-600 ${
                    isActive ? "text-blue-600 font-semibold" : "text-slate-600"
                  }`
                }
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `transition-colors hover:text-blue-600 py-1 ${
                    isActive
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                      : "text-slate-600"
                  }`
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/ai-consultant"
                className={({ isActive }) =>
                  `transition-colors hover:text-blue-600 ${
                    isActive ? "text-blue-600 font-semibold" : "text-slate-600"
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
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </Link>

            {/* Vertical separator */}
            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

            {/* Auth Buttons or Logged-in User Profile */}
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

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "TC"}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                    {user.fullName || user.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3 animate-in fade-in">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, linh kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-800"
              />
            </form>
            <div className="flex flex-col space-y-2 text-sm font-medium">
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
                Sản phẩm
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
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-800">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  {user.role === "ADMIN" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-xs font-semibold"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/admin/products">Trang Quản trị Admin</Link>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    Đăng xuất
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
