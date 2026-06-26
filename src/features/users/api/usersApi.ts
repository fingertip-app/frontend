import { apiGet } from '@/services/api'
import type { UserProfile } from '@/features/auth/types'

/**
 * 사용자 ID로 사용자 정보 조회
 * GET /users/{userId}
 */
export async function getUser(userId: number): Promise<UserProfile> {
  return apiGet<UserProfile>(`/users/${userId}`)
}
