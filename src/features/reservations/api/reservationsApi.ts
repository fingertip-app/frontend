import { apiGet, apiPost } from '@/services/api'
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
 * 예약 생성
 * POST /reservations
 *
 * userId는 JWT 토큰에서 자동 추출
 */
export async function createReservation(
  req: CreateReservationRequest
): Promise<Reservation> {
  return apiPost<CreateReservationRequest, Reservation>(
    `/reservations`,
    req
  )
}

/**
 * 내 예약 목록 조회 (상태 필터)
 * GET /reservations?status={status}
 *
 * userId는 JWT 토큰에서 자동 추출
 */
export async function getMyReservations(
  status?: ReservationStatus
): Promise<Reservation[]> {
  const query = status ? `?status=${status}` : ''
  return apiGet<Reservation[]>(`/reservations${query}`)
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
 * 예약 결제
 * POST /reservations/{reservationId}/payment?paymentKey={paymentKey}
 */
export async function payReservation(
  reservationId: number,
  paymentKey: string
): Promise<Reservation> {
  return apiPost<void, Reservation>(
    `/reservations/${reservationId}/payment?paymentKey=${encodeURIComponent(paymentKey)}`
  )
}

/**
 * 예약 확정
 * POST /reservations/{reservationId}/confirm
 */
export async function confirmReservation(reservationId: number): Promise<Reservation> {
  return apiPost<void, Reservation>(`/reservations/${reservationId}/confirm`)
}

/**
 * 예약 취소
 * POST /reservations/{reservationId}/cancel?cancellationReason={reason}
 */
export async function cancelReservation(
  reservationId: number,
  cancellationReason?: string
): Promise<Reservation> {
  console.log("🔴 [cancelReservation API] 호출됨", { reservationId, cancellationReason });
  const query = cancellationReason
    ? `?cancellationReason=${encodeURIComponent(cancellationReason)}`
    : ''
  console.log("🔴 [cancelReservation API] 요청 URL:", `/reservations/${reservationId}/cancel${query}`);
  return apiPost<void, Reservation>(`/reservations/${reservationId}/cancel${query}`)
}
