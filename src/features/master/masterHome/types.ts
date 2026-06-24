export interface MasterHomeProfile {
  name: string
  description: string
  detail: string
  imageUrl: string
  certificationLabel: string
}

export interface MasterHomeStats {
  todayReservationCount: number
  monthlyRevenue: number
  averageRating: number
  reviewCount: number
}

export interface MasterHomeBookingRequest {
  id: number
  title: string
  date: string
  time: string
  guests: string
  name: string
  image: string
}

export interface MasterHomeTodaySchedule {
  id: number
  title: string
  date: string
  time: string
  guests: string
  location: string
  image: string
}

export interface MasterHomeData {
  artisanId: number
  profile: MasterHomeProfile
  stats: MasterHomeStats
  bookingRequests: MasterHomeBookingRequest[]
  todaySchedules: MasterHomeTodaySchedule[]
}
