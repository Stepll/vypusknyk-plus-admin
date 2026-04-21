import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/deliveries'
import type { DeliverySummary, DeliveryDetail, SupplierResponse } from '../api/types'

class DeliveryStore {
  deliveries: DeliverySummary[] = []
  total = 0
  page = 1
  pageSize = 20
  loading = false
  error: string | null = null

  suppliers: SupplierResponse[] = []
  deliveryDetails = new Map<number, DeliveryDetail>()
  detailLoading = new Set<number>()

  statusFilter = ''
  supplierFilter = ''
  search = ''

  constructor() {
    makeAutoObservable(this)
  }

  async fetchSuppliers() {
    try {
      const data = await api.getSuppliers()
      runInAction(() => { this.suppliers = data })
    } catch { /* ignore */ }
  }

  async fetchDeliveries() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getDeliveries({
        page: this.page,
        pageSize: this.pageSize,
        status: this.statusFilter || undefined,
        supplierId: this.supplierFilter ? Number(this.supplierFilter) : undefined,
        search: this.search || undefined,
      })
      runInAction(() => {
        this.deliveries = data.items
        this.total = data.total
      })
    } catch (e) {
      runInAction(() => { this.error = (e as Error).message })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async fetchDeliveryDetail(id: number) {
    if (this.detailLoading.has(id)) return
    runInAction(() => { this.detailLoading.add(id) })
    try {
      const data = await api.getDeliveryDetail(id)
      runInAction(() => { this.deliveryDetails.set(id, data) })
    } finally {
      runInAction(() => { this.detailLoading.delete(id) })
    }
  }

  async receiveItem(deliveryId: number, itemId: number, qty: number, date: string, note: string) {
    await api.receiveDeliveryItem(deliveryId, itemId, { quantity: qty, date, note: note || null })
    await Promise.all([this.fetchDeliveryDetail(deliveryId), this.fetchDeliveries()])
  }

  async receiveAll(deliveryId: number, date: string) {
    await api.receiveAllDeliveryItems(deliveryId, date)
    await Promise.all([this.fetchDeliveryDetail(deliveryId), this.fetchDeliveries()])
  }

  setPage(page: number) {
    this.page = page
    this.fetchDeliveries()
  }

  setStatusFilter(v: string) {
    this.statusFilter = v
    this.page = 1
    this.fetchDeliveries()
  }

  setSupplierFilter(v: string) {
    this.supplierFilter = v
    this.page = 1
    this.fetchDeliveries()
  }

  setSearch(v: string) {
    this.search = v
    this.page = 1
    this.fetchDeliveries()
  }
}

export const deliveryStore = new DeliveryStore()
