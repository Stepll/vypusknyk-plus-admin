export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface AdminOrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface AdminOrder {
  id: string
  orderNumber: string
  createdAt: string
  status: 'Accepted' | 'Production' | 'Shipped' | 'Delivered'
  total: number
  isAnonymous: boolean
  userId: number | null
  email: string | null
  comment: string | null
  payment: string
  recipient: { fullName: string; phone: string }
  delivery: { method: string; city: string | null; warehouse: string | null }
  items: AdminOrderItem[]
}

export interface AdminProduct {
  id: number
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  isDeleted: boolean
}

export interface AdminUser {
  id: number
  email: string
  fullName: string
  phone: string | null
  createdAt: string
  ordersCount: number
}
