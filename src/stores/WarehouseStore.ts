import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/warehouse'
import type {
  StockCategoryResponse,
  StockProductSummary,
  StockProductDetail,
  WarehouseStats,
  CreateStockTransactionRequest,
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
  selectedProduct: StockProductDetail | null = null
  productDetailLoading = false

  categoryFilter = ''
  materialFilter = ''
  statusFilter = ''
  search = ''

  constructor() {
    makeAutoObservable(this)
  }

  async fetchStats() {
    this.statsLoading = true
    try {
      const data = await api.getWarehouseStats()
      runInAction(() => { this.stats = data })
    } catch {
      // ignore stats errors silently
    } finally {
      runInAction(() => { this.statsLoading = false })
    }
  }

  async fetchCategories() {
    try {
      const data = await api.getWarehouseCategories()
      runInAction(() => { this.categories = data })
    } catch {
      // ignore
    }
  }

  async fetchProducts() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getWarehouseProducts({
        page: this.page,
        pageSize: this.pageSize,
        categoryId: this.categoryFilter ? Number(this.categoryFilter) : undefined,
        material: this.materialFilter || undefined,
        status: this.statusFilter || undefined,
        search: this.search || undefined,
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
    this.productDetailLoading = true
    this.selectedProduct = null
    try {
      const data = await api.getWarehouseProductDetail(id)
      runInAction(() => { this.selectedProduct = data })
    } catch {
      // ignore
    } finally {
      runInAction(() => { this.productDetailLoading = false })
    }
  }

  async addTransaction(req: CreateStockTransactionRequest) {
    await api.createStockTransaction(req)
    await Promise.all([this.fetchStats(), this.fetchProducts()])
  }

  setPage(page: number) {
    this.page = page
    this.fetchProducts()
  }

  setCategoryFilter(v: string) {
    this.categoryFilter = v
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

  setSearch(v: string) {
    this.search = v
    this.page = 1
    this.fetchProducts()
  }
}

export const warehouseStore = new WarehouseStore()
