import { apiFetch } from './client'
import type { AdminSavedBadgeDesignItem, AdminUserSavedBadgeDesign, PagedResponse } from './types'

export const getBadgeDesigns = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminSavedBadgeDesignItem>>(`/api/v1/admin/badge-designs?${params}`)
}

export const getBadgeDesign = (id: number) =>
  apiFetch<AdminSavedBadgeDesignItem>(`/api/v1/admin/badge-designs/${id}`)

export const deleteBadgeDesign = (id: number) =>
  apiFetch<void>(`/api/v1/admin/badge-designs/${id}`, { method: 'DELETE' })

export const getBadgeDesignsByUser = (userId: number) =>
  apiFetch<AdminUserSavedBadgeDesign[]>(`/api/v1/admin/badge-designs/by-user/${userId}`)
