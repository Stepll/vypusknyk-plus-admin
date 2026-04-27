import { apiFetch } from './client'
import type { PaymentMethodResponse, UpdatePaymentMethodRequest } from './types'

export function getPaymentMethods(): Promise<PaymentMethodResponse[]> {
  return apiFetch('/api/v1/admin/payment-methods')
}

export function getPaymentMethod(id: number): Promise<PaymentMethodResponse> {
  return apiFetch(`/api/v1/admin/payment-methods/${id}`)
}

export function updatePaymentMethod(id: number, data: UpdatePaymentMethodRequest): Promise<PaymentMethodResponse> {
  return apiFetch(`/api/v1/admin/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
