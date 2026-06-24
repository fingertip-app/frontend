export interface ExperiencePhoto {
  uri: string
  fileName?: string | null
  mimeType?: string | null
}

export interface ExperienceTimeSlot {
  id: string
  startTime: string
  endTime: string
}

export interface ExperienceRegistrationParams {
  title: string
  shortDesc: string
  detail: string
  mainPhoto: ExperiencePhoto
  detailPhotos: ExperiencePhoto[]
  operationStartDate: string
  operationEndDate: string
  selectedDays: string[]
  timeSlots: ExperienceTimeSlot[]
  price: string
  minGuests: number
  maxGuests: number
}

export interface ExperienceManagementItem {
  id: number
  title: string
  bookings: number
  rating: number
  reviewCount: number
  active: boolean
  imageUri: string
  statusLabel: 'ACTIVE' | 'INACTIVE'
}

export interface ExperienceManagementData {
  activeExperienceCount: number
  reviewCount: number
  experiences: ExperienceManagementItem[]
}
