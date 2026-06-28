import { chungbukGet } from '@/services/chungbukApi'
import { adaptArtisan } from '@/features/chungbuk/adapters'
import type { ChungbukArtisan } from '@/features/chungbuk/adapters'
import type { Artisan } from '@/types/api'

// 충북 장인 데이터는 Supabase 로그인과 연결되어 있지 않다(장인별 access_token 방식).
// "로그인한 사람 = 어떤 장인"인지 매핑하는 기능을 새로 만들 시간이 없어, 데모 스코프에서는
// 장인 1명(임인호, artisan_id=1)만 다루기로 하고 고정한다. access_token도 그 장인의
// 시드값(chungbuk-demo-2026)으로 고정 - 실제 인증이 아니라 데모용 임시 처리.
const FIXED_DEMO_ARTISAN_ID = 1
const FIXED_DEMO_ARTISAN_TOKEN = 'chungbuk-demo-2026'

export function getMyArtisanToken(): string {
  return FIXED_DEMO_ARTISAN_TOKEN
}

/**
 * 현재 로그인한 장인 정보 조회 - 데모 스코프에서는 항상 고정된 장인(임인호)을 반환한다.
 */
export async function getMyArtisan(): Promise<Artisan> {
  return getArtisan(FIXED_DEMO_ARTISAN_ID)
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
