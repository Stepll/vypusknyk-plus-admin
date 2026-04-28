import { apiFetch } from './client'
import type {
  ConstructorIncompatibilityResponse,
  ConstructorForcedTextResponse,
  SaveConstructorIncompatibilityRequest,
  SaveConstructorForcedTextRequest,
} from './types'

// Incompatibilities
export function getIncompatibilities(): Promise<ConstructorIncompatibilityResponse[]> {
  return apiFetch('/api/v1/admin/constructor-rules/incompatibilities')
}

export function createIncompatibility(data: SaveConstructorIncompatibilityRequest): Promise<ConstructorIncompatibilityResponse> {
  return apiFetch('/api/v1/admin/constructor-rules/incompatibilities', { method: 'POST', body: JSON.stringify(data) })
}

export function updateIncompatibility(id: number, data: SaveConstructorIncompatibilityRequest): Promise<ConstructorIncompatibilityResponse> {
  return apiFetch(`/api/v1/admin/constructor-rules/incompatibilities/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteIncompatibility(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/constructor-rules/incompatibilities/${id}`, { method: 'DELETE' })
}

// Forced texts
export function getForcedTexts(): Promise<ConstructorForcedTextResponse[]> {
  return apiFetch('/api/v1/admin/constructor-rules/forced-texts')
}

export function createForcedText(data: SaveConstructorForcedTextRequest): Promise<ConstructorForcedTextResponse> {
  return apiFetch('/api/v1/admin/constructor-rules/forced-texts', { method: 'POST', body: JSON.stringify(data) })
}

export function updateForcedText(id: number, data: SaveConstructorForcedTextRequest): Promise<ConstructorForcedTextResponse> {
  return apiFetch(`/api/v1/admin/constructor-rules/forced-texts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteForcedText(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/constructor-rules/forced-texts/${id}`, { method: 'DELETE' })
}
