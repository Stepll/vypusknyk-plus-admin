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

export interface AdminUserOrderSummary {
  id: number
  orderNumber: string
  status: string
  total: number
  itemsCount: number
  createdAt: string
}

export interface AdminUserSavedDesign {
  id: number
  designName: string
  savedAt: string
}

export interface AdminSavedDesignItem {
  id: number
  designName: string
  savedAt: string
  userId: number
  userFullName: string
  userEmail: string
  state: RibbonState
}

export interface RibbonClassGroup {
  className: string
  names: string
}

export interface RibbonState {
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
  classes: RibbonClassGroup[]
}

export interface AdminSavedDesignDetail extends AdminSavedDesignItem {
  state: RibbonState
}

export interface RoleInfo {
  id: number
  name: string
  color: string
  isSuperAdmin: boolean
  pages: string[]
}

export interface RoleResponse {
  id: number
  name: string
  color: string
  pages: string[]
  isSuperAdmin: boolean
  createdAt: string
}

export interface CreateRoleRequest {
  name: string
  color: string
  pages: string[]
}

export interface UpdateRoleRequest {
  name: string
  color: string
  pages: string[]
}

export interface AdminAdminItem {
  id: number
  email: string
  fullName: string
  createdAt: string
  role?: RoleInfo
}

export interface AdminAdminDetail {
  id: number
  email: string
  fullName: string
  createdAt: string
  lastLoginAt: string | null
  role?: RoleInfo
}

export interface CreateAdminRequest {
  email: string
  fullName: string
  password: string
  roleId?: number | null
}

export interface AdminUserDetail {
  id: number
  email: string
  fullName: string
  phone: string | null
  createdAt: string
  orders: AdminUserOrderSummary[]
  savedDesigns: AdminUserSavedDesign[]
}

// Warehouse / Stock types
export type StockMaterial = 'Atlas' | 'Satin' | 'Silk'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface StockCategoryResponse {
  id: number
  name: string
  order: number
}

export interface StockSubcategoryResponse {
  id: number
  categoryId: number
  name: string
  order: number
}

export interface StockProductSummary {
  id: number
  subcategoryId: number
  subcategoryName: string
  categoryId: number
  categoryName: string
  name: string
  hasColor: boolean
  hasMaterial: boolean
  totalStock: number
  variantCount: number
  status: StockStatus
}

export interface StockVariantResponse {
  id: number
  material: StockMaterial
  color: string
  currentStock: number
}

export interface StockTransactionResponse {
  id: number
  variantId: number
  deliveryItemId: number | null
  deliveryId: number | null
  orderId: number | null
  orderNumber: string | null
  orderCreatedAt: string | null
  material: StockMaterial
  color: string
  type: 'income' | 'outcome'
  quantity: number
  date: string
  note: string
  createdAt: string
}

export interface StockProductDetail {
  id: number
  subcategoryId: number
  subcategoryName: string
  categoryId: number
  categoryName: string
  name: string
  hasColor: boolean
  hasMaterial: boolean
  variants: StockVariantResponse[]
  transactions: StockTransactionResponse[]
}

export interface WarehouseStats {
  totalStock: number
  outOfStockCount: number
  lowStockCount: number
  categoryCount: number
  productCount: number
}

export interface CreateStockTransactionRequest {
  productId: number
  material: StockMaterial
  color: string
  type: 'income' | 'outcome'
  quantity: number
  date: string
  note: string
  orderId?: number | null
}

export interface CreateStockProductRequest {
  subcategoryId: number
  name: string
  description?: string
  hasColor: boolean
  hasMaterial: boolean
}

// ─── Delivery / Supplier types ────────────────────────────────────────────────

export interface SupplierResponse {
  id: number
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  address: string | null
  notes: string | null
}

export interface SaveSupplierRequest {
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  address: string | null
  notes: string | null
}

export type DeliveryStatus = 'pending' | 'partial' | 'received'

export interface DeliverySummary {
  id: number
  number: string
  supplierId: number | null
  supplierName: string | null
  expectedDate: string
  status: DeliveryStatus
  note: string | null
  itemCount: number
  totalExpectedQty: number
  totalReceivedQty: number
  createdAt: string
}

