import { apiFetch } from './client'
import type { DashboardResponse, DashboardStatsResponse, DashboardPeriod } from './types'

export function getDashboard(): Promise<DashboardResponse> {
  return apiFetch('/api/v1/admin/dashboard')
}

export function getDashboardStats(period: DashboardPeriod): Promise<DashboardStatsResponse> {
  return apiFetch(`/api/v1/admin/dashboard/stats?period=${period}`)
}
