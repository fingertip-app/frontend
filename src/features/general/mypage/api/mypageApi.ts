import { apiGet } from '@/services/api'

export interface UserStats {
  wishlistCount: number
  reviewCount: number
  couponCount: number
  pointBalance: number
}

/**
 * 일반 사용자 통계 조회
 */
export async function getUserStats(): Promise<UserStats> {
  return apiGet<UserStats>('/users/me/stats')
}

