import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { createExperience, getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import { uploadImage } from '@/features/files/api/filesApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import {
  buildRecurringSchedules,
  computeDurationMinutes,
} from '@/features/experiences/utils/scheduleBuilder'
import type { Experience, Review } from '@/types/api'
import type {
  ExperienceManagementData,
  ExperienceManagementItem,
  ExperienceRegistrationParams,
} from './types'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80'

function getMainImage(experience: Experience): string {
  if (!experience.images.length) return PLACEHOLDER_IMAGE
  return [...experience.images].sort((left, right) => left.displayOrder - right.displayOrder)[0]
    .imageUrl
}

function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

function mapExperience(experience: Experience, reviews: Review[]): ExperienceManagementItem {
  const bookings = experience.schedules.reduce(
    (sum, schedule) => sum + (schedule.bookedSlots ?? 0),
    0,
  )
  return {
    id: experience.id,
    title: experience.title,
    bookings,
    rating: getAverageRating(reviews),
    reviewCount: reviews.length,
    active: experience.isActive,
    imageUri: getMainImage(experience),
    statusLabel: experience.isActive ? 'ACTIVE' : 'INACTIVE',
  }
}

export async function getExperienceManagementData(): Promise<ExperienceManagementData> {
  const artisan = await getMyArtisan()
  const experiences = await getArtisanExperiences(artisan.id)
  const reviewLists = await Promise.all(
    experiences.map((experience) => getExperienceReviews(experience.id).catch(() => [])),
  )
  const items = experiences.map((experience, index) =>
    mapExperience(experience, reviewLists[index]),
  )

  return {
    activeExperienceCount: items.filter((item) => item.active).length,
    reviewCount: reviewLists.reduce((sum, reviews) => sum + reviews.length, 0),
    experiences: items,
  }
}

export async function createRegisteredExperience(
  params: ExperienceRegistrationParams,
  locationAddress: string,
): Promise<Experience> {
  const price = Number(params.price)
  if (!params.title.trim()) throw new Error('체험 제목을 입력해주세요.')
  if (!Number.isFinite(price) || price <= 0) throw new Error('가격을 올바르게 입력해주세요.')
  if (!locationAddress.trim()) throw new Error('체험 장소를 입력해주세요.')
  if (params.maxGuests <= 0) throw new Error('최대 인원을 올바르게 설정해주세요.')

  const [artisan, imageUrl] = await Promise.all([
    getMyArtisan(),
    uploadImage(params.mainPhoto, 'experience'),
  ])
  const description = [params.shortDesc.trim(), params.detail.trim()].filter(Boolean).join('\n\n')
  const schedules = buildRecurringSchedules(
    params.operationStartDate,
    params.operationEndDate,
    params.selectedDays,
    params.timeSlots,
    params.maxGuests,
  )
  if (!schedules.length) throw new Error('운영 기간, 요일, 시간대를 다시 확인해주세요.')

  return createExperience(artisan.id, {
    title: params.title.trim(),
    description,
    price,
    maxParticipants: params.maxGuests,
    difficulty: 'BEGINNER',
    durationMinutes: computeDurationMinutes(params.timeSlots),
    imageUrl,
    locationAddress: locationAddress.trim(),
    schedules,
  })
}
