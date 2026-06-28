import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import { getExperienceReservations } from '@/features/reservations/api/reservationsApi'
import { getExperienceReviews } from '@/features/reviews/api/reviewsApi'
import type { Reservation, Review } from '@/types/api'
import type { MasterAccountData } from '../types/masterAccount'

const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&q=80'
const REVENUE_STATUSES = new Set<Reservation['status']>(['PAID', 'CONFIRMED', 'COMPLETED'])

function isCurrentMonth(value: string): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

export async function getMasterAccountData(): Promise<MasterAccountData> {
  const artisan = await getMyArtisan()
  // 충북 장인은 Spring 회원과 연결되어 있지 않아(userId가 항상 0) getUser 조회 없이
  // 장인 정보 자체(artisan.name/profileImageUrl)만으로 채운다.
  const experiences = await getArtisanExperiences(artisan.id)
  const [reservationLists, reviewLists] = await Promise.all([
    Promise.all(experiences.map((experience) => getExperienceReservations(experience.id).catch(() => []))),
    Promise.all(experiences.map((experience) => getExperienceReviews(experience.id).catch(() => []))),
  ])
  const reservations = reservationLists.flat()
  const reviews = reviewLists.flat()

  return {
    profile: {
      artisanId: artisan.id,
      userId: artisan.userId,
      name: artisan.name,
      masterName: artisan.name,
      heritageCategory: artisan.heritageCategory,
      certificationNumber: artisan.certificationNumber,
      bio: artisan.bio,
      imageUrl: artisan.profileImageUrl || DEFAULT_PROFILE_IMAGE,
      isVerified: artisan.isVerified,
      isActive: artisan.isActive,
    },
    stats: {
      pendingReservationCount: reservations.filter(
        (reservation) => reservation.status === 'PENDING',
      ).length,
      activeExperienceCount: experiences.filter((experience) => experience.isActive).length,
      monthlyRevenue: reservations
        .filter(
          (reservation) =>
            REVENUE_STATUSES.has(reservation.status) && isCurrentMonth(reservation.updatedAt),
        )
        .reduce((sum, reservation) => sum + reservation.totalPrice, 0),
      totalReservationCount: reservations.length,
      reviewCount: reviews.length,
      averageRating: getAverageRating(reviews),
    },
  }
}
