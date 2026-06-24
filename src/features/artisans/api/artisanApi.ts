import { apiGet } from '@/services/api'
import type { Artisan } from '@/types/api'

/**
 * 현재 로그인한 장인 정보 조회
 * GET /artisans/me
 */
export async function getMyArtisan(): Promise<Artisan> {
  return apiGet<Artisan>('/artisans/me')
}

/**
 * 장인 ID로 장인 정보 조회
 * GET /artisans/{artisanId}
 */
export async function getArtisan(artisanId: number): Promise<Artisan> {
  return apiGet<Artisan>(`/artisans/${artisanId}`)
}
