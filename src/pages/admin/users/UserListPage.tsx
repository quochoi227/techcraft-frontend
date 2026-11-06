import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Users,
  Search,
  RotateCw,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  XCircle,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { User, UserRole, AdminUpdateUserPayload } from "@/types/auth"
import { userService } from "@/services/api/userService"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import { UserEditModal } from "./components/UserEditModal"
import { UserStatusModal } from "./components/UserStatusModal"
import { MOCK_ADMIN_USERS } from "./mockData"

type SortOption = "NEWEST" | "OLDEST" | "NAME_ASC" | "NAME_DESC" | "EMAIL_ASC"

export const UserListPage: React.FC = () => {
  // Current admin session
  const currentUser = useAuthStore((state) => state.user)
  const currentAdminId = currentUser?.id

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10
  const [totalElements, setTotalElements] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST")

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  const [statusTargetUser, setStatusTargetUser] = useState<User | null>(null)
  const [statusTargetNext, setStatusTargetNext] = useState<boolean>(true)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false)
  const [isSubmittingStatus, setIsSubmittingStatus] = useState<boolean>(false)

  // Search debouncing (350ms)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 350)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  /**
   * Fetch users from backend API with fallback to mock data
   */
  const fetchUsers = useCallback(
    async (page: number = currentPage) => {
      setIsLoading(true)

      let apiSortBy = "createdAt"
      let apiSortDir: "asc" | "desc" = "desc"

      switch (sortBy) {
        case "OLDEST":
          apiSortBy = "createdAt"
          apiSortDir = "asc"
          break
        case "NAME_ASC":
          apiSortBy = "fullName"
          apiSortDir = "asc"
          break
        case "NAME_DESC":
          apiSortBy = "fullName"
          apiSortDir = "desc"
          break
        case "EMAIL_ASC":
          apiSortBy = "email"
          apiSortDir = "asc"
          break
        case "NEWEST":
        default:
          apiSortBy = "createdAt"
          apiSortDir = "desc"
          break
      }

      try {
        const response: any = await userService.getAdminUsers({
          page: page - 1, // 0-based index for Spring Boot
          size: pageSize,
          search: debouncedSearch.trim() || undefined,
          role: roleFilter !== "ALL" ? roleFilter : undefined,
          active: statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined,
          sortBy: apiSortBy,
          sortDir: apiSortDir,
        })

        // Unpack response: could be response.data (PageResponse) or direct response
        const pageData = response?.data || response
        if (pageData && Array.isArray(pageData.content)) {
          setUsers(pageData.content)
          setTotalElements(Number(pageData.totalElements) || pageData.content.length)
          setTotalPages(
            Math.max(1, Number(pageData.totalPages) || Math.ceil(pageData.content.length / pageSize))
          )
          setIsUsingFallback(false)
        } else if (Array.isArray(pageData)) {
          setUsers(pageData)
          setTotalElements(pageData.length)
          setTotalPages(Math.max(1, Math.ceil(pageData.length / pageSize)))
          setIsUsingFallback(false)
        } else {
          setUsers([])
          setTotalElements(0)
          setTotalPages(1)
        }
      } catch (err: any) {
        console.warn("Không thể kết nối API người dùng từ backend. Sử dụng dữ liệu dự phòng:", err)
        setIsUsingFallback(true)

        // Local filtering & pagination on MOCK_ADMIN_USERS
        let filtered = [...MOCK_ADMIN_USERS]

        if (debouncedSearch.trim()) {
          const q = debouncedSearch.trim().toLowerCase()
          filtered = filtered.filter(
            (u) =>
              (u.fullName && u.fullName.toLowerCase().includes(q)) ||
              u.email.toLowerCase().includes(q) ||
              (u.phone && u.phone.includes(q))
          )
        }

        if (roleFilter !== "ALL") {
          filtered = filtered.filter((u) => u.role === roleFilter)
        }

        if (statusFilter !== "ALL") {
          const expectActive = statusFilter === "ACTIVE"
          filtered = filtered.filter((u) => Boolean(u.active) === expectActive)
        }

        // Sorting
        filtered.sort((a, b) => {
          if (sortBy === "OLDEST") {
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          }
          if (sortBy === "NAME_ASC") {
            return (a.fullName || "").localeCompare(b.fullName || "")
          }
          if (sortBy === "NAME_DESC") {
            return (b.fullName || "").localeCompare(a.fullName || "")
          }
          if (sortBy === "EMAIL_ASC") {
            return a.email.localeCompare(b.email)
          }
          // Default: NEWEST
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })

        const total = filtered.length
        const totalPgs = Math.max(1, Math.ceil(total / pageSize))
        const startIndex = (page - 1) * pageSize
        const paginated = filtered.slice(startIndex, startIndex + pageSize)

        setUsers(paginated)
        setTotalElements(total)
        setTotalPages(totalPgs)
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, pageSize, debouncedSearch, roleFilter, statusFilter, sortBy]
  )

  useEffect(() => {
    fetchUsers(currentPage)
  }, [fetchUsers, currentPage])

  // Overview statistics calculated from current dataset or active elements
  const stats = useMemo(() => {
    const list = isUsingFallback ? MOCK_ADMIN_USERS : users
    const total = totalElements || list.length
    const admins = list.filter((u) => u.role === "ADMIN").length
    const regularUsers = list.filter((u) => u.role === "USER").length
    const activeAccounts = list.filter((u) => u.active !== false).length
    const lockedAccounts = list.filter((u) => u.active === false).length

    return {
      total,
      admins,
      regularUsers,
      activeAccounts,
      lockedAccounts,
    }
  }, [users, isUsingFallback, totalElements])

  // Handle open edit modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  // Handle save user from EditModal
  const handleSaveUser = async (id: string, payload: AdminUpdateUserPayload): Promise<boolean> => {
    try {
      if (isUsingFallback) {
        // Cập nhật cục bộ mock data
        const idx = MOCK_ADMIN_USERS.findIndex((u) => u.id === id)
        if (idx !== -1) {
          MOCK_ADMIN_USERS[idx] = {
            ...MOCK_ADMIN_USERS[idx],
            ...payload,
            updatedAt: new Date().toISOString(),
          }
        }
        toast.success("Cập nhật thông tin người dùng thành công (Chế độ xem thử)")
        setIsEditModalOpen(false)
        setEditingUser(null)
        await fetchUsers(currentPage)
        return true
      }

      await userService.adminUpdateUser(id, payload)
      toast.success("Cập nhật thông tin người dùng thành công!")

      // Nếu người cập nhật là chính mình, đồng bộ lại auth store
      if (id === currentAdminId) {
        useAuthStore.getState().setUser({
          ...currentUser!,
          fullName: payload.fullName || currentUser?.fullName,
          phone: payload.phone || currentUser?.phone,
          address: payload.address || currentUser?.address,
        })
      }

      setIsEditModalOpen(false)
      setEditingUser(null)
      await fetchUsers(currentPage)
      return true
    } catch (err: any) {
      console.error("Lỗi khi cập nhật người dùng:", err)
      const message =
        err?.response?.data?.message || err?.message || "Không thể cập nhật người dùng"
      toast.error(message)
      return false
    }
  }

  // Handle trigger status toggle modal
  const handleTriggerStatusChange = (user: User) => {
    if (user.id === currentAdminId) {
      toast.error("Bạn không thể tự khóa tài khoản quản trị của chính mình!")
      return
    }
    setStatusTargetUser(user)
    setStatusTargetNext(!user.active)
    setIsStatusModalOpen(true)
  }

  // Handle confirm status toggle
  const handleConfirmStatusChange = async () => {
    if (!statusTargetUser) return

    setIsSubmittingStatus(true)
    try {
      if (isUsingFallback) {
        const idx = MOCK_ADMIN_USERS.findIndex((u) => u.id === statusTargetUser.id)
        if (idx !== -1) {
          MOCK_ADMIN_USERS[idx].active = statusTargetNext
          MOCK_ADMIN_USERS[idx].updatedAt = new Date().toISOString()
        }
        toast.success(
          statusTargetNext
            ? "Đã mở khóa tài khoản người dùng (Chế độ xem thử)"
            : "Đã khóa tài khoản người dùng thành công (Chế độ xem thử)"
        )
        setIsStatusModalOpen(false)
        setStatusTargetUser(null)
        await fetchUsers(currentPage)
        return
      }

      await userService.updateUserStatus(statusTargetUser.id, statusTargetNext)
      toast.success(
        statusTargetNext
          ? "Đã mở khóa tài khoản người dùng thành công!"
          : "Đã khóa tài khoản người dùng thành công!"
      )
      setIsStatusModalOpen(false)
      setStatusTargetUser(null)
      await fetchUsers(currentPage)
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái người dùng:", err)
      const message =
        err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái người dùng"
      toast.error(message)
    } finally {
      setIsSubmittingStatus(false)
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setDebouncedSearch("")
    setRoleFilter("ALL")
    setStatusFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" || roleFilter !== "ALL" || statusFilter !== "ALL" || sortBy !== "NEWEST"

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return "—"
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "—"
    }
  }

  // Helper to extract user initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "TC"
  }

  return (
    <div className="space-y-6">
      {/* 0. Fallback data alert if backend is unreachable */}
      {isUsingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Chưa kết nối được máy chủ Backend (
              <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">
                {import.meta.env.VITE_API_BASE_URL ||
                  "http://localhost:8080/api"}
              </code>
              ). Đang hiển thị dữ liệu mẫu để trải nghiệm đầy đủ giao diện.
            </span>
          </div>
          <button
            onClick={() => fetchUsers(currentPage)}
            className="text-blue-600 font-bold hover:underline shrink-0 ml-3 inline-flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Quản lý người dùng</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tài khoản khách hàng, nhân viên, phân quyền ADMIN / USER và
            trạng thái hoạt động.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(currentPage)}
            disabled={isLoading}
            className="text-xs font-semibold gap-2 border-slate-200 hover:bg-slate-50"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Overview Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Quản trị viên (ADMIN)
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {stats.admins}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Khách hàng (USER)
            </p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {stats.regularUsers}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.activeAccounts}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã bị khóa</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {stats.lockedAccounts}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-16 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">
                Vai trò:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                <option value="USER">Khách hàng (USER)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">
                Trạng thái:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Đã bị khóa</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
              >
                <option value="NEWEST">Đăng ký mới nhất</option>
                <option value="OLDEST">Đăng ký cũ nhất</option>
                <option value="NAME_ASC">Tên (A → Z)</option>
                <option value="NAME_DESC">Tên (Z → A)</option>
                <option value="EMAIL_ASC">Email (A → Z)</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-10 px-2.5 gap-1 shrink-0"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Table of Users */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Thông tin liên hệ</th>
                <th className="py-3.5 px-4 text-center">Phân quyền</th>
                <th className="py-3.5 px-4 text-center">Xác thực</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`loading-row-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-40 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="w-24 h-3 bg-slate-200 rounded" />
                        <div className="w-36 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-20 h-5 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-20 h-5 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-16 h-8 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                          Không tìm thấy người dùng phù hợp
                        </p>
                        <p className="text-xs text-slate-500">
                          {hasActiveFilters
                            ? "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc."
                            : "Hệ thống hiện tại chưa có người dùng nào được ghi nhận."}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="text-xs font-semibold mt-2"
                        >
                          Xóa bộ lọc tìm kiếm
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Users Data Rows
                users.map((user) => {
                  const isSelf = Boolean(
                    currentAdminId && user.id === currentAdminId,
                  );
                  const isActive = user.active !== false;
                  const isVerified = Boolean(user.emailVerified);
                  const isAdmin = user.role === "ADMIN";

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelf ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* 1. Name & Email & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs ${
                              isAdmin
                                ? "bg-purple-100 text-purple-700 ring-2 ring-purple-200"
                                : "bg-blue-100 text-blue-700 ring-2 ring-blue-100"
                            }`}
                          >
                            {getInitials(user.fullName, user.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 truncate">
                                {user.fullName || "Chưa đặt tên"}
                              </span>
                              {isSelf && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact details (Phone & Address) */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{user.phone || "—"}</span>
                          </div>
                          {user.address ? (
                            <div
                              className="flex items-start gap-1.5 text-[11px] text-slate-500 truncate"
                              title={user.address}
                            >
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate">{user.address}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Chưa cập nhật địa chỉ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Role Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200/60 shadow-2xs">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            <span>USER</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Email Verified Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isVerified ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            title="Tài khoản đã xác nhận địa chỉ email"
                          >
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                            <span>Đã xác thực</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                            title="Tài khoản chưa hoàn tất xác thực email"
                          >
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            <span>Chưa xác thực</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Account Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
                            <Lock className="w-3 h-3 text-rose-500" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Registered Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                            title="Chỉnh sửa thông tin & phân quyền"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock User Button */}
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleTriggerStatusChange(user)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition-colors border ${
                                isSelf
                                  ? "text-slate-300 border-transparent cursor-not-allowed"
                                  : "text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-transparent"
                              }`}
                              title={
                                isSelf
                                  ? "Bạn không thể tự khóa tài khoản của chính mình"
                                  : "Khóa tài khoản này"
                              }
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTriggerStatusChange(user)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors border border-transparent"
                              title="Mở khóa tài khoản này"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {totalElements > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị{" "}
              <span className="font-bold text-slate-800">
                {Math.min((currentPage - 1) * pageSize + 1, totalElements)}
              </span>{" "}
              đến{" "}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * pageSize, totalElements)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-bold text-slate-800">{totalElements}</span>{" "}
              người dùng
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 px-2.5 text-xs font-semibold gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((p) => {
                    // Show first, last, and pages close to current
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={`page-${p}`}>
                        {showEllipsis && (
                          <span className="px-1 text-slate-400 select-none">
                            ...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            currentPage === p
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "text-slate-600 hover:bg-slate-200/60"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 px-2.5 text-xs font-semibold gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <UserEditModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        currentAdminId={currentAdminId}
      />

      {/* Lock / Unlock Confirmation Modal */}
      <UserStatusModal
        user={statusTargetUser}
        nextStatus={statusTargetNext}
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTargetUser(null);
        }}
        onConfirm={handleConfirmStatusChange}
        isSubmitting={isSubmittingStatus}
      />
    </div>
  );
}
