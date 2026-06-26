import type { ReservationStatus } from '@/types/api'

export type MasterBookingStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'confirmed'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type MasterBookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface MasterBookingListItem {
  id: number
  backendStatus: ReservationStatus
  status: MasterBookingStatus
  title: string
  date: string
  time: string
  bookerName: string
  guests: number
  price: number
}

export interface MasterBookingsData {
  artisanId: number
  bookings: MasterBookingListItem[]
}

export interface MasterBookingDetail extends MasterBookingListItem {
  bookerPhone: string | null
  bookerEmail: string | null
  requestMessage: string | null
  rejectionReason: string | null
  cancellationReason: string | null
}
