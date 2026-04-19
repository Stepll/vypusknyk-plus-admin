import { apiFetch } from './client'
import type { AdminAdminItem, PagedResponse } from './types'

export const getAdmins = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminAdminItem>>(`/api/v1/admin/admins?${params}`)
}
