import { apiFetch } from './client'
import type { RibbonPrintColorResponse, SaveRibbonPrintColorRequest } from './types'

export function getRibbonPrintColors(): Promise<RibbonPrintColorResponse[]> {
  return apiFetch('/api/v1/admin/ribbon-print-colors')
}

export function createRibbonPrintColor(data: SaveRibbonPrintColorRequest): Promise<RibbonPrintColorResponse> {
  return apiFetch('/api/v1/admin/ribbon-print-colors', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRibbonPrintColor(id: number, data: SaveRibbonPrintColorRequest): Promise<RibbonPrintColorResponse> {
  return apiFetch(`/api/v1/admin/ribbon-print-colors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteRibbonPrintColor(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/ribbon-print-colors/${id}`, { method: 'DELETE' })
}
