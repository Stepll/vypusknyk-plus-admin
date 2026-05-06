import { apiFetch } from './client'
import type { BadgeFontResponse, SaveBadgeFontRequest } from './types'

export function getBadgeFonts(): Promise<BadgeFontResponse[]> {
  return apiFetch('/api/v1/admin/badge-fonts')
}

export function createBadgeFont(data: SaveBadgeFontRequest): Promise<BadgeFontResponse> {
  return apiFetch('/api/v1/admin/badge-fonts', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBadgeFont(id: number, data: SaveBadgeFontRequest): Promise<BadgeFontResponse> {
  return apiFetch(`/api/v1/admin/badge-fonts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteBadgeFont(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/badge-fonts/${id}`, { method: 'DELETE' })
}
