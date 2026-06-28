import { apiDelete, apiPost, apiPut } from '@/services/api'
import { chungbukGet, chungbukPost, chungbukPatch, chungbukDelete } from '@/services/chungbukApi'
import { adaptExperience } from '@/features/chungbuk/adapters'
import type { ChungbukExperience } from '@/features/chungbuk/adapters'
import type { Experience } from '@/types/api'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import { getMyArtisanToken } from '@/features/artisans/api/artisanApi'

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

// ---- 아래는 장인용 관리자 화면(master) 전용 ----
// 이미지 업로드만 충북 데모 스코프 밖이라 기존 Spring 그대로 둠 (addExperienceImages).

function toChungbukExperiencePayload(request: CreateExperienceRequest) {
  return {
    title: request.title,
    description: request.description ?? '',
    price: request.price,
    duration_minutes: request.durationMinutes ?? 60,
    max_participants: request.maxParticipants,
    image_url: request.imageUrl ?? null,
    location: request.locationAddress ?? request.location ?? null,
  }
}

/**
 * 체험 등록 (장인용) - 충북 체험 (POST /chungbuk/artisans/{artisanId}/experiences)
 * 장인별 access_token 인증 - 데모 스코프에서는 고정 장인(임인호) 토큰 사용.
 */
export async function createExperience(
  artisanId: number,
  request: CreateExperienceRequest,
): Promise<Experience> {
  const payload = toChungbukExperiencePayload(request)
  const raw = await chungbukPost<typeof payload, ChungbukExperience>(
    `/artisans/${artisanId}/experiences?token=${encodeURIComponent(getMyArtisanToken())}`,
    payload,
  )
  return adaptExperience(raw)
}

/**
 * 체험 수정 (장인용) - 충북 체험 (PATCH /chungbuk/artisans/{artisanId}/experiences/{experienceId})
 */
export async function updateExperience(
  artisanId: number,
  experienceId: number,
  request: CreateExperienceRequest,
): Promise<Experience> {
  const raw = await chungbukPatch<ChungbukExperience, ReturnType<typeof toChungbukExperiencePayload>>(
    `/artisans/${artisanId}/experiences/${experienceId}?token=${encodeURIComponent(getMyArtisanToken())}`,
    toChungbukExperiencePayload(request),
  )
  return adaptExperience(raw)
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

/**
 * 체험 삭제 (장인용) - 충북 체험 (DELETE /chungbuk/artisans/{artisanId}/experiences/{experienceId})
 */
export async function deleteExperience(artisanId: number, experienceId: number): Promise<void> {
  await chungbukDelete<void>(
    `/artisans/${artisanId}/experiences/${experienceId}?token=${encodeURIComponent(getMyArtisanToken())}`,
  )
}
