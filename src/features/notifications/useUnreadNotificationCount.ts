import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { getCurrentProfile } from '@/features/auth/api/authApi'
import { getUnreadNotificationCount } from './api/notificationsApi'

export function useUnreadNotificationCount(): number {
  const [count, setCount] = useState(0)

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true
      getCurrentProfile()
        .then((profile) => {
          if (!profile) return null
          return getUnreadNotificationCount(profile.id)
        })
        .then((unread) => {
          if (isCurrent) setCount(unread ?? 0)
        })
        .catch(() => {
          if (isCurrent) setCount(0)
        })

      return () => {
        isCurrent = false
      }
    }, []),
  )

  return count
}
