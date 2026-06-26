import { useCallback, useState } from 'react'
import { getExperienceManagementData } from './experienceManagementApi'
import type { ExperienceManagementData } from './types'

export function useExperienceManagement() {
  const [data, setData] = useState<ExperienceManagementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await getExperienceManagementData())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError
          : new Error('체험 목록을 불러오지 못했습니다.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, reload }
}
