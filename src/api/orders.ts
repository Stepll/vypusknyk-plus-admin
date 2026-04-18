import { apiFetch } from './client'
import type { AdminOrder, PagedResponse } from './types'

export const getOrders = (page = 1, pageSize = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (status) params.set('status', status)
  return apiFetch<PagedResponse<AdminOrder>>(`/api/v1/admin/orders?${params}`)
}

export const getOrder = (id: number) =>
  apiFetch<AdminOrder>(`/api/v1/admin/orders/${id}`)

export const updateOrderStatus = (id: number, status: string) =>
  apiFetch<void>(`/api/v1/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
