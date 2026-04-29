import { apiFetch } from './client'
import type { AdminUser, AdminUserDetail, PagedResponse } from './types'

export const getUsers = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminUser>>(`/api/v1/admin/users?${params}`)
}

export const getUser = (id: number) =>
  apiFetch<AdminUserDetail>(`/api/v1/admin/users/${id}`)

export const patchUserInfo = (id: number, data: { fullName?: string; phone?: string }) =>
  apiFetch<AdminUserDetail>(`/api/v1/admin/users/${id}/info`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const patchUserVerification = (
  id: number,
  data: { isEmailVerified?: boolean; isNameVerified?: boolean; isPhoneVerified?: boolean }
) =>
  apiFetch<AdminUserDetail>(`/api/v1/admin/users/${id}/verification`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
