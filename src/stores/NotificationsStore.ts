import { makeAutoObservable, runInAction } from 'mobx'
import * as api from '../api/notifications'
import type { AdminNotificationDto } from '../api/notifications'

class NotificationsStore {
  notifications: AdminNotificationDto[] = []
  isLoaded = false

  constructor() {
    makeAutoObservable(this)
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length
  }

  handlePush(notification: AdminNotificationDto) {
    runInAction(() => {
      this.notifications = [notification, ...this.notifications]
    })
  }

  async load() {
    try {
      const data = await api.getMyNotifications(50)
      runInAction(() => {
        this.notifications = data
        this.isLoaded = true
      })
    } catch {
      // non-critical
    }
  }

  async markRead(id: number) {
    await api.markNotificationRead(id)
    runInAction(() => {
      const n = this.notifications.find(n => n.id === id)
      if (n) n.isRead = true
    })
  }

  async markAllRead() {
    await api.markAllNotificationsRead()
    runInAction(() => {
      this.notifications.forEach(n => { n.isRead = true })
    })
  }
}

export const notificationsStore = new NotificationsStore()
