import { chungbukGet, chungbukPatch } from '@/services/chungbukApi'
import { DEMO_ARTISAN_ID, DEMO_ARTISAN_TOKEN } from '@/features/chungbuk/demoArtisan'
import type { ChungbukExperience, ChungbukReservation } from '@/features/chungbuk/adapters'
import type { ReservationStatus } from '@/types/api'
import type {
  MasterBookingDetail,
  MasterBookingFilter,
  MasterBookingListItem,
  MasterBookingsData,
  MasterBookingStatus,
} from './types'

// 충북 예약 상태(한글) -> 화면 상태/백엔드 상태 매핑
const STATUS_MAP: Record<string, { master: MasterBookingStatus; backend: ReservationStatus }> = {
  신청: { master: 'pending', backend: 'PENDING' },
  확정: { master: 'confirmed', backend: 'CONFIRMED' },
  거절: { master: 'rejected', backend: 'REJECTED' },
  취소: { master: 'cancelled', backend: 'CANCELLED' },
}

function mapStatus(status: string) {
  return STATUS_MAP[status] ?? { master: 'pending' as MasterBookingStatus, backend: 'PENDING' as ReservationStatus }
}

// 낙관적 업데이트용: 백엔드 상태(ReservationStatus) -> 화면 상태(MasterBookingStatus)
export function toMasterBookingStatus(status: ReservationStatus): MasterBookingStatus {
  switch (status) {
    case 'PENDING': return 'pending'
    case 'APPROVED': return 'approved'
    case 'PAID': return 'paid'
    case 'CONFIRMED': return 'confirmed'
    case 'COMPLETED': return 'completed'
    case 'REJECTED': return 'rejected'
    case 'CANCELLED': return 'cancelled'
  }
}

export function matchesMasterBookingFilter(
  status: MasterBookingStatus,
  filter: MasterBookingFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'confirmed') return status === 'approved' || status === 'paid' || status === 'confirmed'
  if (filter === 'cancelled') return status === 'rejected' || status === 'cancelled'
  return status === filter
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${weekday})`
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const TOKEN_Q = `token=${encodeURIComponent(DEMO_ARTISAN_TOKEN)}`

async function loadContext() {
  const [experiences, reservations] = await Promise.all([
    chungbukGet<ChungbukExperience[]>('/experiences'),
    chungbukGet<ChungbukReservation[]>(`/artisans/${DEMO_ARTISAN_ID}/reservations?${TOKEN_Q}`),
  ])
  const experienceById = new Map(experiences.map((e) => [e.id, e]))
  return { experienceById, reservations }
}

function mapListItem(r: ChungbukReservation, title: string): MasterBookingListItem {
  const { master, backend } = mapStatus(r.status)
  return {
    id: r.id,
    backendStatus: backend,
    status: master,
    title,
    date: formatDate(r.created_at),
    time: formatTime(r.created_at),
    bookerName: r.user_name,
    guests: 1,
    price: 0,
  }
}

export async function getMasterBookings(): Promise<MasterBookingsData> {
  const { experienceById, reservations } = await loadContext()
  return {
    artisanId: DEMO_ARTISAN_ID,
    bookings: reservations.map((r) =>
      mapListItem(r, experienceById.get(r.experience_id)?.title ?? '체험'),
    ),
  }
}

export async function getMasterBookingDetail(reservationId: number): Promise<MasterBookingDetail> {
  const { experienceById, reservations } = await loadContext()
  const reservation = reservations.find((r) => r.id === reservationId)
  if (!reservation) throw new Error('예약을 찾을 수 없습니다.')
  const base = mapListItem(reservation, experienceById.get(reservation.experience_id)?.title ?? '체험')
  return {
    ...base,
    bookerPhone: reservation.contact,
    bookerEmail: null,
    requestMessage: null,
    rejectionReason: null,
    cancellationReason: null,
  }
}

export async function approveMasterBooking(reservationId: number): Promise<ReservationStatus> {
  await chungbukPatch(`/artisans/${DEMO_ARTISAN_ID}/reservations/${reservationId}/approve?${TOKEN_Q}`)
  return 'CONFIRMED'
}

export async function rejectMasterBooking(reservationId: number): Promise<ReservationStatus> {
  await chungbukPatch(`/artisans/${DEMO_ARTISAN_ID}/reservations/${reservationId}/reject?${TOKEN_Q}`)
  return 'REJECTED'
}
