import { apiFetch } from './client'
import type { RoleResponse, CreateRoleRequest, UpdateRoleRequest } from './types'

export const getRoles = () =>
  apiFetch<RoleResponse[]>('/api/v1/admin/roles')

export const createRole = (data: CreateRoleRequest) =>
  apiFetch<RoleResponse>('/api/v1/admin/roles', { method: 'POST', body: JSON.stringify(data) })

export const updateRole = (id: number, data: UpdateRoleRequest) =>
  apiFetch<RoleResponse>(`/api/v1/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteRole = (id: number) =>
  apiFetch<void>(`/api/v1/admin/roles/${id}`, { method: 'DELETE' })
