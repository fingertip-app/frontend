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

// ========== Notification ==========

export interface Notification {
  id: number
  userId: number
  title: string
  body: string
  isRead: boolean
  createdAt: string
}
