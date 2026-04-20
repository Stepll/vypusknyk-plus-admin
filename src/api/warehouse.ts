import { apiFetch } from './client'
import type {
  StockCategoryResponse,
  StockSubcategoryResponse,
  StockProductSummary,
  StockProductDetail,
  StockTransactionResponse,
  WarehouseStats,
  CreateStockTransactionRequest,
  CreateStockProductRequest,
  PagedResponse,
} from './types'

export const getWarehouseStats = () =>
  apiFetch<WarehouseStats>('/api/v1/admin/warehouse/stats')

export const getWarehouseCategories = () =>
  apiFetch<StockCategoryResponse[]>('/api/v1/admin/warehouse/categories')

export const getWarehouseSubcategories = (categoryId?: number) => {
  const p = categoryId ? `?categoryId=${categoryId}` : ''
  return apiFetch<StockSubcategoryResponse[]>(`/api/v1/admin/warehouse/subcategories${p}`)
}

export interface WarehouseProductsParams {
  page?: number
  pageSize?: number
  categoryId?: number
  subcategoryId?: number
  material?: string
  status?: string
  search?: string
  color?: string
}

export const getWarehouseProducts = (params: WarehouseProductsParams = {}) => {
  const p = new URLSearchParams()
  if (params.page) p.set('page', String(params.page))
  if (params.pageSize) p.set('pageSize', String(params.pageSize))
  if (params.categoryId) p.set('categoryId', String(params.categoryId))
  if (params.subcategoryId) p.set('subcategoryId', String(params.subcategoryId))
  if (params.material) p.set('material', params.material)
  if (params.status) p.set('status', params.status)
  if (params.search) p.set('search', params.search)
  if (params.color) p.set('color', params.color)
  return apiFetch<PagedResponse<StockProductSummary>>(`/api/v1/admin/warehouse/products?${p}`)
}

export const getWarehouseProductDetail = (id: number) =>
  apiFetch<StockProductDetail>(`/api/v1/admin/warehouse/products/${id}`)

export const createWarehouseProduct = (data: CreateStockProductRequest) =>
  apiFetch<StockProductSummary>('/api/v1/admin/warehouse/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const createStockTransaction = (data: CreateStockTransactionRequest) =>
  apiFetch<StockTransactionResponse>('/api/v1/admin/warehouse/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
