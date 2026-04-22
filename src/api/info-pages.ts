import { apiFetch } from './client'
import type { InfoPageResponse, UpdateInfoPageRequest } from './types'

export const getInfoPages = () =>
  apiFetch<InfoPageResponse[]>('/api/v1/admin/info-pages')

export const updateInfoPage = (slug: string, data: UpdateInfoPageRequest) =>
  apiFetch<InfoPageResponse>(`/api/v1/admin/info-pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
