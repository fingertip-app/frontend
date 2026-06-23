import { apiGet, apiPost } from "@/services/api";

export interface QrVerifyRequest {
  token: string;
}

export interface QrVerifyResponse {
  valid: boolean;
  reservationId: number;
  userName: string;
  experienceTitle: string;
  scheduledAt: string;
  participants: number;
  status: string;
}

/**
 * 예약 ID로 QR 코드 조회 (사용자용)
 * GET /api/qr/reservation/{reservationId}
 */
export async function getQrCodeByReservation(reservationId: number): Promise<string> {
  return apiGet(`/qr/reservation/${reservationId}`);
}

/**
 * QR 코드 검증 (장인용)
 * POST /api/qr/verify
 */
export async function verifyQrCode(token: string): Promise<QrVerifyResponse> {
  return apiPost("/qr/verify", { token });
}

/**
 * QR 코드 재생성 (결제 완료 후 생성 실패 시 복구용)
 * POST /api/qr/regenerate/{reservationId}
 */
export async function regenerateQrCode(reservationId: number): Promise<string> {
  return apiPost(`/qr/regenerate/${reservationId}`, {});
}
