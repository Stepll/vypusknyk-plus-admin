import { apiFetch } from './client'
import type { BadgeTextColorResponse, SaveBadgeTextColorRequest } from './types'

export function getBadgeTextColors(): Promise<BadgeTextColorResponse[]> {
  return apiFetch('/api/v1/admin/badge-text-colors')
}

export function createBadgeTextColor(data: SaveBadgeTextColorRequest): Promise<BadgeTextColorResponse> {
  return apiFetch('/api/v1/admin/badge-text-colors', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBadgeTextColor(id: number, data: SaveBadgeTextColorRequest): Promise<BadgeTextColorResponse> {
  return apiFetch(`/api/v1/admin/badge-text-colors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteBadgeTextColor(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/badge-text-colors/${id}`, { method: 'DELETE' })
}
