/**
 * Backend API 타입 정의
 * 실제 Spring DTO와 1:1 매핑
 */

// ========== Experience ==========

export interface ExperienceSchedule {
  id: number
  scheduledAt: string // ISO 8601
  availableSlots: number
  bookedSlots: number
  remainingSlots: number
  isActive: boolean
}

export interface Experience {
  id: number
  artisanId: number
  title: string
  description: string
  culturalStory: string
  category: string
  price: number
  durationMinutes: number
  maxParticipants: number
  difficulty: string
  supportedLanguages: string[]
  locationAddress: string
  locationLat: number
  locationLng: number
  isActive: boolean
  schedules: ExperienceSchedule[]
  createdAt: string
  updatedAt: string
}

// ========== Reservation ==========

export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PAID'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

/**
 * 예약 응답에 포함될 체험 정보 (평점/리뷰 포함)
 * Backend ReservationResponse.experience 필드와 매핑
 */
export interface ExperienceWithReviews {
  id: number
  title: string
  category: string
  locationAddress: string
  price: number
  durationMinutes: number
  artisanName: string
  rating: number
  reviewCount: number
  maxParticipants: number
}

export interface Reservation {
  id: number
  userId: number
  experienceId: number
  scheduleId: number
  numberOfParticipants: number
  totalPrice: number
  status: ReservationStatus
  reservedDateTime: string | null
  rejectionReason: string | null
  cancellationReason: string | null
  requestMessage: string | null
  paymentKey: string | null
  paymentOrderId: string | null
  isNotificationSent: boolean
  createdAt: string
  updatedAt: string
  // 선택적 필드: include=experience 쿼리 파라미터 사용 시 포함
  experience?: ExperienceWithReviews
}

// ========== Wishlist ==========

export interface Wishlist {
  id: number
  userId: number
  experienceId: number
  experienceTitle: string
  experienceCategory: string
  experienceLocation: string
  experiencePrice: number
  experienceDurationMinutes: number
  experienceImageUrl: string | null
  createdAt: string
  updatedAt?: string
}

// ========== CardNews ==========

export interface CardNews {
  id: number
  title: string
  contentType: string
  imageUrl: string
  aiExplanation: string
  categoryTags: string[]
  relatedExperienceIds: number[]
  isActive: boolean
  createdAt: string
}

// ========== Review ==========

export interface Review {
  id: number
  reservationId: number
  userId: number
  experienceId: number
  rating: number
  content: string
  newLearnings: string | null
  summary: string | null
  contentEn: string | null
  imageUrls: string[] | null
  sentimentScore: number | null
  keywords: string[] | null
  createdAt: string
}

// ========== AI Explain ==========

export interface ExplainSource {
  id: number
  name: string
  source: string
  category: string
}

export interface RelatedExperience {
  id: number
  title: string
  location: string
  price: number
  durationMinutes: number
  tags: string[]
}

export interface ExplainRequest {
  query: string
  locale?: string
}

export interface ExplainResponse {
  answer: string
  sources: ExplainSource[]
  matchingKeywords: string[]
  recommendedCategories: string[]
  recommendedTags: string[]
  relatedExperiences: RelatedExperience[]
  fallback: boolean
  message: string | null
}

// ========== Banner ==========

export interface Banner {
  id: number
  tag: string
  title: string
  subtitle: string
  imageUrl: string
  linkUrl?: string
}

// ========== Artisan ==========

export interface Artisan {
  id: number
  userId: number
  name: string
  heritageCategory: string
  certificationNumber: string
  bio: string
  profileImageUrl: string
  introVideoUrl: string | null
  certificationStatus: string
  verifiedAt: string | null
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  address: string | null
  latitude: number | null
  longitude: number | null
  // UI에서 사용하는 추가 필드 (선택적)
  badge?: string
  quote?: string
}

// ========== Notification ==========

export interface Notification {
  id: number
  userId: number
  title: string
  body: string
  isRead: boolean
  createdAt: string
}
