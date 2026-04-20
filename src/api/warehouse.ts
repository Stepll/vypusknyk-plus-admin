import { apiFetch } from './client'
import type {
  StockCategoryResponse,
  StockProductSummary,
  StockProductDetail,
  StockTransactionResponse,
  WarehouseStats,
  CreateStockTransactionRequest,
  PagedResponse,
} from './types'

export const getWarehouseStats = () =>
  apiFetch<WarehouseStats>('/api/v1/admin/warehouse/stats')

export const getWarehouseCategories = () =>
  apiFetch<StockCategoryResponse[]>('/api/v1/admin/warehouse/categories')

export interface WarehouseProductsParams {
  page?: number
  pageSize?: number
  categoryId?: number
  material?: string
  status?: string
  search?: string
}

export const getWarehouseProducts = (params: WarehouseProductsParams = {}) => {
  const p = new URLSearchParams()
  if (params.page) p.set('page', String(params.page))
  if (params.pageSize) p.set('pageSize', String(params.pageSize))
  if (params.categoryId) p.set('categoryId', String(params.categoryId))
  if (params.material) p.set('material', params.material)
  if (params.status) p.set('status', params.status)
  if (params.search) p.set('search', params.search)
  return apiFetch<PagedResponse<StockProductSummary>>(`/api/v1/admin/warehouse/products?${p}`)
}

export const getWarehouseProductDetail = (id: number) =>
  apiFetch<StockProductDetail>(`/api/v1/admin/warehouse/products/${id}`)

export const createStockTransaction = (data: CreateStockTransactionRequest) =>
  apiFetch<StockTransactionResponse>('/api/v1/admin/warehouse/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
