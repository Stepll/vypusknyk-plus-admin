import { apiFetch } from './client';

export interface AdminNotificationDto {
  id: number;
  triggerType: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationTriggerConfigResponse {
  triggerType: string;
  displayName: string;
  extraConfig?: string;
  emailEnabled: boolean;
  emailRecipients: string[];
  telegramEnabled: boolean;
  telegramUserIds: string[];
  telegramGroupEnabled: boolean;
  systemEnabled: boolean;
  systemAdminIds: number[];
}

export interface UpdateNotificationTriggerConfigRequest {
  emailEnabled: boolean;
  emailRecipients: string[];
  telegramEnabled: boolean;
  telegramUserIds: string[];
  telegramGroupEnabled: boolean;
  systemEnabled: boolean;
  systemAdminIds: number[];
}

export const getMyNotifications = (limit = 50) =>
  apiFetch<AdminNotificationDto[]>(`/api/v1/admin/notifications?limit=${limit}`);

export const getUnreadCount = () =>
  apiFetch<number>('/api/v1/admin/notifications/unread-count');

export const markNotificationRead = (id: number) =>
  apiFetch<void>(`/api/v1/admin/notifications/${id}/read`, { method: 'POST' });

export const markAllNotificationsRead = () =>
  apiFetch<void>('/api/v1/admin/notifications/read-all', { method: 'POST' });

export const getTriggerConfigs = () =>
  apiFetch<NotificationTriggerConfigResponse[]>('/api/v1/admin/notification-triggers');

export const updateTriggerConfig = (triggerType: string, data: UpdateNotificationTriggerConfigRequest) =>
  apiFetch<void>(`/api/v1/admin/notification-triggers/${triggerType}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
