// 카드뉴스/전통시장·관광명소 — 기존 화면 타입에 맞출 필요 없는 충북 전용 콘텐츠라
// adapters.ts(Experience/Artisan 등 변환)와 분리해서 여기서 직접 다룬다.
import { chungbukGet, resolveChungbukImageUrl } from '@/services/chungbukApi'

export interface ChungbukCardNews {
  id: number
  title: string
  content_type: string
  image_url: string | null
  ai_explanation: string | null
}

export interface ChungbukTouristSpot {
  id: number
  category: '전통시장' | '관광명소'
  region: string
  sigun: string | null
  name: string
  address: string | null
  established_year: string | null
  open_cycle: string | null
  market_day: string | null
  note: string | null
  lat: string | null
  lng: string | null
  tour_type: string | null
  intro: string | null
  image_url: string | null
  hours: string | null
  tel: string | null
  url: string | null
}

export async function getChungbukCardNews(): Promise<ChungbukCardNews[]> {
  const items = await chungbukGet<ChungbukCardNews[]>('/cardnews')
  return items.map((item) => ({ ...item, image_url: resolveChungbukImageUrl(item.image_url) }))
}

export async function getChungbukTouristSpots(): Promise<ChungbukTouristSpot[]> {
  const items = await chungbukGet<ChungbukTouristSpot[]>('/tourist-spots')
  return items.map((item) => ({ ...item, image_url: resolveChungbukImageUrl(item.image_url) }))
}
