import { apiFetch } from './client'
import type { AdminProduct, PagedResponse } from './types'

export const getProducts = (page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiFetch<PagedResponse<AdminProduct>>(`/api/v1/admin/products?${params}`)
}

export const getAllProducts = async (): Promise<AdminProduct[]> => {
  const pageSize = 200
  let page = 1
  const all: AdminProduct[] = []
  while (true) {
    const data = await getProducts(page, pageSize)
    all.push(...data.items)
    if (all.length >= data.total) break
    page++
  }
  return all
}

export const getProduct = (id: number) =>
  apiFetch<AdminProduct>(`/api/v1/admin/products/${id}`)

export const createProduct = (data: Omit<AdminProduct, 'id' | 'imageUrl' | 'isDeleted'>) =>
  apiFetch<AdminProduct>('/api/v1/admin/products', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id: number, data: Partial<AdminProduct>) =>
  apiFetch<AdminProduct>(`/api/v1/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteProduct = (id: number) =>
  apiFetch<void>(`/api/v1/admin/products/${id}`, { method: 'DELETE' })

export const uploadProductImage = (id: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<{ imageUrl: string }>(`/api/v1/products/${id}/image`, { method: 'POST', body: form, headers: {} })
}
