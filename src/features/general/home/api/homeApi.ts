import { chungbukGet } from '@/services/chungbukApi'
import { adaptArtisan } from '@/features/chungbuk/adapters'
import type { ChungbukArtisan } from '@/features/chungbuk/adapters'
import type { Banner, Artisan } from '@/types/api'

/**
 * 히어로 배너 목록 조회
 * 충북 데모 스코프에서는 배너 기능을 만들지 않기로 해서 빈 배열을 반환한다.
 */
export async function getHeroBanners(): Promise<Banner[]> {
  return []
}

/**
 * 추천 장인 조회 - 충북 인증 장인 중 첫 번째를 보여준다 (전용 추천 로직 없음).
 */
export async function getRecommendedArtisan(): Promise<Artisan> {
  const artisans = await chungbukGet<ChungbukArtisan[]>('/artisans')
  if (artisans.length === 0) {
    throw new Error('No chungbuk artisans available')
  }
  return adaptArtisan(artisans[0])
}

/**
 * 근처 장인 목록 조회
 * 충북 장인 데이터에는 위경도가 없어 거리 계산 없이 인증 장인 전체를 반환한다.
 */
export async function getNearbyArtisans(
  _lat: number,
  _lng: number,
  _radiusKm: number = 10
): Promise<Artisan[]> {
  const artisans = await chungbukGet<ChungbukArtisan[]>('/artisans')
  return artisans.map(adaptArtisan)
}
