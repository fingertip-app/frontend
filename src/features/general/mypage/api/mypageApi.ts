import { getMyWishlists } from '@/features/wishlists/api/wishlistsApi'
import { getUserReviews } from '@/features/reviews/api/reviewsApi'

export interface UserStats {
  wishlistCount: number
  reviewCount: number
  couponCount: number
  pointBalance: number
}

/**
 * 일반 사용자 통계 조회 - 찜/리뷰는 충북 데이터 기준으로 직접 센다 (스프링 통계 API는
 * 충북 체험을 모르기 때문에 그대로 쓰면 숫자가 틀어진다). 쿠폰/포인트는 화면에 안 쓰여 0으로 둔다.
 */
export async function getUserStats(): Promise<UserStats> {
  const [wishlists, reviews] = await Promise.all([
    getMyWishlists().catch(() => []),
    getUserReviews(0).catch(() => []),
  ])
  return {
    wishlistCount: wishlists.length,
    reviewCount: reviews.length,
    couponCount: 0,
    pointBalance: 0,
  }
}

