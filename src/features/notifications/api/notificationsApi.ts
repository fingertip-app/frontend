import { apiGet, apiPatch, apiDelete } from '@/services/api'
import type { Notification } from '@/types/api'

/**
 * 사용자의 알림 목록 조회
 * GET /notifications/user/{userId}
 */
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  return apiGet<Notification[]>(`/notifications/user/${userId}`)
}

/**
 * 미읽은 알림 목록 조회
 * GET /notifications/user/{userId}/unread
 */
export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  return apiGet<Notification[]>(`/notifications/user/${userId}/unread`)
}

/**
 * 미읽은 알림 개수 조회
 * GET /notifications/user/{userId}/unread-count
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  return apiGet<number>(`/notifications/user/${userId}/unread-count`)
}

/**
 * 알림 읽음 표시
 * PUT /notifications/{notificationId}/read
 */
export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  return apiPatch<void, Notification>(`/notifications/${notificationId}/read`)
}

/**
 * 모든 알림 읽음 표시
 * PUT /notifications/user/{userId}/read-all
 */
export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  return apiPatch<void, void>(`/notifications/user/${userId}/read-all`)
}

/**
 * 알림 삭제
 * DELETE /notifications/{notificationId}
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  return apiDelete(`/notifications/${notificationId}`)
}
