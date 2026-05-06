import { apiFetch } from './client'
import type { BadgeTextSizeResponse, SaveBadgeTextSizeRequest } from './types'

export function getBadgeTextSizes(): Promise<BadgeTextSizeResponse[]> {
  return apiFetch('/api/v1/admin/badge-text-sizes')
}

export function createBadgeTextSize(data: SaveBadgeTextSizeRequest): Promise<BadgeTextSizeResponse> {
  return apiFetch('/api/v1/admin/badge-text-sizes', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBadgeTextSize(id: number, data: SaveBadgeTextSizeRequest): Promise<BadgeTextSizeResponse> {
  return apiFetch(`/api/v1/admin/badge-text-sizes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteBadgeTextSize(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/badge-text-sizes/${id}`, { method: 'DELETE' })
}
