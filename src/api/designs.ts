import { apiFetch } from './client'
import type { AdminSavedDesignItem, AdminSavedDesignDetail, PagedResponse } from './types'

export const getSavedDesigns = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminSavedDesignItem>>(`/api/v1/admin/designs?${params}`)
}

export const getSavedDesign = (id: number) =>
  apiFetch<AdminSavedDesignDetail>(`/api/v1/admin/designs/${id}`)

export const deleteSavedDesign = (id: number) =>
  apiFetch<void>(`/api/v1/admin/designs/${id}`, { method: 'DELETE' })
