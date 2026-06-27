const rawChungbukBaseUrl = process.env.EXPO_PUBLIC_CHUNGBUK_API_BASE_URL?.trim() || 'http://localhost:8000'
const CHUNGBUK_API_BASE_URL = `${rawChungbukBaseUrl.replace(/\/$/, '')}/api/v1/chungbuk`

export interface ChungbukCardNews {
  id: number
  title: string
  content_type: string
  image_url: string | null
  ai_explanation: string | null
}

export interface ChungbukArtisan {
  id: number
  name: string
  heritage_category: string
  certification_number: string | null
  is_chungbuk_certified: boolean
  bio: string | null
  profile_image_url: string | null
  address: string | null
}

export interface ChungbukExperience {
  id: number
  title: string
  description: string
  artisan_id: number | null
  region: string
  price: number
  duration_minutes: number
  max_participants: number
  image_url: string | null
  location: string | null
}

async function chungbukGet<T>(path: string): Promise<T> {
  const response = await fetch(`${CHUNGBUK_API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`충북 API 요청 실패: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function getChungbukCardNews(): Promise<ChungbukCardNews[]> {
  return chungbukGet<ChungbukCardNews[]>('/cardnews')
}

export async function getChungbukArtisans(): Promise<ChungbukArtisan[]> {
  return chungbukGet<ChungbukArtisan[]>('/artisans')
}

export async function getChungbukExperiences(): Promise<ChungbukExperience[]> {
  return chungbukGet<ChungbukExperience[]>('/experiences')
}
