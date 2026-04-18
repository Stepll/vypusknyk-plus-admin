import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/orders'
import type { AdminOrder } from '../api/types'

class OrdersStore {
  orders: AdminOrder[] = []
  total = 0
  page = 1
  pageSize = 20
  statusFilter = ''
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchOrders() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getOrders(this.page, this.pageSize, this.statusFilter || undefined)
      runInAction(() => {
        this.orders = data.items
        this.total = data.total
      })
    } catch (e) {
      runInAction(() => { this.error = (e as Error).message })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async updateStatus(id: number, status: string) {
    await api.updateOrderStatus(id, status)
    await this.fetchOrders()
  }

  setPage(page: number) {
    this.page = page
    this.fetchOrders()
  }

  setStatusFilter(status: string) {
    this.statusFilter = status
    this.page = 1
    this.fetchOrders()
  }
}

export const ordersStore = new OrdersStore()
