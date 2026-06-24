import { useCallback, useEffect, useState } from 'react'
import { getMasterBookingDetail } from './masterBookingsApi'
import type { MasterBookingDetail } from './types'

export function useMasterBookingDetail(reservationId: number) {
  const [booking, setBooking] = useState<MasterBookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setBooking(await getMasterBookingDetail(reservationId))
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError : new Error('예약 상세를 불러오지 못했습니다.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [reservationId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { booking, isLoading, error, reload }
}
