import { apiFetch } from './client'
import type { RibbonMaterialResponse, SaveRibbonMaterialRequest } from './types'

export function getRibbonMaterials(): Promise<RibbonMaterialResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-materials')
}

export function createRibbonMaterial(data: SaveRibbonMaterialRequest): Promise<RibbonMaterialResponse> {
  return apiFetch('/api/v1/admin/ribbon-materials', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonMaterial(id: number, data: SaveRibbonMaterialRequest): Promise<RibbonMaterialResponse> {
  return apiFetch(`/api/v1/admin/ribbon-materials/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonMaterial(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-materials/${id}`, { method: 'DELETE' })
}
