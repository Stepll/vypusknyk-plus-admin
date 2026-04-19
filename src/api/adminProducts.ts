import { apiFetch } from './client'
import type { AdminProductDetail, SaveProductRequest } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5272'

export const getAdminProduct = (id: number) =>
  apiFetch<AdminProductDetail>(`/api/v1/admin/products/${id}`)

export const createAdminProduct = (data: SaveProductRequest) =>
  apiFetch<AdminProductDetail>('/api/v1/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateAdminProduct = (id: number, data: SaveProductRequest) =>
  apiFetch<AdminProductDetail>(`/api/v1/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const uploadProductImage = async (id: number, file: File): Promise<AdminProductDetail> => {
  const token = localStorage.getItem('admin_token')
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/api/v1/products/${id}/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
