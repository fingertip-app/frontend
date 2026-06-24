import { supabase } from '@/lib/supabase'
import { redirectToLogin } from '@/navigation/navigationRef'

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8080'
// API_BASE_URL는 항상 '/api'로 끝나도록 정규화합니다.
// 따라서 apiGet('/qr/example') 호출은 실제로 `${API_BASE_URL}/qr/example`로 요청됩니다.
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '').endsWith('/api')
  ? rawApiBaseUrl.replace(/\/$/, '')
  : `${rawApiBaseUrl.replace(/\/$/, '')}/api`

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errorCode?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = 'UNKNOWN_ERROR',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 세션 만료(401) 응답을 받으면 Supabase 세션을 정리하고 로그인 화면으로 보낸다.
// 동시에 여러 요청이 401을 받아도 한 번만 처리하도록 가드.
let isHandlingUnauthorized = false
async function handleUnauthorized(): Promise<void> {
  if (isHandlingUnauthorized) return
  isHandlingUnauthorized = true
  try {
    await supabase.auth.signOut()
  } catch {
    // 로그아웃 자체가 실패해도 화면 이동은 진행
  }
  redirectToLogin()
  setTimeout(() => {
    isHandlingUnauthorized = false
  }, 2000)
}

export async function apiGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader()
  const url = `${API_BASE_URL}${path}`
  console.log('🌐 API GET:', url)
  const response = await fetch(url, {
    headers: { ...authHeader },
  })
  console.log('🌐 API Response status:', response.status)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<T>
    console.log('🔴 API Error payload:', payload)
    if (response.status === 401) void handleUnauthorized()
    throw new ApiError(
      response.status,
      payload.message ?? `API request failed: ${response.status}`,
      payload.errorCode,
    )
  }

  const payload = (await response.json()) as ApiResponse<T>
  console.log('🌐 API Response payload:', payload)
  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed', payload.errorCode)
  }

  console.log('✅ API Response data:', payload.data, typeof payload.data)
  return payload.data
}

// 토큰을 직접 받아 헤더에 주입 (로그인 직후 세션 저장 타이밍 이슈 방지)
export async function apiPostWithToken<TRequest, TResponse>(
  path: string,
  token: string,
  body?: TRequest,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<TResponse>
  if (!payload.success) {
    throw new Error(payload.message ?? 'API request failed')
  }

  return payload.data
}

export async function apiPost<TRequest, TResponse>(
  path: string,
  body?: TRequest,
): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${API_BASE_URL}${path}`
  console.log('🌐 API POST:', url)
  console.log('🌐 API POST body:', JSON.stringify(body, null, 2))
  console.log('🌐 API POST headers:', authHeader)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  console.log('🌐 API Response status:', response.status)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<TResponse>
    console.log('🔴 API Error payload:', payload)
    if (response.status === 401) void handleUnauthorized()
    throw new ApiError(
      response.status,
      payload.message ?? `API request failed: ${response.status}`,
      payload.errorCode,
    )
  }

  const payload = (await response.json()) as ApiResponse<TResponse>
  console.log('🌐 API Response payload:', payload)

  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed', payload.errorCode)
  }

  console.log('✅ API Response data:', payload.data)
  return payload.data
}

export async function apiPatch<TRequest, TResponse>(
  path: string,
  body?: TRequest,
): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${API_BASE_URL}${path}`
  console.log('🌐 API PATCH:', url)
  console.log('🌐 API PATCH body:', JSON.stringify(body, null, 2))
  console.log('🌐 API PATCH headers:', authHeader)

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  console.log('🌐 API Response status:', response.status)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<TResponse>
    console.log('🔴 API Error payload:', payload)
    if (response.status === 401) void handleUnauthorized()
    throw new ApiError(
      response.status,
      payload.message ?? `API request failed: ${response.status}`,
      payload.errorCode,
    )
  }

  const payload = (await response.json()) as ApiResponse<TResponse>
  console.log('🌐 API Response payload:', payload)

  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed', payload.errorCode)
  }

  console.log('✅ API Response data:', payload.data)
  return payload.data
}

export async function apiPut<TRequest, TResponse>(
  path: string,
  body?: TRequest,
): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<TResponse>
    if (response.status === 401) void handleUnauthorized()
    throw new ApiError(
      response.status,
      payload.message ?? `API request failed: ${response.status}`,
      payload.errorCode,
    )
  }

  const payload = (await response.json()) as ApiResponse<TResponse>
  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed', payload.errorCode)
  }

  return payload.data
}

export async function apiDelete(path: string): Promise<void> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { ...authHeader },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<void>
    if (response.status === 401) void handleUnauthorized()
    throw new ApiError(
      response.status,
      payload.message ?? `API request failed: ${response.status}`,
      payload.errorCode,
    )
  }
}
