import { apiFetch } from './client'
import type { AdminAdminItem, AdminAdminDetail, CreateAdminRequest, PagedResponse } from './types'

export const getAdmins = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminAdminItem>>(`/api/v1/admin/admins?${params}`)
}

export const getAdmin = (id: number) =>
  apiFetch<AdminAdminDetail>(`/api/v1/admin/admins/${id}`)

export const createAdmin = (data: CreateAdminRequest) =>
  apiFetch<AdminAdminDetail>('/api/v1/admin/admins', { method: 'POST', body: JSON.stringify(data) })

export const deleteAdmin = (id: number) =>
  apiFetch<void>(`/api/v1/admin/admins/${id}`, { method: 'DELETE' })
