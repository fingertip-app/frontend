export type UserRole = 'USER' | 'ARTISAN' | 'ADMIN'

export interface UserProfile {
  id: number
  email: string
  provider: string
  providerId: string
  nickname: string
  role: UserRole
  profileImageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
