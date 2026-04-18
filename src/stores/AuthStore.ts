import { makeAutoObservable, runInAction } from 'mobx'
import { login, type AdminAuthResponse } from '../api/auth'

const TOKEN_KEY = 'admin_token'
const ADMIN_KEY = 'admin_info'

class AuthStore {
  token: string | null = localStorage.getItem(TOKEN_KEY)
  admin: Omit<AdminAuthResponse, 'token'> | null = (() => {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  })()
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get isAuthenticated() {
    return !!this.token
  }

  async login(email: string, password: string) {
    this.loading = true
    this.error = null
    try {
      const res = await login(email, password)
      runInAction(() => {
        this.token = res.token
        this.admin = { id: res.id, email: res.email, fullName: res.fullName, isSuperAdmin: res.isSuperAdmin }
        localStorage.setItem(TOKEN_KEY, res.token)
        localStorage.setItem(ADMIN_KEY, JSON.stringify(this.admin))
      })
    } catch {
      runInAction(() => { this.error = 'Невірний email або пароль' })
      throw new Error(this.error ?? '')
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  logout() {
    this.token = null
    this.admin = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  }
}

export const authStore = new AuthStore()
