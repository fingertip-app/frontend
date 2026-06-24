import { apiGet } from '@/services/api'

export interface UserStats {
  wishlistCount: number
  reviewCount: number
  couponCount: number
  pointBalance: number
}

export interface ArtisanStats {
  pendingReservationCount: number
  activeExperienceCount: number
  monthlyRevenue: number
}

/**
 * 일반 사용자 통계 조회
 */
export async function getUserStats(): Promise<UserStats> {
  return apiGet<UserStats>('/users/me/stats')
}

/**
 * 장인 통계 조회
 */
export async function getArtisanStats(): Promise<ArtisanStats> {
  return apiGet<ArtisanStats>('/artisans/me/stats')
}
