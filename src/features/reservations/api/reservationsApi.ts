import { apiGet, apiPost } from '@/services/api'
import { chungbukGet, chungbukPatch, chungbukPost } from '@/services/chungbukApi'
import { adaptReservation } from '@/features/chungbuk/adapters'
import type { ChungbukReservation } from '@/features/chungbuk/adapters'
import { supabase } from '@/lib/supabase'
import type { Reservation, ReservationStatus } from '@/types/api'

/**
 * 예약 생성 요청 DTO
 * 실제 backend ReservationRequest와 일치
 */
export interface CreateReservationRequest {
  experienceId: number
  scheduleId: number
  numberOfParticipants: number
  reservedDateTime?: string // Backend DTO 호환용 - scheduleId로 일정 지정하므로 현재 미사용
  requestMessage?: string // ⚠️ 'message'가 아님!
}

/**
 * 예약 생성 - 충북 예약 (POST /chungbuk/reservations)
 * 로그인 필수. 이름/연락처는 Supabase 세션의 user_metadata에서 가져온다.
 * 충북 예약엔 일정/인원 개념이 없어 scheduleId/numberOfParticipants는 사용하지 않는다.
 */
export async function createReservation(
  req: CreateReservationRequest
): Promise<Reservation> {
  const { data } = await supabase.auth.getSession()
  const meta = data.session?.user?.user_metadata ?? {}
  const userName = (meta.name as string) || (meta.nickname as string) || '예약자'
  const contact = (meta.phone as string) || '-'

  const raw = await chungbukPost<
    { experience_id: number; user_name: string; contact: string },
    ChungbukReservation
  >('/reservations', {
    experience_id: req.experienceId,
    user_name: userName,
    contact,
  })
  return adaptReservation(raw)
}

// 충북 예약 상태(한글) <-> 기존 ReservationStatus 매핑. COMPLETED는 충북 흐름에 없어 매칭 대상 없음.
const STATUS_TO_CHUNGBUK: Partial<Record<ReservationStatus, string>> = {
  PENDING: '신청',
  APPROVED: '확정',
  PAID: '결제완료',
  REJECTED: '거절',
  CANCELLED: '취소',
}

/**
 * 내 예약 목록 조회 (상태 필터) - 충북 예약 데이터
 * 로그인 필수 (Supabase JWT)
 */
export async function getMyReservations(
  status?: ReservationStatus
): Promise<Reservation[]> {
  const reservations = await chungbukGet<ChungbukReservation[]>('/reservations/mine')
  const mapped = reservations.map(adaptReservation)
  if (!status) return mapped
  const chungbukStatus = STATUS_TO_CHUNGBUK[status]
  if (!chungbukStatus) return [] // COMPLETED/PAID 등 충북 흐름에 없는 상태는 빈 배열
  return mapped.filter((r) => r.status === status)
}

/**
 * 내 예약 목록 조회 (path variable 방식)
 * GET /reservations/user/{userId}
 */
export async function getUserReservations(userId: number): Promise<Reservation[]> {
  return apiGet<Reservation[]>(`/reservations/user/${userId}`)
}

/**
 * 예약 상세 조회
 * GET /reservations/{reservationId}
 */
export async function getReservation(reservationId: number): Promise<Reservation> {
  return apiGet<Reservation>(`/reservations/${reservationId}`)
}

/**
 * 체험의 예약 목록 조회 (장인용)
 * GET /reservations/experience/{experienceId}
 */
export async function getExperienceReservations(experienceId: number): Promise<Reservation[]> {
  return apiGet<Reservation[]>(`/reservations/experience/${experienceId}`)
}

/**
 * 예약 승인 (장인)
 * POST /reservations/{reservationId}/approve
 */
export async function approveReservation(
  reservationId: number,
  artisanId?: number
): Promise<Reservation> {
  const query = artisanId !== undefined ? `?artisanId=${encodeURIComponent(artisanId)}` : ''
  return apiPost<void, Reservation>(`/reservations/${reservationId}/approve${query}`)
}

/**
 * 예약 거절 (장인)
 * POST /reservations/{reservationId}/reject?rejectionReason={reason}
 */
export async function rejectReservation(
  reservationId: number,
  rejectionReason: string,
  artisanId?: number
): Promise<Reservation> {
  const params = new URLSearchParams({ rejectionReason })
  if (artisanId !== undefined) {
    params.set('artisanId', String(artisanId))
  }
  return apiPost<void, Reservation>(`/reservations/${reservationId}/reject?${params.toString()}`)
}

/**
 * 예약 결제 - 충북 예약 (PATCH /chungbuk/reservations/{reservationId}/pay)
 * 데모용 - 실제 PG 연동 없이 결제 완료 상태만 기록한다. payment_key는 백엔드가 발급하므로
 * 프론트에서 만든 mock paymentKey 인자는 사용하지 않는다(시그니처 호환용으로만 유지).
 * 로그인 필수, 본인 예약만 결제 가능.
 */
export async function payReservation(
  reservationId: number,
  _paymentKey: string
): Promise<Reservation> {
  const raw = await chungbukPatch<ChungbukReservation>(`/reservations/${reservationId}/pay`)
  return adaptReservation(raw)
}

/**
 * 예약 확정
 * POST /reservations/{reservationId}/confirm
 */
export async function confirmReservation(reservationId: number): Promise<Reservation> {
  return apiPost<void, Reservation>(`/reservations/${reservationId}/confirm`)
}

/**
 * 예약 취소 - 충북 예약 데이터
 * PATCH /chungbuk/reservations/{reservationId}/cancel (로그인 필수, 본인 예약만)
 * 취소 사유는 충북 백엔드에 별도 저장하지 않음 (스코프 제외).
 */
export async function cancelReservation(
  reservationId: number,
  _cancellationReason?: string
): Promise<Reservation> {
  const raw = await chungbukPatch<ChungbukReservation>(`/reservations/${reservationId}/cancel`)
  return adaptReservation(raw)
}
