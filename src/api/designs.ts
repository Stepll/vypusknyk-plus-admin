import { apiFetch } from './client'
import type { AdminSavedDesignItem, PagedResponse } from './types'

export const getSavedDesigns = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminSavedDesignItem>>(`/api/v1/admin/designs?${params}`)
}
