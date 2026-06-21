import { apiGet, apiPost, apiDelete } from '@/services/api'
import type { Review } from '@/types/api'

/**
 * 리뷰 작성 요청 DTO
 * 실제 backend ReviewRequest와 일치
 */
export interface CreateReviewRequest {
  reservationId?: number
  experienceId: number
  rating: number // 1-5
  content?: string
  imageUrl?: string
  newKnowledge?: string
}

/**
 * 리뷰 작성
 * POST /reviews
 */
export async function createReview(req: CreateReviewRequest): Promise<Review> {
  return apiPost<CreateReviewRequest, Review>('/reviews', req)
}

/**
 * 리뷰 상세 조회
 * GET /reviews/{reviewId}
 */
export async function getReview(reviewId: number): Promise<Review> {
  return apiGet<Review>(`/reviews/${reviewId}`)
}

/**
 * 체험의 리뷰 목록 조회
 * GET /reviews/experience/{experienceId}
 */
export async function getExperienceReviews(experienceId: number): Promise<Review[]> {
  return apiGet<Review[]>(`/reviews/experience/${experienceId}`)
}

/**
 * 사용자의 리뷰 목록 조회
 * GET /reviews/user/{userId}
 */
export async function getUserReviews(userId: number): Promise<Review[]> {
  return apiGet<Review[]>(`/reviews/user/${userId}`)
}

/**
 * 리뷰 삭제
 * DELETE /reviews/{reviewId}
 */
export async function deleteReview(reviewId: number): Promise<void> {
  return apiDelete(`/reviews/${reviewId}`)
}
