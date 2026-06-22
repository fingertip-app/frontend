import { apiGet } from '@/services/api'

export interface Artisan {
  id: number
  userId: number
  name: string
  heritageCategory: string
  certificationNumber: string | null
  bio: string | null
  profileImageUrl: string | null
  introVideoUrl: string | null
  certificationStatus: string
  isVerified: boolean
  isActive: boolean
}

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
