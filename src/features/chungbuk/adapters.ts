// 충북 FastAPI의 raw(snake_case) 응답을 기존 화면이 기대하는 타입(Experience/Artisan 등)으로 변환한다.
// 화면 컴포넌트는 그대로 두고, api 함수 내부에서만 이 어댑터를 거쳐 데이터를 맞춰준다.
import type { Artisan, Experience, ExplainResponse, Reservation } from '@/types/api'

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
  similarity?: number
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

export interface ChungbukReservation {
  id: number
  experience_id: number
  user_name: string
  contact: string
  status: string
  created_at: string
  user_id: string | null
}

export interface ChungbukExplainResponse {
  answer: string
  sources: { id: number; name: string; source: string; category: string | null }[]
  matchingKeywords: string[]
  recommendedCategories: string[]
}

export function adaptExperience(raw: ChungbukExperience): Experience {
  return {
    id: raw.id,
    artisanId: raw.artisan_id ?? 0,
    title: raw.title,
    description: raw.description,
    culturalStory: raw.description,
    category: '무형유산 체험',
    price: raw.price,
    durationMinutes: raw.duration_minutes,
    maxParticipants: raw.max_participants,
    difficulty: '초급',
    supportedLanguages: ['ko'],
    locationAddress: raw.location ?? '충청북도',
    locationLat: 0,
    locationLng: 0,
    isActive: true,
    schedules: [],
    images: raw.image_url ? [{ id: raw.id, imageUrl: raw.image_url, displayOrder: 0 }] : [],
    tags: ['충북'],
    averageRating: 0,
    reviewCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}

export function adaptArtisan(raw: ChungbukArtisan): Artisan {
  return {
    id: raw.id,
    userId: 0,
    name: raw.name,
    heritageCategory: raw.heritage_category,
    certificationNumber: raw.certification_number,
    bio: raw.bio,
    profileImageUrl: raw.profile_image_url,
    introVideoUrl: null,
    certificationStatus: raw.is_chungbuk_certified ? 'APPROVED' : 'PENDING',
    verifiedAt: null,
    isVerified: raw.is_chungbuk_certified,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    address: raw.address,
    latitude: null,
    longitude: null,
  }
}

export function adaptExplainResponse(raw: ChungbukExplainResponse): ExplainResponse {
  return {
    answer: raw.answer,
    sources: raw.sources.map((s) => ({
      id: s.id,
      name: s.name,
      source: s.source,
      category: s.category ?? '',
    })),
    matchingKeywords: raw.matchingKeywords,
    recommendedCategories: raw.recommendedCategories,
    recommendedTags: [],
    relatedExperiences: [],
    fallback: false,
    message: null,
  }
}

export function adaptReservation(raw: ChungbukReservation): Reservation {
  const statusMap: Record<string, Reservation['status']> = {
    신청: 'PENDING',
    확정: 'CONFIRMED',
    취소: 'CANCELLED',
  }
  return {
    id: raw.id,
    userId: 0,
    experienceId: raw.experience_id,
    scheduleId: 0,
    numberOfParticipants: 1,
    totalPrice: 0,
    status: statusMap[raw.status] ?? 'PENDING',
    reservedDateTime: raw.created_at,
    rejectionReason: null,
    cancellationReason: null,
    requestMessage: null,
    paymentKey: null,
    paymentOrderId: null,
    isNotificationSent: false,
    createdAt: raw.created_at,
    updatedAt: raw.created_at,
  }
}
