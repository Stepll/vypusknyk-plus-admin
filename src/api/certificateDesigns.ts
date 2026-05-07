import { apiFetch } from './client'
import type { PagedResponse, AdminCertificateDesignItem } from './types'

export function getCertificateDesigns(page: number, pageSize: number): Promise<PagedResponse<AdminCertificateDesignItem>> {
  return apiFetch(`/api/v1/admin/certificate-designs?page=${page}&pageSize=${pageSize}`)
}

export function getCertificateDesignsByUser(userId: number): Promise<AdminCertificateDesignItem[]> {
  return apiFetch(`/api/v1/admin/certificate-designs/by-user/${userId}`)
}

export function deleteCertificateDesign(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/certificate-designs/${id}`, { method: 'DELETE' })
}
