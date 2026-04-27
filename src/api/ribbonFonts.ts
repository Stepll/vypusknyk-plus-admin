import { apiFetch } from './client'
import type { RibbonFontResponse, SaveRibbonFontRequest } from './types'

export function getRibbonFonts(): Promise<RibbonFontResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-fonts')
}

export function createRibbonFont(data: SaveRibbonFontRequest): Promise<RibbonFontResponse> {
  return apiFetch('/api/v1/admin/ribbon-fonts', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonFont(id: number, data: SaveRibbonFontRequest): Promise<RibbonFontResponse> {
  return apiFetch(`/api/v1/admin/ribbon-fonts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonFont(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-fonts/${id}`, { method: 'DELETE' })
}
