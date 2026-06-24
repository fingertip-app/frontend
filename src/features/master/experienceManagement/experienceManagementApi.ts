import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { createExperience, getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import { uploadImage } from '@/features/files/api/filesApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import type { Experience, Review } from '@/types/api'
import type {
  ExperienceManagementData,
  ExperienceManagementItem,
  ExperienceRegistrationParams,
  ExperienceTimeSlot,
} from './types'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80'
const DAY_TO_WEEKDAY: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
}

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
    experiences.map((experience) => getExperienceReviews(experience.id)),
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

function parseTimeLabel(label: string): { hour: number; minute: number } | null {
  const normalized = label.trim()
  const twelveHour = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(normalized)
  if (twelveHour) {
    const minute = Number(twelveHour[2])
    if (minute > 59) return null
    let hour = Number(twelveHour[1])
    if (hour < 1 || hour > 12) return null
    hour %= 12
    if (/pm/i.test(twelveHour[3])) hour += 12
    return { hour, minute }
  }

  const twentyFourHour = /^(\d{1,2}):(\d{2})$/.exec(normalized)
  if (!twentyFourHour) return null
  const hour = Number(twentyFourHour[1])
  const minute = Number(twentyFourHour[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

function toLocalDateTimeString(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:00`
}

function nextOccurrence(weekday: number, hour: number, minute: number): Date {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  date.setDate(date.getDate() + 1)
  while (date.getDay() !== weekday) date.setDate(date.getDate() + 1)
  return date
}

function buildSchedules(
  selectedDays: string[],
  timeSlots: ExperienceTimeSlot[],
  availableSlots: number,
): { scheduledAt: string; availableSlots: number }[] {
  const weekdays = selectedDays
    .map((day) => DAY_TO_WEEKDAY[day])
    .filter((day): day is number => day !== undefined)
  const times = timeSlots.map((slot) => parseTimeLabel(slot.startTime))

  if (!weekdays.length) throw new Error('운영 요일을 한 개 이상 선택해주세요.')
  if (times.some((time) => time === null)) throw new Error('시작 시간을 올바르게 입력해주세요.')

  return weekdays.flatMap((weekday) =>
    times.map((time) => ({
      scheduledAt: toLocalDateTimeString(nextOccurrence(weekday, time!.hour, time!.minute)),
      availableSlots,
    })),
  )
}

function computeDurationMinutes(timeSlots: ExperienceTimeSlot[]): number {
  const durations = timeSlots.map((slot) => {
    const start = parseTimeLabel(slot.startTime)
    const end = parseTimeLabel(slot.endTime)
    if (!start || !end) throw new Error('운영 시간을 올바르게 입력해주세요.')
    const duration = end.hour * 60 + end.minute - (start.hour * 60 + start.minute)
    if (duration <= 0) throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.')
    return duration
  })
  if (!durations.length) throw new Error('운영 시간대를 한 개 이상 입력해주세요.')
  return durations[0]
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

  return createExperience(artisan.id, {
    title: params.title.trim(),
    description,
    price,
    maxParticipants: params.maxGuests,
    difficulty: 'BEGINNER',
    durationMinutes: computeDurationMinutes(params.timeSlots),
    imageUrl,
    locationAddress: locationAddress.trim(),
    schedules: buildSchedules(params.selectedDays, params.timeSlots, params.maxGuests),
  })
}
