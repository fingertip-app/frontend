import { getMyArtisan } from '@/features/artisans/api/artisanApi'
import { getArtisanExperiences } from '@/features/experiences/api/experiencesApi'
import {
  approveReservation,
  getArtisanReservations,
  rejectReservation,
} from '@/features/reservations/api/reservationsApi'
import { adaptReservation } from '@/features/chungbuk/adapters'
import type { Reservation, ReservationStatus } from '@/types/api'
import type {
  MasterBookingDetail,
  MasterBookingFilter,
  MasterBookingListItem,
  MasterBookingsData,
  MasterBookingStatus,
} from './types'

export function toMasterBookingStatus(status: ReservationStatus): MasterBookingStatus {
  switch (status) {
    case 'PENDING':
      return 'pending'
    case 'APPROVED':
      return 'approved'
    case 'PAID':
      return 'paid'
    case 'CONFIRMED':
      return 'confirmed'
    case 'COMPLETED':
      return 'completed'
    case 'REJECTED':
      return 'rejected'
    case 'CANCELLED':
      return 'cancelled'
  }
}

export function matchesMasterBookingFilter(
  status: MasterBookingStatus,
  filter: MasterBookingFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'confirmed') {
    return status === 'approved' || status === 'paid' || status === 'confirmed'
  }
  if (filter === 'cancelled') return status === 'rejected' || status === 'cancelled'
  return status === filter
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
  const rawReservations = await getArtisanReservations(artisan.id)

  return {
    artisanId: artisan.id,
    bookings: rawReservations.map((raw) =>
      mapListItem(
        adaptReservation(raw),
        experienceById.get(raw.experience_id)?.title ?? '체험',
        raw.user_name,
      ),
    ),
  }
}

export async function getMasterBookingDetail(
  reservationId: number,
): Promise<MasterBookingDetail> {
  const artisan = await getMyArtisan()
  const [experiences, rawReservations] = await Promise.all([
    getArtisanExperiences(artisan.id),
    getArtisanReservations(artisan.id),
  ])
  const raw = rawReservations.find((r) => r.id === reservationId)
  if (!raw) {
    throw new Error(`예약 ${reservationId}을 찾을 수 없습니다.`)
  }
  const reservation = adaptReservation(raw)
  const experienceTitle = experiences.find((e) => e.id === raw.experience_id)?.title ?? '체험'

  return {
    ...mapListItem(reservation, experienceTitle, raw.user_name),
    bookerPhone: raw.contact,
    bookerEmail: null,
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
