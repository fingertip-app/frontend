import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import {
  approveReservation,
  getExperienceReservations,
  rejectReservation,
} from '@/features/reservations/api/reservationsApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import { getUser } from '@/features/users/api/usersApi'
import type { Experience, Reservation, Review } from '@/types/api'
import type {
  MasterHomeBookingRequest,
  MasterHomeData,
  MasterHomeTodaySchedule,
} from './types'

const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&q=80'
const DEFAULT_EXPERIENCE_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80'

const TODAY_COUNT_STATUSES = new Set<Reservation['status']>([
  'PENDING',
  'APPROVED',
  'PAID',
  'CONFIRMED',
  'COMPLETED',
])

const TODAY_SCHEDULE_STATUSES = new Set<Reservation['status']>([
  'APPROVED',
  'PAID',
  'CONFIRMED',
])

const REVENUE_STATUSES = new Set<Reservation['status']>(['PAID', 'CONFIRMED', 'COMPLETED'])

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

function formatDate(value: string | null): string {
  const date = parseDate(value)
  if (!date) return '-'

  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')} (${weekday})`
}

function formatTime(value: string | null): string {
  const date = parseDate(value)
  if (!date) return '-'

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
    2,
    '0',
  )}`
}

function getExperienceImage(experience: Experience | undefined): string {
  if (!experience?.images.length) return DEFAULT_EXPERIENCE_IMAGE
  return [...experience.images].sort((left, right) => left.displayOrder - right.displayOrder)[0]
    .imageUrl
}

function getCertificationLabel(isVerified: boolean, status: string): string {
  if (isVerified) return '인증완료'
  if (status === 'REJECTED') return '인증반려'
  return '인증대기'
}

async function mapPendingReservations(
  reservations: Reservation[],
  experienceById: Map<number, Experience>,
): Promise<MasterHomeBookingRequest[]> {
  const pending = reservations.filter((reservation) => reservation.status === 'PENDING')
  const userIds = [...new Set(pending.map((reservation) => reservation.userId))]
  const users = await Promise.all(
    userIds.map(async (userId) => [userId, await getUser(userId).catch(() => null)] as const),
  )
  const userById = new Map(users)

  return pending.map((reservation) => {
    const experience = experienceById.get(reservation.experienceId)
    return {
      id: reservation.id,
      title: experience?.title ?? '체험',
      date: formatDate(reservation.reservedDateTime),
      time: formatTime(reservation.reservedDateTime),
      guests: `${reservation.numberOfParticipants}명`,
      name: userById.get(reservation.userId)?.nickname ?? '알 수 없음',
      image: getExperienceImage(experience),
    }
  })
}

function mapTodaySchedules(
  reservations: Reservation[],
  experienceById: Map<number, Experience>,
  now: Date,
): MasterHomeTodaySchedule[] {
  return reservations
    .filter((reservation) => {
      const reservedAt = parseDate(reservation.reservedDateTime)
      return (
        reservedAt !== null &&
        isSameDay(reservedAt, now) &&
        TODAY_SCHEDULE_STATUSES.has(reservation.status)
      )
    })
    .sort((left, right) => {
      const leftTime = parseDate(left.reservedDateTime)?.getTime() ?? 0
      const rightTime = parseDate(right.reservedDateTime)?.getTime() ?? 0
      return leftTime - rightTime
    })
    .map((reservation) => {
      const experience = experienceById.get(reservation.experienceId)
      return {
        id: reservation.id,
        title: experience?.title ?? '체험',
        date: formatDate(reservation.reservedDateTime),
        time: formatTime(reservation.reservedDateTime),
        guests: `${reservation.numberOfParticipants}명`,
        location: experience?.locationAddress ?? '-',
        image: getExperienceImage(experience),
      }
    })
}

function calculateReviewStats(reviews: Review[]): { averageRating: number; reviewCount: number } {
  if (reviews.length === 0) return { averageRating: 0, reviewCount: 0 }

  const ratingTotal = reviews.reduce((total, review) => total + review.rating, 0)
  return {
    averageRating: Math.round((ratingTotal / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  }
}

export async function getMasterHomeData(): Promise<MasterHomeData> {
  const now = new Date()
  const artisan = await getMyArtisan()
  const experiences = await getArtisanExperiences(artisan.id)
  const experienceById = new Map(experiences.map((experience) => [experience.id, experience]))

  const [reservationLists, reviewLists] = await Promise.all([
    Promise.all(experiences.map((experience) => getExperienceReservations(experience.id).catch(() => []))),
    Promise.all(experiences.map((experience) => getExperienceReviews(experience.id).catch(() => []))),
  ])
  const reservations = reservationLists.flat()
  const reviews = reviewLists.flat()
  const bookingRequests = await mapPendingReservations(reservations, experienceById)
  const reviewStats = calculateReviewStats(reviews)

  const monthlyRevenue = reservations
    .filter((reservation) => {
      const updatedAt = parseDate(reservation.updatedAt)
      return (
        updatedAt !== null &&
        isSameMonth(updatedAt, now) &&
        REVENUE_STATUSES.has(reservation.status)
      )
    })
    .reduce((total, reservation) => total + reservation.totalPrice, 0)

  const todayReservationCount = reservations.filter((reservation) => {
    const reservedAt = parseDate(reservation.reservedDateTime)
    return (
      reservedAt !== null &&
      isSameDay(reservedAt, now) &&
      TODAY_COUNT_STATUSES.has(reservation.status)
    )
  }).length

  return {
    artisanId: artisan.id,
    profile: {
      name: artisan.name,
      description: [artisan.heritageCategory, artisan.certificationNumber].filter(Boolean).join(' · '),
      detail: artisan.bio ?? '',
      imageUrl: artisan.profileImageUrl || DEFAULT_PROFILE_IMAGE,
      certificationLabel: getCertificationLabel(artisan.isVerified, artisan.certificationStatus),
    },
    stats: {
      todayReservationCount,
      monthlyRevenue,
      averageRating: reviewStats.averageRating,
      reviewCount: reviewStats.reviewCount,
    },
    bookingRequests,
    todaySchedules: mapTodaySchedules(reservations, experienceById, now),
  }
}

export async function approveMasterReservation(
  reservationId: number,
  artisanId: number,
): Promise<void> {
  await approveReservation(reservationId, artisanId)
}

export async function rejectMasterReservation(
  reservationId: number,
  artisanId: number,
  rejectionReason: string,
): Promise<void> {
  await rejectReservation(reservationId, rejectionReason, artisanId)
}
