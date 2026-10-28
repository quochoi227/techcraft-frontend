export type UserRole = 'GUEST' | 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  fullName?: string
  phone?: string
  address?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponseData {
  accessToken: string
  user: User
}

export interface RefreshTokenResponseData {
  accessToken: string
}
