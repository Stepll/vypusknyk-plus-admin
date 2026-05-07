import { apiFetch } from './client'

export interface AppSettingResponse {
  key: string
  value: string
  type: 'number' | 'boolean' | 'string'
  group: string
  label: string
  description?: string
  updatedAt: string
}

export interface UpdateAppSettingRequest {
  key: string
  value: string
}

export const GROUP_LABELS: Record<string, string> = {
  orders:      'Замовлення',
  store:       'Магазин',
  ribbon:      'Конструктор стрічок',
  badge:       'Конструктор значків',
  certificate: 'Конструктор грамот',
  contacts:    'Контакти та бренд',
}

export function getAppSettings(): Promise<AppSettingResponse[]> {
  return apiFetch('/api/v1/admin/settings')
}

export function updateAppSettings(updates: UpdateAppSettingRequest[]): Promise<void> {
  return apiFetch('/api/v1/admin/settings', { method: 'PUT', body: JSON.stringify(updates) })
}
