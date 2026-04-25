import { apiFetch } from './client'
import type {
  ProductCategoryResponse,
  SaveProductCategoryRequest,
  SaveProductSubcategoryRequest,
  ProductSubcategoryResponse,
} from './types'

export function getProductCategories(): Promise<ProductCategoryResponse[]> {
  return apiFetch('/api/v1/admin/product-categories')
}

export function createProductCategory(data: SaveProductCategoryRequest): Promise<ProductCategoryResponse> {
  return apiFetch('/api/v1/admin/product-categories', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProductCategory(id: number, data: SaveProductCategoryRequest): Promise<ProductCategoryResponse> {
  return apiFetch(`/api/v1/admin/product-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProductCategory(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/product-categories/${id}`, { method: 'DELETE' })
}

export function createProductSubcategory(categoryId: number, data: SaveProductSubcategoryRequest): Promise<ProductSubcategoryResponse> {
  return apiFetch(`/api/v1/admin/product-categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateProductSubcategory(id: number, data: SaveProductSubcategoryRequest): Promise<ProductSubcategoryResponse> {
  return apiFetch(`/api/v1/admin/product-categories/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProductSubcategory(id: number): Promise<void> {
  return apiFetch(`/api/v1/admin/product-categories/subcategories/${id}`, { method: 'DELETE' })
}
