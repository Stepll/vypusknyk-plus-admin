import { apiFetch } from './client'
import type { RibbonPrintTypeResponse, SaveRibbonPrintTypeRequest } from './types'

export function getRibbonPrintTypes(): Promise<RibbonPrintTypeResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-print-types')
}

export function createRibbonPrintType(data: SaveRibbonPrintTypeRequest): Promise<RibbonPrintTypeResponse> {
  return apiFetch('/api/v1/admin/ribbon-print-types', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonPrintType(id: number, data: SaveRibbonPrintTypeRequest): Promise<RibbonPrintTypeResponse> {
  return apiFetch(`/api/v1/admin/ribbon-print-types/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonPrintType(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-print-types/${id}`, { method: 'DELETE' })
}
