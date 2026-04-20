import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/warehouse'
import type {
  StockCategoryResponse,
  StockSubcategoryResponse,
  StockProductSummary,
  StockProductDetail,
  WarehouseStats,
  CreateStockTransactionRequest,
  CreateStockProductRequest,
} from '../api/types'

class WarehouseStore {
  products: StockProductSummary[] = []
  total = 0
  page = 1
  pageSize = 50
  loading = false
  statsLoading = false
  error: string | null = null

  stats: WarehouseStats | null = null
  categories: StockCategoryResponse[] = []
  subcategories: StockSubcategoryResponse[] = []
  allSubcategories: StockSubcategoryResponse[] = []

  productDetails = new Map<number, StockProductDetail>()
  productDetailsLoading = new Set<number>()
  modalProductId: number | null = null

  categoryFilter = ''
  subcategoryFilter = ''
  materialFilter = ''
  statusFilter = ''
  colorFilter = ''
  search = ''

  constructor() {
    makeAutoObservable(this)
  }

  async fetchStats() {
    this.statsLoading = true
    try {
      const data = await api.getWarehouseStats()
      runInAction(() => { this.stats = data })
    } finally {
      runInAction(() => { this.statsLoading = false })
    }
  }

  async fetchCategories() {
    try {
      const [cats, subs] = await Promise.all([
        api.getWarehouseCategories(),
        api.getWarehouseSubcategories(),
      ])
      runInAction(() => {
        this.categories = cats
        this.allSubcategories = subs
        this.subcategories = subs
      })
    } catch { /* ignore */ }
  }

  async fetchSubcategories(categoryId?: number) {
    try {
      const data = await api.getWarehouseSubcategories(categoryId)
      runInAction(() => { this.subcategories = data })
    } catch { /* ignore */ }
  }

  async fetchProducts() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getWarehouseProducts({
        page: this.page,
        pageSize: this.pageSize,
        categoryId: this.categoryFilter ? Number(this.categoryFilter) : undefined,
        subcategoryId: this.subcategoryFilter ? Number(this.subcategoryFilter) : undefined,
        material: this.materialFilter || undefined,
        status: this.statusFilter || undefined,
        search: this.search || undefined,
        color: this.colorFilter || undefined,
      })
      runInAction(() => {
        this.products = data.items
        this.total = data.total
      })
    } catch (e) {
      runInAction(() => { this.error = (e as Error).message })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async fetchProductDetail(id: number) {
    if (this.productDetailsLoading.has(id)) return
    runInAction(() => { this.productDetailsLoading.add(id) })
    try {
      const data = await api.getWarehouseProductDetail(id)
      runInAction(() => { this.productDetails.set(id, data) })
    } finally {
      runInAction(() => { this.productDetailsLoading.delete(id) })
    }
  }

  async addTransaction(req: CreateStockTransactionRequest) {
    await api.createStockTransaction(req)
    await Promise.all([this.fetchStats(), this.fetchProducts()])
    if (this.productDetails.has(req.productId))
      await this.fetchProductDetail(req.productId)
  }

  async createProduct(req: CreateStockProductRequest) {
    await api.createWarehouseProduct(req)
    await this.fetchProducts()
  }

  setPage(page: number) {
    this.page = page
    this.fetchProducts()
  }

  setCategoryFilter(v: string) {
    this.categoryFilter = v
    this.subcategoryFilter = ''
    this.subcategories = v
      ? this.allSubcategories.filter(s => s.categoryId === Number(v))
      : this.allSubcategories
    this.page = 1
    this.fetchProducts()
  }

  setSubcategoryFilter(v: string) {
    this.subcategoryFilter = v
    this.page = 1
    this.fetchProducts()
  }

  setMaterialFilter(v: string) {
    this.materialFilter = v
    this.page = 1
    this.fetchProducts()
  }

  setStatusFilter(v: string) {
    this.statusFilter = v
    this.page = 1
    this.fetchProducts()
  }

  setColorFilter(v: string) {
    this.colorFilter = v
    this.page = 1
    this.fetchProducts()
  }

  setSearch(v: string) {
    this.search = v
    this.page = 1
    this.fetchProducts()
  }
}

export const warehouseStore = new WarehouseStore()
