import { apiFetch } from './client'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5272'

export async function getPageContent<T>(slug: string): Promise<T> {
  return apiFetch<T>(`/api/v1/admin/page-content/${slug}`)
}

export async function updatePageContent<T>(slug: string, data: T): Promise<T> {
  return apiFetch<T>(`/api/v1/admin/page-content/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function uploadPageContentImage(slug: string, field: string, file: File): Promise<string> {
  const token = localStorage.getItem('admin_token')
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(
    `${API_URL}/api/v1/admin/page-content/${slug}/images?field=${encodeURIComponent(field)}`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }
  )
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const json = await res.json()
  return json.url as string
}
