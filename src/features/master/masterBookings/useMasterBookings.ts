import { useCallback, useState } from 'react'
import {
  approveMasterBooking,
  getMasterBookings,
  rejectMasterBooking,
  toMasterBookingStatus,
} from './masterBookingsApi'
import type { MasterBookingsData } from './types'

export function useMasterBookings() {
  const [data, setData] = useState<MasterBookingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await getMasterBookings())
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError : new Error('예약 목록을 불러오지 못했습니다.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateStatus = useCallback((reservationId: number, backendStatus: MasterBookingsData['bookings'][number]['backendStatus']) => {
    setData((current) =>
      current
        ? {
            ...current,
            bookings: current.bookings.map((booking) =>
              booking.id === reservationId
                ? {
                    ...booking,
                    backendStatus,
                    status: toMasterBookingStatus(backendStatus),
                  }
                : booking,
            ),
          }
        : current,
    )
  }, [])

  const approve = useCallback(
    async (reservationId: number) => {
      if (!data) throw new Error('장인 예약 정보를 먼저 불러와야 합니다.')
      updateStatus(
        reservationId,
        await approveMasterBooking(reservationId),
      )
    },
    [data, updateStatus],
  )

  const reject = useCallback(
    async (reservationId: number, rejectionReason: string) => {
      if (!data) throw new Error('장인 예약 정보를 먼저 불러와야 합니다.')
      updateStatus(
        reservationId,
        await rejectMasterBooking(reservationId),
      )
    },
    [data, updateStatus],
  )

  return { data, isLoading, error, reload, approve, reject }
}
