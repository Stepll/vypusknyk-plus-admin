import { apiFetch } from './client'
import type {
  SupplierResponse, SaveSupplierRequest, DeliverySummary, DeliveryDetail,
  DeliveryItemResponse, CreateDeliveryRequest, ReceiveDeliveryItemRequest, PagedResponse,
} from './types'

export interface DeliveryQueryParams {
  page?: number
  pageSize?: number
  supplierId?: number
  status?: string
  search?: string
}

export const getSuppliers = () =>
  apiFetch<SupplierResponse[]>('/api/v1/admin/suppliers')

export const createSupplier = (data: SaveSupplierRequest) =>
  apiFetch<SupplierResponse>('/api/v1/admin/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateSupplier = (id: number, data: SaveSupplierRequest) =>
  apiFetch<SupplierResponse>(`/api/v1/admin/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteSupplier = (id: number) =>
  apiFetch<void>(`/api/v1/admin/suppliers/${id}`, { method: 'DELETE' })

export const getDeliveries = (params: DeliveryQueryParams = {}) => {
  const p = new URLSearchParams()
  if (params.page) p.set('page', String(params.page))
  if (params.pageSize) p.set('pageSize', String(params.pageSize))
  if (params.supplierId) p.set('supplierId', String(params.supplierId))
  if (params.status) p.set('status', params.status)
  if (params.search) p.set('search', params.search)
  return apiFetch<PagedResponse<DeliverySummary>>(`/api/v1/admin/deliveries?${p}`)
}

export const getDeliveryDetail = (id: number) =>
  apiFetch<DeliveryDetail>(`/api/v1/admin/deliveries/${id}`)

export const createDelivery = (data: CreateDeliveryRequest) =>
  apiFetch<DeliveryDetail>('/api/v1/admin/deliveries', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const receiveDeliveryItem = (deliveryId: number, itemId: number, data: ReceiveDeliveryItemRequest) =>
  apiFetch<DeliveryItemResponse>(`/api/v1/admin/deliveries/${deliveryId}/items/${itemId}/receive`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const receiveAllDeliveryItems = (deliveryId: number, date: string) =>
  apiFetch<void>(`/api/v1/admin/deliveries/${deliveryId}/receive-all`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  })
