import { apiFetch } from './client'
import type {
  DashboardResponse,
  DashboardStatsResponse,
  DashboardPeriod,
  DashboardChartPeriod,
  DashboardChartResponse,
  DashboardDistributionsResponse,
  DashboardTopPeriod,
  DashboardTopMetric,
  DashboardTopItemsResponse,
  DashboardLowStockResponse,
  DashboardDesignsBlock,
  DesignsPeriod,
  SalesByCategoryResponse,
} from './types'

export function getDashboard(): Promise<DashboardResponse> {
  return apiFetch('/api/v1/admin/dashboard')
}

export function getDashboardStats(period: DashboardPeriod): Promise<DashboardStatsResponse> {
  return apiFetch(`/api/v1/admin/dashboard/stats?period=${period}`)
}

export function getDashboardChart(period: DashboardChartPeriod): Promise<DashboardChartResponse> {
  return apiFetch(`/api/v1/admin/dashboard/chart?period=${period}`)
}

export function getDashboardDistributions(period: DashboardChartPeriod): Promise<DashboardDistributionsResponse> {
  return apiFetch(`/api/v1/admin/dashboard/distributions?period=${period}`)
}

export function getDashboardTopItems(period: DashboardTopPeriod, metric: DashboardTopMetric): Promise<DashboardTopItemsResponse> {
  return apiFetch(`/api/v1/admin/dashboard/top-items?period=${period}&metric=${metric}`)
}

export function getDashboardLowStock(): Promise<DashboardLowStockResponse> {
  return apiFetch('/api/v1/admin/dashboard/low-stock')
}

export function getDashboardDesigns(period: DesignsPeriod): Promise<DashboardDesignsBlock> {
  return apiFetch(`/api/v1/admin/dashboard/designs?period=${period}`)
}

export type SalesCategoryPeriod = 'week' | 'month' | 'year' | 'all'

export function getDashboardSalesByCategory(period: SalesCategoryPeriod): Promise<SalesByCategoryResponse> {
  return apiFetch(`/api/v1/admin/dashboard/sales-by-category?period=${period}`)
}
