import { apiFetch } from './client'
import type { CertificateFontResponse, SaveCertificateFontRequest } from './types'

export function getCertificateFonts(): Promise<CertificateFontResponse[]> {
  return apiFetch('/api/v1/admin/certificate-fonts')
}

export function createCertificateFont(data: SaveCertificateFontRequest): Promise<CertificateFontResponse> {
  return apiFetch('/api/v1/admin/certificate-fonts', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCertificateFont(id: number, data: SaveCertificateFontRequest): Promise<CertificateFontResponse> {
  return apiFetch(`/api/v1/admin/certificate-fonts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteCertificateFont(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/certificate-fonts/${id}`, { method: 'DELETE' })
}
