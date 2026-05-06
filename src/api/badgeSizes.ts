import { apiFetch } from './client'
import type { BadgeSizeResponse, SaveBadgeSizeRequest } from './types'

export function getBadgeSizes(): Promise<BadgeSizeResponse[]> {
  return apiFetch('/api/v1/admin/badge-sizes')
}

export function createBadgeSize(data: SaveBadgeSizeRequest): Promise<BadgeSizeResponse> {
  return apiFetch('/api/v1/admin/badge-sizes', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBadgeSize(id: number, data: SaveBadgeSizeRequest): Promise<BadgeSizeResponse> {
  return apiFetch(`/api/v1/admin/badge-sizes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteBadgeSize(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/badge-sizes/${id}`, { method: 'DELETE' })
}
