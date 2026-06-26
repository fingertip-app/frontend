export interface MasterAccountProfile {
  artisanId: number
  userId: number
  name: string
  masterName: string
  heritageCategory: string
  certificationNumber: string | null
  bio: string | null
  imageUrl: string
  isVerified: boolean
  isActive: boolean
}

export interface MasterAccountStats {
  pendingReservationCount: number
  activeExperienceCount: number
  monthlyRevenue: number
  totalReservationCount: number
  reviewCount: number
  averageRating: number
}

export interface MasterAccountData {
  profile: MasterAccountProfile
  stats: MasterAccountStats
}
