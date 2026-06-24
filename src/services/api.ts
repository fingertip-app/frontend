import { supabase } from '@/lib/supabase'

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
    throw new Error(`API request failed: ${response.status}`)
  }
}
