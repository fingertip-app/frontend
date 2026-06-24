import { useCallback, useEffect, useState } from 'react'
import {
  approveMasterReservation,
  getMasterHomeData,
  rejectMasterReservation,
} from './masterHomeApi'
import type { MasterHomeData } from './types'

interface UseMasterHomeResult {
  data: MasterHomeData | null
  isLoading: boolean
  error: Error | null
  reload: () => Promise<void>
  approve: (reservationId: number) => Promise<void>
  reject: (reservationId: number, rejectionReason: string) => Promise<void>
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('장인 홈 정보를 불러오지 못했습니다.')
}

export function useMasterHome(): UseMasterHomeResult {
  const [data, setData] = useState<MasterHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await getMasterHomeData())
    } catch (loadError) {
      setError(toError(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const approve = useCallback(
    async (reservationId: number) => {
      if (!data) throw new Error('장인 정보를 먼저 불러와야 합니다.')
      await approveMasterReservation(reservationId, data.artisanId)
      setData((current) =>
        current
          ? {
              ...current,
              bookingRequests: current.bookingRequests.filter((item) => item.id !== reservationId),
            }
          : current,
      )
    },
    [data],
  )

  const reject = useCallback(
    async (reservationId: number, rejectionReason: string) => {
      if (!data) throw new Error('장인 정보를 먼저 불러와야 합니다.')
      await rejectMasterReservation(reservationId, data.artisanId, rejectionReason)
      setData((current) =>
        current
          ? {
              ...current,
              bookingRequests: current.bookingRequests.filter((item) => item.id !== reservationId),
            }
          : current,
      )
    },
    [data],
  )

  return { data, isLoading, error, reload, approve, reject }
}
