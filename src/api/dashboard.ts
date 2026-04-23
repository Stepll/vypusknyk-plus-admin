import { apiFetch } from './client'
import type { DashboardResponse } from './types'

export function getDashboard(): Promise<DashboardResponse> {
  return apiFetch('/api/v1/admin/dashboard')
}
