export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ClassGroup {
  className: string
  names: string
}

export interface NamesData {
  school: string
  groups: ClassGroup[]
}

export interface RibbonCustomization {
  mainText: string
  school: string
  comment: string
  printType: string
  color: string
  material: string
  textColor: string
  extraTextColor: string
  font: string
  emblemKey: number
  designName: string
}

export interface AdminOrderItem {
  id: number
  name: string
  quantity: number
  price: number
  namesData: NamesData | null
  ribbonCustomization: RibbonCustomization | null
}

export interface AdminOrder {
  id: number
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

export interface ProductImageItem {
  id: number
  imageUrl: string
  isPreview: boolean
}

export interface AdminProductDetail {
  id: number
  name: string
  description: string
  price: number
  minOrder: number
  category: string
  color: string | null
  tags: string[]
  popular: boolean
  isNew: boolean
  imageUrl: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  images: ProductImageItem[]
}

export interface SaveProductRequest {
  name: string
  description: string
  price: number
  minOrder: number
  category: string
  color: string | null
  tags: string[]
  popular: boolean
  isNew: boolean
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
