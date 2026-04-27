import { apiFetch } from './client'
import type { RibbonColorResponse, SaveRibbonColorRequest } from './types'

export function getRibbonColors(): Promise<RibbonColorResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-colors')
}

export function createRibbonColor(data: SaveRibbonColorRequest): Promise<RibbonColorResponse> {
  return apiFetch('/api/v1/admin/ribbon-colors', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonColor(id: number, data: SaveRibbonColorRequest): Promise<RibbonColorResponse> {
  return apiFetch(`/api/v1/admin/ribbon-colors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonColor(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-colors/${id}`, { method: 'DELETE' })
}
