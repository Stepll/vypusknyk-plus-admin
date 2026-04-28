import { makeAutoObservable, runInAction } from 'mobx'
import * as signalR from '@microsoft/signalr'
import * as api from '../api/chat'
import type { ChatConversationListItem, ChatMessageDto } from '../api/chat'

const HUB_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5272'}/hubs/chat`

class ChatStore {
  conversations: ChatConversationListItem[] = []
  messages = new Map<number, ChatMessageDto[]>()
  activeConversationId: number | null = null
  isWidgetOpen = false
  isConnected = false
  loading = false

  private connection: signalR.HubConnection | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get unreadCount() {
    return this.conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  }

  get activeMessages(): ChatMessageDto[] {
    return this.activeConversationId
      ? (this.messages.get(this.activeConversationId) ?? [])
      : []
  }

  get activeConversation(): ChatConversationListItem | null {
    return this.conversations.find(c => c.id === this.activeConversationId) ?? null
  }

  async connect(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build()

    conn.on('ReceiveMessage', (msg: ChatMessageDto) => {
      runInAction(() => {
        const existing = this.messages.get(msg.conversationId) ?? []
        this.messages.set(msg.conversationId, [...existing, msg])
      })
    })

    conn.on('ConversationUpdated', (conversation: ChatConversationListItem) => {
      runInAction(() => {
        const idx = this.conversations.findIndex(c => c.id === conversation.id)
        if (idx >= 0) {
          this.conversations[idx] = conversation
        } else {
          this.conversations.unshift(conversation)
        }
        this.conversations = [...this.conversations].sort((a, b) =>
          new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
        )
      })
    })

    conn.onreconnected(() => runInAction(() => { this.isConnected = true }))
    conn.onclose(() => runInAction(() => { this.isConnected = false }))

    await conn.start()
    runInAction(() => {
      this.connection = conn
      this.isConnected = true
    })

    await this.loadConversations()
  }

  async disconnect() {
    await this.connection?.stop()
    runInAction(() => {
      this.connection = null
      this.isConnected = false
    })
  }

  async loadConversations() {
    this.loading = true
    try {
      const data = await api.getConversations()
      runInAction(() => { this.conversations = data })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async openConversation(id: number) {
    runInAction(() => { this.activeConversationId = id })

    await this.connection?.invoke('JoinConversation', id)

    if (!this.messages.has(id)) {
      const msgs = await api.getConversationMessages(id)
      runInAction(() => { this.messages.set(id, msgs) })
    }

    await this.connection?.invoke('MarkRead', id)
    runInAction(() => {
      const conv = this.conversations.find(c => c.id === id)
      if (conv) conv.unreadCount = 0
    })
  }

  async sendMessage(text: string) {
    if (!this.activeConversationId || !text.trim()) return
    await this.connection?.invoke('SendMessage', this.activeConversationId, text)
  }

  setWidgetOpen(open: boolean) {
    this.isWidgetOpen = open
  }
}

export const chatStore = new ChatStore()
