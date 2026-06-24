import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences, getExperience } from '@/features/experiences/api/experiencesApi'
import {
  approveReservation,
  getExperienceReservations,
  getReservation,
  rejectReservation,
} from '@/features/reservations/api/reservationsApi'
import { getUser } from '@/features/users/api/usersApi'
import type { Reservation, ReservationStatus } from '@/types/api'
import type {
  MasterBookingDetail,
  MasterBookingListItem,
  MasterBookingsData,
  MasterBookingStatus,
} from './types'

export function toMasterBookingStatus(status: ReservationStatus): MasterBookingStatus {
  switch (status) {
    case 'PENDING':
      return 'pending'
    case 'APPROVED':
    case 'PAID':
    case 'CONFIRMED':
      return 'confirmed'
    case 'COMPLETED':
      return 'completed'
    default:
      return 'cancelled'
  }
}

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
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

function mapListItem(
  reservation: Reservation,
  title: string,
  bookerName: string,
): MasterBookingListItem {
  return {
    id: reservation.id,
    backendStatus: reservation.status,
    status: toMasterBookingStatus(reservation.status),
    title,
    date: formatDate(reservation.reservedDateTime),
    time: formatTime(reservation.reservedDateTime),
    bookerName,
    guests: reservation.numberOfParticipants,
    price: reservation.totalPrice,
  }
}

export async function getMasterBookings(): Promise<MasterBookingsData> {
  const artisan = await getMyArtisan()
  const experiences = await getArtisanExperiences(artisan.id)
  const experienceById = new Map(experiences.map((experience) => [experience.id, experience]))
  const reservationLists = await Promise.all(
    experiences.map((experience) => getExperienceReservations(experience.id)),
  )
  const reservations = reservationLists.flat()
  const userIds = [...new Set(reservations.map((reservation) => reservation.userId))]
  const users = await Promise.all(
    userIds.map(async (userId) => [userId, await getUser(userId).catch(() => null)] as const),
  )
  const userById = new Map(users)

  return {
    artisanId: artisan.id,
    bookings: reservations.map((reservation) =>
      mapListItem(
        reservation,
        experienceById.get(reservation.experienceId)?.title ?? '체험',
        userById.get(reservation.userId)?.nickname ?? '알 수 없음',
      ),
    ),
  }
}

export async function getMasterBookingDetail(
  reservationId: number,
): Promise<MasterBookingDetail> {
  const reservation = await getReservation(reservationId)
  const [experience, user] = await Promise.all([
    getExperience(reservation.experienceId),
    getUser(reservation.userId),
  ])

  return {
    ...mapListItem(reservation, experience.title, user.nickname),
    bookerPhone: user.phone,
    bookerEmail: user.email,
    requestMessage: reservation.requestMessage,
    rejectionReason: reservation.rejectionReason,
    cancellationReason: reservation.cancellationReason,
  }
}

export async function approveMasterBooking(
  reservationId: number,
  artisanId: number,
): Promise<ReservationStatus> {
  return (await approveReservation(reservationId, artisanId)).status
}

export async function rejectMasterBooking(
  reservationId: number,
  artisanId: number,
  rejectionReason: string,
): Promise<ReservationStatus> {
  return (await rejectReservation(reservationId, rejectionReason, artisanId)).status
}
