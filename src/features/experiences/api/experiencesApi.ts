import { apiDelete, apiPost, apiPut } from '@/services/api'
import { chungbukGet } from '@/services/chungbukApi'
import { adaptExperience } from '@/features/chungbuk/adapters'
import type { ChungbukExperience } from '@/features/chungbuk/adapters'
import type { Experience } from '@/types/api'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'

export interface CreateExperienceRequest {
  title: string
  description?: string
  culturalStory?: string
  category?: string
  price: number
  startDateTime?: string
  endDateTime?: string
  maxParticipants: number
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  durationMinutes?: number
  supportedLanguages?: string[]
  imageUrl?: string
  location?: string
  locationAddress?: string
  locationLat?: number
  locationLng?: number
  tags?: string[]
  schedules?: { scheduledAt: string; availableSlots: number }[]
}

/**
 * 활성 체험 목록 조회 - 충북 체험 데이터
 */
export async function getActiveExperiences(): Promise<Experience[]> {
  const experiences = await chungbukGet<ChungbukExperience[]>('/experiences')
  return experiences.map(adaptExperience)
}

export async function enrichExperienceReviewStats<T extends Experience>(experience: T): Promise<T> {
  if (experience.averageRating !== undefined && experience.reviewCount !== undefined) {
    return experience
  }

  const reviews = await getExperienceReviews(experience.id).catch(() => [])
  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
    : 0

  return {
    ...experience,
    averageRating,
    reviewCount,
  }
}

export async function enrichExperiencesReviewStats<T extends Experience>(experiences: T[]): Promise<T[]> {
  return Promise.all(experiences.map(enrichExperienceReviewStats))
}

export async function getActiveExperiencesWithReviewStats(): Promise<Experience[]> {
  const experiences = await getActiveExperiences()
  return enrichExperiencesReviewStats(experiences)
}

/**
 * 체험 상세 조회
 * 충북 백엔드에는 단건 조회 엔드포인트가 없어 목록에서 찾는다.
 */
export async function getExperience(experienceId: number): Promise<Experience> {
  const experiences = await chungbukGet<ChungbukExperience[]>('/experiences')
  const found = experiences.find((e) => e.id === experienceId)
  if (!found) {
    throw new Error(`Chungbuk experience ${experienceId} not found`)
  }
  return adaptExperience(found)
}

/**
 * 장인의 체험 목록 조회
 */
export async function getArtisanExperiences(artisanId: number): Promise<Experience[]> {
  const experiences = await chungbukGet<ChungbukExperience[]>('/experiences')
  return experiences.filter((e) => e.artisan_id === artisanId).map(adaptExperience)
}

// ---- 아래는 장인용 관리자 화면(master) 전용 - 이번 충북 데모 스코프 밖, 기존 Spring 그대로 둠 ----

/**
 * 체험 등록 (장인용)
 * POST /experiences?artisanId={artisanId}
 */
export async function createExperience(
  artisanId: number,
  request: CreateExperienceRequest,
): Promise<Experience> {
  return apiPost<CreateExperienceRequest, Experience>(`/experiences?artisanId=${artisanId}`, request)
}

/**
 * 체험 수정 (장인용)
 * PUT /experiences/{experienceId}
 */
export async function updateExperience(
  artisanId: number,
  experienceId: number,
  request: CreateExperienceRequest,
): Promise<Experience> {
  return apiPut<CreateExperienceRequest, Experience>(`/experiences/${experienceId}?artisanId=${artisanId}`, request)
}

export async function addExperienceImages(
  artisanId: number,
  experienceId: number,
  imageUrls: string[],
): Promise<Experience> {
  return apiPost<{ imageUrls: string[] }, Experience>(
    `/experiences/${experienceId}/images?artisanId=${artisanId}`,
    { imageUrls },
  )
}

export async function deleteExperience(artisanId: number, experienceId: number): Promise<void> {
  return apiDelete(`/experiences/${experienceId}?artisanId=${artisanId}`)
}
