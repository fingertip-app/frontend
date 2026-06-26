import { useCallback, useState } from 'react'
import { getMasterReviews } from './masterReviewsApi'
import type { MasterReviewsData } from './types'

export function useMasterReviews() {
  const [data, setData] = useState<MasterReviewsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await getMasterReviews())
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError : new Error('후기 목록을 불러오지 못했습니다.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, reload }
}
