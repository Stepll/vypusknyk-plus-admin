import { apiFetch } from './client'
import type { CertificatePaperTypeResponse, SaveCertificatePaperTypeRequest } from './types'

export function getCertificatePaperTypes(): Promise<CertificatePaperTypeResponse[]> {
  return apiFetch('/api/v1/admin/certificate-paper-types')
}

export function createCertificatePaperType(data: SaveCertificatePaperTypeRequest): Promise<CertificatePaperTypeResponse> {
  return apiFetch('/api/v1/admin/certificate-paper-types', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCertificatePaperType(id: number, data: SaveCertificatePaperTypeRequest): Promise<CertificatePaperTypeResponse> {
  return apiFetch(`/api/v1/admin/certificate-paper-types/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteCertificatePaperType(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/certificate-paper-types/${id}`, { method: 'DELETE' })
}
