import { apiFetch } from './client'
import type { OrderStatusResponse, SaveOrderStatusRequest } from './types'

export function getOrderStatuses(): Promise<OrderStatusResponse[]> {
  return apiFetch('/api/v1/admin/order-statuses')
}

export function createOrderStatus(data: SaveOrderStatusRequest): Promise<OrderStatusResponse> {
  return apiFetch('/api/v1/admin/order-statuses', { method: 'POST', body: JSON.stringify(data) })
}

export function updateOrderStatus(id: number, data: SaveOrderStatusRequest): Promise<OrderStatusResponse> {
  return apiFetch(`/api/v1/admin/order-statuses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteOrderStatus(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/order-statuses/${id}`, { method: 'DELETE' })
}
