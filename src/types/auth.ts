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
