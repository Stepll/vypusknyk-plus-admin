import { apiFetch } from './client'

export interface AdminAuthResponse {
  id: string
  email: string
  fullName: string
  isSuperAdmin: boolean
  token: string
}

export const login = (email: string, password: string) =>
  apiFetch<AdminAuthResponse>('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
