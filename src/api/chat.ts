import { apiFetch } from './client'

export interface ChatMessageDto {
  id: number
  conversationId: number
  senderType: 'User' | 'Admin'
  senderId: number
  text: string
  sentAt: string
  isRead: boolean
}

export interface ChatConversationListItem {
  id: number
  userId: number
  userFullName: string
  userEmail: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  isClosedByAdmin: boolean
}

export const getConversations = () =>
  apiFetch<ChatConversationListItem[]>('/api/v1/admin/chats')

export const getConversationMessages = (id: number) =>
  apiFetch<ChatMessageDto[]>(`/api/v1/admin/chats/${id}/messages`)
