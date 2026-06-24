export type UserRole = 'USER' | 'ARTISAN' | 'ADMIN'

export interface UserProfile {
  id: number
  email: string
  provider: string
  providerId: string
  name: string
  nickname: string
  phone: string | null
  role: UserRole
  profileImageUrl: string | null
  preferredCategories?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
