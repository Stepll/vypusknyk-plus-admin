import { apiFetch } from './client'
import type { AdminUser, AdminUserDetail, PagedResponse } from './types'

export const getUsers = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminUser>>(`/api/v1/admin/users?${params}`)
}

export const getUser = (id: number) =>
  apiFetch<AdminUserDetail>(`/api/v1/admin/users/${id}`)
