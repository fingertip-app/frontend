import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'
import { chungbukGet, chungbukPost } from '@/services/chungbukApi'
import { adaptReview } from '@/features/chungbuk/adapters'
import type { ChungbukReview } from '@/features/chungbuk/adapters'
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
 * 리뷰 작성 - 충북 체험 리뷰 (POST /chungbuk/reviews). 로그인 필수.
 */
export async function createReview(req: CreateReviewRequest): Promise<Review> {
  const raw = await chungbukPost<{ experience_id: number; rating: number; content: string }, ChungbukReview>(
    '/reviews',
    { experience_id: req.experienceId, rating: req.rating, content: req.content ?? '' },
  )
  return adaptReview(raw)
}

/**
 * 리뷰 수정
 * PUT /reviews/{reviewId}
 */
export async function updateReview(reviewId: number, req: CreateReviewRequest): Promise<Review> {
  return apiPut<CreateReviewRequest, Review>(`/reviews/${reviewId}`, req)
}

/**
 * 리뷰 상세 조회
 * GET /reviews/{reviewId}
 */
export async function getReview(reviewId: number): Promise<Review> {
  return apiGet<Review>(`/reviews/${reviewId}`)
}

/**
 * 체험의 리뷰 목록 조회 - 충북 체험 리뷰 (GET /chungbuk/reviews/experience/{experienceId})
 */
export async function getExperienceReviews(experienceId: number): Promise<Review[]> {
  const reviews = await chungbukGet<ChungbukReview[]>(`/reviews/experience/${experienceId}`)
  return reviews.map(adaptReview)
}

/**
 * 내가 쓴 리뷰 목록 조회 - 충북 리뷰 (GET /chungbuk/reviews/mine). 로그인 필수.
 * 기존 시그니처(userId)는 충북 쪽엔 의미가 없어(Supabase JWT로 본인 식별) 무시한다.
 */
export async function getUserReviews(_userId: number): Promise<Review[]> {
  const reviews = await chungbukGet<ChungbukReview[]>('/reviews/mine')
  return reviews.map(adaptReview)
}

/**
 * 리뷰 삭제
 * DELETE /reviews/{reviewId}
 */
export async function deleteReview(reviewId: number): Promise<void> {
  return apiDelete(`/reviews/${reviewId}`)
}

/**
 * 리뷰 AI 요약
 * POST /reviews/summarize
 */
export interface ReviewSummaryRequest {
  content: string
  locale?: string
}

export interface ReviewSummaryResponse {
  summary: string
  sentimentScore: number
  keywords: string[]
}

export async function summarizeReview(req: ReviewSummaryRequest): Promise<ReviewSummaryResponse> {
  return apiPost<ReviewSummaryRequest, ReviewSummaryResponse>('/reviews/summarize', req)
}
