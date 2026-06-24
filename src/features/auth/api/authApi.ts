import { supabase } from '@/lib/supabase'
import { apiGet, apiPost, apiPostWithToken, apiPatch, apiDelete } from '@/services/api'
import { UserProfile } from '@/features/auth/types'

export interface LoginResult {
  profile: UserProfile
}

export interface SignUpResult {
  needsEmailVerification: boolean
  accessToken: string | null
}

export interface ArtisanApplicationRequest {
  name: string
  heritageCategory: string
  certificationNumber?: string
  bio?: string
  profileImageUrl?: string
  introVideoUrl?: string
}

/**
 * 로그인
 * 1. Supabase로 이메일/비밀번호 인증
 * 2. 백엔드 POST /auth/login으로 user 프로필 + role 조회
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(mapSupabaseError(error.message))
  }

  if (!data.session) {
    throw new Error('로그인에 실패했습니다.')
  }

  // 백엔드에서 user 프로필 + role 조회 — 세션 저장 타이밍 이슈 방지용으로 토큰 직접 전달
  const profile = await apiPostWithToken<undefined, UserProfile>('/auth/login', data.session.access_token)

  return { profile }
}

/**
 * 일반 회원가입
 * Supabase에 계정 생성 (백엔드 user는 첫 로그인 시 자동 생성됨)
 */
export async function signUp(email: string, password: string, nickname: string, name: string, phone: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, name, phone },
    },
  })

  if (error) {
    throw new Error(mapSupabaseError(error.message))
  }

  // identities가 비어있으면 이미 가입된 이메일
  if (data.user?.identities?.length === 0) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  // 이메일 인증이 필요한 경우 session이 null
  const needsEmailVerification = data.session === null

  return {
    needsEmailVerification,
    accessToken: data.session?.access_token ?? null,
  }
}

/**
 * 장인 파트너 신청
 * 현재 Spring ArtisanRequest 계약에 맞춰 최소 필드만 전송한다.
 */
export async function applyArtisan(
  request: ArtisanApplicationRequest,
  accessToken?: string | null,
): Promise<void> {
  if (accessToken) {
    await apiPostWithToken<ArtisanApplicationRequest, unknown>('/artisans/apply', accessToken, request)
    return
  }

  await apiPost<ArtisanApplicationRequest, unknown>('/artisans/apply', request)
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error('로그아웃에 실패했습니다.')
  }
}

/**
 * 회원 탈퇴
 */
export async function deleteAccount(): Promise<void> {
  // 백엔드에서 계정 비활성화
  await apiDelete('/users/me')

  // Supabase 세션 삭제
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error('로그아웃에 실패했습니다.')
  }
}

/**
 * 현재 세션의 user 프로필 조회 (자동 로그인용)
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null

  try {
    return await apiPost<undefined, UserProfile>('/auth/login')
  } catch (error) {
    // 토큰이 만료되었거나 유효하지 않으면 세션 삭제
    console.warn('[Auth] 토큰 만료 또는 유효하지 않음, 로그아웃 처리:', error)
    await supabase.auth.signOut()
    return null
  }
}

/**
 * 이메일 중복 확인 — true: 사용 가능, false: 이미 사용 중
 */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  return apiGet<boolean>(`/users/check/email?email=${encodeURIComponent(email)}`)
}

/**
 * 닉네임 중복 확인 — true: 사용 가능, false: 이미 사용 중
 */
export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  return apiGet<boolean>(`/users/check/nickname?nickname=${encodeURIComponent(nickname)}`)
}

/**
 * 프로필 수정
 */
export async function updateProfile(
  name: string,
  nickname: string,
  phone: string | null,
  profileImageUrl: string | null,
  preferredCategories: string[]
): Promise<UserProfile> {
  return apiPatch<
    { name: string; nickname: string; phone: string | null; profileImageUrl: string | null; preferredCategories: string[] },
    UserProfile
  >('/users/me', { name, nickname, phone, profileImageUrl, preferredCategories })
}

/**
 * 이미지 업로드
 */
export async function uploadImage(file: File | Blob, type: string = 'profile'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.')
  }

  const result = await response.json()
  return result.data.url
}

function mapSupabaseError(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (message.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 메일함을 확인해주세요.'
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다.'
  if (message.includes('Password should be')) return '비밀번호는 6자 이상이어야 합니다.'
  return message
}
