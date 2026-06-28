import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import type { Review } from '@/types/api'
import type { MasterReviewItem, MasterReviewsData } from './types'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

export async function getMasterReviews(): Promise<MasterReviewsData> {
  const artisan = await getMyArtisan()
  const experiences = await getArtisanExperiences(artisan.id)
  const experienceById = new Map(experiences.map((experience) => [experience.id, experience]))
  const reviewLists = await Promise.all(
    experiences.map((experience) => getExperienceReviews(experience.id).catch(() => [])),
  )
  const reviews = reviewLists.flat()
  // 충북 리뷰는 작성자를 Supabase user_id(문자열)로 저장하고, Review.userId는 숫자형이라
  // 항상 0으로 채워둔다(adaptReview) - 스프링 /users/{id} 조회로 매칭할 방법이 없어 생략한다.

  const items: MasterReviewItem[] = reviews.map((review) => ({
    id: review.id,
    userName: '익명',
    createdAt: review.createdAt,
    date: formatDate(review.createdAt),
    rating: review.rating,
    className: experienceById.get(review.experienceId)?.title ?? '체험',
    content: review.content,
    replyContent: review.replyContent,
    repliedAt: review.repliedAt,
  }))

  return {
    averageRating: getAverageRating(reviews),
    reviewCount: reviews.length,
    reviews: items,
  }
}

// 충북 리뷰의 id는 1, 2, 3... 처럼 작은 숫자라 스프링의 실제 리뷰 id와 겹친다.
// 충북 백엔드에는 답글 저장 기능이 없어서, 이 함수들을 그대로 두면 엉뚱한 스프링 리뷰에
// 답글이 달리는 사고가 난다. 충북 답글 기능을 만들기 전까지는 막아둔다(스코프 제외).
const REPLY_NOT_SUPPORTED = '답글 기능은 아직 지원되지 않습니다.'

export async function createReviewReply(_reviewId: number, _replyContent: string): Promise<Review> {
  throw new Error(REPLY_NOT_SUPPORTED)
}

export async function updateReviewReply(_reviewId: number, _replyContent: string): Promise<Review> {
  throw new Error(REPLY_NOT_SUPPORTED)
}

export async function deleteReviewReply(_reviewId: number): Promise<void> {
  throw new Error(REPLY_NOT_SUPPORTED)
}