export interface ReceiveTransactionInfo {
  id: number
  quantity: number
  date: string
  note: string
  createdAt: string
}

export interface DeliveryItemResponse {
  id: number
  deliveryId: number
  productId: number
  productName: string
  subcategoryName: string
  categoryName: string
  hasColor: boolean
  hasMaterial: boolean
  material: string
  color: string
  expectedQty: number
  receivedQty: number
  receivedAt: string | null
  receiveHistory: ReceiveTransactionInfo[]
}

export interface DeliveryDetail {
  id: number
  number: string
  supplierId: number | null
  supplierName: string | null
  expectedDate: string
  status: DeliveryStatus
  note: string | null
  createdAt: string
  items: DeliveryItemResponse[]
}

export interface CreateDeliveryItemRequest {
  productId: number
  material: string
  color: string
  expectedQty: number
}

export interface CreateDeliveryRequest {
  supplierId: number | null
  expectedDate: string
  note: string | null
  items: CreateDeliveryItemRequest[]
}

export interface ReceiveDeliveryItemRequest {
  quantity: number
  date: string
  note: string | null
}


// ─── Dashboard chart + distributions ─────────────────────────────────────────

export type DashboardChartPeriod = 'month' | 'year'

export interface DashboardChartPoint2 {
  date: string
  orders: number
  revenue: number
}

export interface DashboardChartResponse {
  points: DashboardChartPoint2[]
}

export interface DashboardDistributionItem {
  key: string
  count: number
}

export interface DashboardDistributionsResponse {
  deliveryMethods: DashboardDistributionItem[]
  materials: DashboardDistributionItem[]
  colors: DashboardDistributionItem[]
}

// ─── Dashboard stats (block 1) ────────────────────────────────────────────────

export type DashboardPeriod = 'day' | 'week' | 'month' | 'year'

export interface DashboardStatMetric {
  current: number
  previous: number
  changePercent: number
  sparkline: number[]
}

export interface DashboardStatsResponse {
  revenue: DashboardStatMetric
  ordersCount: DashboardStatMetric
  avgCheck: DashboardStatMetric
}

// ─── Dashboard types ──────────────────────────────────────────────────────────

export interface DashboardRevenueBlock {
  currentMonth: number
  previousMonth: number
  changePercent: number
  avgProductionDays: number
}

export interface DashboardStatusCount {
  statusId: number
  statusName: string
  statusColor: string
  sortOrder: number
  isFinal: boolean
  count: number
}

export interface DashboardOrdersBlock {
  statusCounts: DashboardStatusCount[]
  newThisWeek: number
  stuck: number
}

export interface DashboardRecentOrder {
  id: number
  orderNumber: string
  clientName: string | null
  total: number
  statusName: string
  statusColor: string
  createdAt: string
}

export interface DashboardChartPoint {
  date: string
  orders: number
  visits: number
}

export interface DashboardAwaitingDelivery {
  id: number
  number: string
  supplierName: string | null
  status: string
  totalExpected: number
  totalReceived: number
}

export interface DashboardUpcomingDelivery {
  id: number
  number: string
  supplierName: string | null
  expectedDate: string
}

export interface DashboardDeliveriesBlock {
  awaiting: DashboardAwaitingDelivery[]
  upcoming: DashboardUpcomingDelivery[]
}

export interface DashboardTopItem {
  key: string
  count: number
}

export interface DashboardDesignsBlock {
  savedThisWeek: number
  topColors: DashboardTopItem[]
  topEmblems: DashboardTopItem[]
  topFonts: DashboardTopItem[]
}

export interface DashboardTopProduct {
  name: string
  quantity: number
}

export interface DashboardTopCategoryBlock {
  category: string
  totalSold: number
  products: DashboardTopProduct[]
}

export interface DashboardResponse {
  revenue: DashboardRevenueBlock
  orders: DashboardOrdersBlock
  chart: DashboardChartPoint[]
  deliveries: DashboardDeliveriesBlock
  designs: DashboardDesignsBlock
  topProducts: DashboardTopCategoryBlock[]
  recentOrders: DashboardRecentOrder[]
}

export interface InfoPageResponse {
  id: number
  slug: string
  title: string
  content: string
  order: number
  updatedAt: string
}

export interface UpdateInfoPageRequest {
  title: string
  content: string
}
