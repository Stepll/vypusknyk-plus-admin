import { apiFetch } from './client'
import type { CertificateTemplateResponse, SaveCertificateTemplateRequest, SaveCertificateTemplateLayoutRequest } from './types'

export function getCertificateTemplates(): Promise<CertificateTemplateResponse[]> {
  return apiFetch('/api/v1/admin/certificate-templates')
}

export function createCertificateTemplate(data: SaveCertificateTemplateRequest): Promise<CertificateTemplateResponse> {
  return apiFetch('/api/v1/admin/certificate-templates', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCertificateTemplate(id: number, data: SaveCertificateTemplateRequest): Promise<CertificateTemplateResponse> {
  return apiFetch(`/api/v1/admin/certificate-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteCertificateTemplate(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/certificate-templates/${id}`, { method: 'DELETE' })
}

export function uploadCertificateTemplateImage(id: number, file: File): Promise<CertificateTemplateResponse> {
  const form = new FormData()
  form.append('image', file)
  return apiFetch(`/api/v1/admin/certificate-templates/${id}/image`, { method: 'POST', body: form })
}

export function saveCertificateTemplateLayout(id: number, data: SaveCertificateTemplateLayoutRequest): Promise<CertificateTemplateResponse> {
  return apiFetch(`/api/v1/admin/certificate-templates/${id}/layout`, { method: 'PUT', body: JSON.stringify(data) })
}

export function getCertificateTemplateById(id: number): Promise<CertificateTemplateResponse> {
  return apiFetch(`/api/v1/admin/certificate-templates/${id}`)
}
