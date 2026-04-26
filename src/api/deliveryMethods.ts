import { apiFetch } from './client'
import type { DeliveryMethodResponse, UpdateDeliveryMethodRequest } from './types'

export function getDeliveryMethods(): Promise<DeliveryMethodResponse[]> {
  return apiFetch('/admin/delivery-methods')
}

export function getDeliveryMethod(id: number): Promise<DeliveryMethodResponse> {
  return apiFetch(`/admin/delivery-methods/${id}`)
}

export function updateDeliveryMethod(id: number, data: UpdateDeliveryMethodRequest): Promise<DeliveryMethodResponse> {
  return apiFetch(`/admin/delivery-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
