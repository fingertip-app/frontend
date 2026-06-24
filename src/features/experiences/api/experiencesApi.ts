import { apiGet, apiPost } from '@/services/api'
import type { Experience } from '@/types/api'

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
 * 활성 체험 목록 조회
 * GET /experiences/active
 */
export async function getActiveExperiences(): Promise<Experience[]> {
  return apiGet<Experience[]>('/experiences/active')
}

/**
 * 체험 상세 조회 (schedules 포함)
 * GET /experiences/{experienceId}
 */
export async function getExperience(experienceId: number): Promise<Experience> {
  return apiGet<Experience>(`/experiences/${experienceId}`)
}

/**
 * 장인의 체험 목록 조회
 * GET /experiences/artisan/{artisanId}
 */
export async function getArtisanExperiences(artisanId: number): Promise<Experience[]> {
  return apiGet<Experience[]>(`/experiences/artisan/${artisanId}`)
}

/**
 * 예정된 체험 목록 조회
 * GET /experiences/upcoming
 */
export async function getUpcomingExperiences(): Promise<Experience[]> {
  return apiGet<Experience[]>('/experiences/upcoming')
}

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
