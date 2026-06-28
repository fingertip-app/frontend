import { chungbukGet } from '@/services/chungbukApi'
import { adaptArtisan } from '@/features/chungbuk/adapters'
import { DEMO_ARTISAN_ID } from '@/features/chungbuk/demoArtisan'
import type { ChungbukArtisan } from '@/features/chungbuk/adapters'
import type { Artisan } from '@/types/api'

/**
 * 현재 로그인한 장인 정보 조회.
 * 데모에서는 계정↔장인 매핑이 없어 고정 데모 장인(임인호, id=1)을 반환한다.
 */
export async function getMyArtisan(): Promise<Artisan> {
  return getArtisan(DEMO_ARTISAN_ID)
}

/**
 * 장인 ID로 장인 정보 조회
 * 충북 백엔드에는 단건 조회 엔드포인트가 없어 목록에서 찾는다 (장인이 20명뿐이라 충분히 빠름).
 */
export async function getArtisan(artisanId: number): Promise<Artisan> {
  const artisans = await chungbukGet<ChungbukArtisan[]>('/artisans')
  const found = artisans.find((a) => a.id === artisanId)
  if (!found) {
    throw new Error(`Chungbuk artisan ${artisanId} not found`)
  }
  return adaptArtisan(found)
}
