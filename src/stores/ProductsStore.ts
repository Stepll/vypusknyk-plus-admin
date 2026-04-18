import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/products'
import type { AdminProduct } from '../api/types'

class ProductsStore {
  products: AdminProduct[] = []
  total = 0
  page = 1
  pageSize = 20
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchProducts() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getProducts(this.page, this.pageSize)
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

  async deleteProduct(id: number) {
    await api.deleteProduct(id)
    await this.fetchProducts()
  }

  setPage(page: number) {
    this.page = page
    this.fetchProducts()
  }
}

export const productsStore = new ProductsStore()
