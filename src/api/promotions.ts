import { apiFetch } from './client'

export interface PromotionTargetDto {
  categoryId?: number
  categoryName?: string
  subcategoryId?: number
  subcategoryName?: string
}

export interface VolumeTierDto {
  id: number
  minQty: number
  discountType: string
  discountValue: number
}

export interface BundleItemDto {
  id: number
  subcategoryId: number
  subcategoryName: string
  requiredQty: number
}

export interface AdminPromotionResponse {
  id: number
  name: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  scope: 'Global' | 'Category' | 'Volume' | 'Bundle'
  targets: PromotionTargetDto[]
  volumeTiers: VolumeTierDto[]
  bundleItems: BundleItemDto[]
  minOrderAmount?: number
  startsAt?: string
  endsAt?: string
  isActive: boolean
  isOneTimePerUser: boolean
  createdAt: string
  status: 'active' | 'upcoming' | 'expired' | 'inactive'
}

export interface SaveVolumeTierRequest {
  minQty: number
  discountType: string
  discountValue: number
}

export interface SaveBundleItemRequest {
  subcategoryId: number
  requiredQty: number
}

export interface SavePromotionRequest {
  name: string
  description?: string
  discountType: string
  discountValue: number
  scope: string
  targetCategoryIds: number[]
  targetSubcategoryIds: number[]
  volumeTiers: SaveVolumeTierRequest[]
  bundleItems: SaveBundleItemRequest[]
  minOrderAmount?: number
  startsAt?: string
  endsAt?: string
  isActive: boolean
  isOneTimePerUser: boolean
}

export interface AdminPromoCodeResponse {
  id: number
  code: string
  displayName: string
  cardColor: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  minOrderAmount?: number
  maxUsages?: number
  usagesCount: number
  isOneTimePerUser: boolean
  startsAt?: string
  endsAt?: string
  isActive: boolean
  createdAt: string
  status: 'active' | 'upcoming' | 'expired' | 'inactive'
}

export interface SavePromoCodeRequest {
  code?: string
  displayName: string
  cardColor: string
  description?: string
  discountType: string
  discountValue: number
  minOrderAmount?: number
  maxUsages?: number
  isOneTimePerUser: boolean
  startsAt?: string
  endsAt?: string
  isActive: boolean
}

export const getAdminPromotions = (): Promise<AdminPromotionResponse[]> =>
  apiFetch('/api/v1/admin/promotions')

export const getAdminPromotion = (id: number): Promise<AdminPromotionResponse> =>
  apiFetch(`/api/v1/admin/promotions/${id}`)

export const createPromotion = (data: SavePromotionRequest): Promise<AdminPromotionResponse> =>
  apiFetch('/api/v1/admin/promotions', { method: 'POST', body: JSON.stringify(data) })

export const updatePromotion = (id: number, data: SavePromotionRequest): Promise<AdminPromotionResponse> =>
  apiFetch(`/api/v1/admin/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deletePromotion = (id: number): Promise<void> =>
  apiFetch(`/api/v1/admin/promotions/${id}`, { method: 'DELETE' })

export const getAdminPromoCodes = (): Promise<AdminPromoCodeResponse[]> =>
  apiFetch('/api/v1/admin/promo-codes')

export const createPromoCode = (data: SavePromoCodeRequest): Promise<AdminPromoCodeResponse> =>
  apiFetch('/api/v1/admin/promo-codes', { method: 'POST', body: JSON.stringify(data) })

export const updatePromoCode = (id: number, data: SavePromoCodeRequest): Promise<AdminPromoCodeResponse> =>
  apiFetch(`/api/v1/admin/promo-codes/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deletePromoCode = (id: number): Promise<void> =>
  apiFetch(`/api/v1/admin/promo-codes/${id}`, { method: 'DELETE' })
