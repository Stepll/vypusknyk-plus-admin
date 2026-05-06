import { apiFetch } from './client'
import type { BadgeImageResponse, SaveBadgeImageRequest } from './types'

export function getBadgeImages(): Promise<BadgeImageResponse[]> {
  return apiFetch('/api/v1/admin/badge-images')
}

export function createBadgeImage(data: SaveBadgeImageRequest): Promise<BadgeImageResponse> {
  return apiFetch('/api/v1/admin/badge-images', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBadgeImage(id: number, data: SaveBadgeImageRequest): Promise<BadgeImageResponse> {
  return apiFetch(`/api/v1/admin/badge-images/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteBadgeImage(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/badge-images/${id}`, { method: 'DELETE' })
}

export function uploadBadgeImage(id: number, file: File): Promise<BadgeImageResponse> {
  const form = new FormData()
  form.append('image', file)
  return apiFetch(`/api/v1/admin/badge-images/${id}/image`, { method: 'POST', body: form })
}
