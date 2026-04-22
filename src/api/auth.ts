import { apiFetch } from './client'
import type { RoleInfo } from './types'

export interface AdminAuthResponse {
  id: number
  email: string
  fullName: string
  isSuperAdmin: boolean
  token: string
  role?: RoleInfo
}

export const login = (email: string, password: string) =>
  apiFetch<AdminAuthResponse>('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
