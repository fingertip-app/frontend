import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import { getUser } from '@/features/users/api/usersApi'
import { apiPost, apiPut, apiDelete } from '@/services/api'
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
  const userIds = [...new Set(reviews.map((review) => review.userId))]
  const users = await Promise.all(
    userIds.map(async (userId) => [userId, await getUser(userId).catch(() => null)] as const),
  )
  const userById = new Map(users)

  const items: MasterReviewItem[] = reviews.map((review) => ({
    id: review.id,
    userName: userById.get(review.userId)?.nickname ?? '알 수 없음',
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

export interface CreateReplyRequest {
  replyContent: string
}

/**
 * 답글 작성
 * POST /reviews/{reviewId}/reply
 */
export async function createReviewReply(reviewId: number, replyContent: string): Promise<Review> {
  return apiPost<CreateReplyRequest, Review>(`/reviews/${reviewId}/reply`, { replyContent })
}

/**
 * 답글 수정
 * PUT /reviews/{reviewId}/reply
 */
export async function updateReviewReply(reviewId: number, replyContent: string): Promise<Review> {
  return apiPut<CreateReplyRequest, Review>(`/reviews/${reviewId}/reply`, { replyContent })
}

/**
 * 답글 삭제
 * DELETE /reviews/{reviewId}/reply
 */
export async function deleteReviewReply(reviewId: number): Promise<void> {
  return apiDelete<void>(`/reviews/${reviewId}/reply`)
}
