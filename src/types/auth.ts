export type UserRole = 'GUEST' | 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  fullName?: string
  phone?: string
  address?: string
  role: UserRole
  emailVerified?: boolean
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfilePayload {
  fullName: string
  email: string
  phone?: string
  address?: string
}

export interface AdminUserFilterParams {
  search?: string
  role?: UserRole | "ALL"
  active?: boolean | "ALL"
  page?: number
  size?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export interface AdminUpdateUserPayload {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  role?: UserRole
  active?: boolean
  emailVerified?: boolean
}

export interface UpdateUserStatusPayload {
  active: boolean
}

export interface AuthResponseData {
  accessToken: string
  user: User
}

export interface RefreshTokenResponseData {
  accessToken: string
}

export interface RegisterResponseData {
  id: string
  email: string
  fullName: string
  phone?: string
  address?: string
  role: UserRole
  emailVerified: boolean
}
