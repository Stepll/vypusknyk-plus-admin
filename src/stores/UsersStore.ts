import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/users'
import type { AdminUser } from '../api/types'

class UsersStore {
  users: AdminUser[] = []
  total = 0
  page = 1
  pageSize = 20
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchUsers() {
    this.loading = true
    this.error = null
    try {
      const data = await api.getUsers(this.page, this.pageSize)
      runInAction(() => {
        this.users = data.items
        this.total = data.total
      })
    } catch (e) {
      runInAction(() => { this.error = (e as Error).message })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  setPage(page: number) {
    this.page = page
    this.fetchUsers()
  }
}

export const usersStore = new UsersStore()
