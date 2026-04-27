import { apiFetch } from './client'
import type { RibbonEmblemResponse, SaveRibbonEmblemRequest } from './types'

export function getRibbonEmblems(): Promise<RibbonEmblemResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-emblems')
}

export function createRibbonEmblem(data: SaveRibbonEmblemRequest): Promise<RibbonEmblemResponse> {
  return apiFetch('/api/v1/admin/ribbon-emblems', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonEmblem(id: number, data: SaveRibbonEmblemRequest): Promise<RibbonEmblemResponse> {
  return apiFetch(`/api/v1/admin/ribbon-emblems/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonEmblem(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-emblems/${id}`, { method: 'DELETE' })
}

export function uploadRibbonEmblemSvg(id: number, side: 'left' | 'right', file: File): Promise<RibbonEmblemResponse> {
  const form = new FormData()
  form.append('svg', file)
  return apiFetch(`/api/v1/admin/ribbon-emblems/${id}/svg/${side}`, { method: 'POST', body: form })
}
