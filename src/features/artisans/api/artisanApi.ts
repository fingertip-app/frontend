import { chungbukGet } from '@/services/chungbukApi'
import { adaptArtisan } from '@/features/chungbuk/adapters'
import type { ChungbukArtisan } from '@/features/chungbuk/adapters'
import type { Artisan } from '@/types/api'

/**
 * 현재 로그인한 장인 정보 조회
 * 충북 데모는 장인용 관리자 화면을 이번 스코프에서 다루지 않아 미구현 상태로 둔다.
 */
export async function getMyArtisan(): Promise<Artisan> {
  throw new Error('getMyArtisan은 충북 데모 스코프에 포함되지 않습니다.')
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
