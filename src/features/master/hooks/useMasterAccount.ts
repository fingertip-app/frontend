import { useCallback, useState } from 'react'
import { getMasterAccountData } from '../api/masterAccountApi'
import type { MasterAccountData } from '../types/masterAccount'

export function useMasterAccount() {
  const [data, setData] = useState<MasterAccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await getMasterAccountData())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError
          : new Error('장인 계정 정보를 불러오지 못했습니다.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, reload }
}
