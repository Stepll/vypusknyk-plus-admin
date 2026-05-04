import { apiFetch } from './client'

export const TASK_TYPE_LABELS: Record<string, string> = {
  Registration: 'Реєстрація',
  FirstOrder: 'Перше замовлення',
  ProfileComplete: 'Заповнений профіль',
  OrdersCount: 'Кількість замовлень',
  TotalSpent: 'Загальна сума витрат',
  OrderAmount: 'Сума одного замовлення',
  CategoryOrders: 'Замовлення з категорії',
}

export const TASK_TYPE_WITH_TARGET: Record<string, string> = {
  OrdersCount: 'шт.',
  TotalSpent: '₴',
  OrderAmount: '₴',
  CategoryOrders: 'замовлень',
}

export const TASK_TYPE_NEEDS_CATEGORY = new Set(['CategoryOrders'])

export interface AdminTaskResponse {
  id: number
  name: string
  description?: string
  taskType: string
  targetValue: number
  targetCategoryId?: number
  targetCategoryName?: string
  rewardPromoCodeId: number
  rewardPromoCodeDisplayName: string
  rewardPromoCodeCardColor: string
  rewardDiscountType: string
  rewardDiscountValue: number
  isVisibleToGuests: boolean
  endsAt?: string
  isActive: boolean
  sortOrder: number
  completionsCount: number
  createdAt: string
}

export interface SaveTaskRequest {
  name: string
  description?: string
  taskType: string
  targetValue: number
  targetCategoryId?: number
  rewardPromoCodeId: number
  isVisibleToGuests: boolean
  endsAt?: string
  isActive: boolean
  sortOrder: number
}

export const getAdminTasks = (): Promise<AdminTaskResponse[]> =>
  apiFetch('/api/v1/admin/tasks')

export const createTask = (data: SaveTaskRequest): Promise<AdminTaskResponse> =>
  apiFetch('/api/v1/admin/tasks', { method: 'POST', body: JSON.stringify(data) })

export const updateTask = (id: number, data: SaveTaskRequest): Promise<AdminTaskResponse> =>
  apiFetch(`/api/v1/admin/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTask = (id: number): Promise<void> =>
  apiFetch(`/api/v1/admin/tasks/${id}`, { method: 'DELETE' })
