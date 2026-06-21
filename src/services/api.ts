import { supabase } from '@/lib/supabase'

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8080'
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '').endsWith('/api')
  ? rawApiBaseUrl.replace(/\/$/, '')
  : `${rawApiBaseUrl.replace(/\/$/, '')}/api`

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...authHeader },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<T>
    throw new ApiError(response.status, payload.message ?? `API request failed: ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<T>
  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed')
  }

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiResponse<TResponse>
    throw new ApiError(response.status, payload.message ?? `API request failed: ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<TResponse>
  if (!payload.success) {
    throw new ApiError(response.status, payload.message ?? 'API request failed')
  }

  return payload.data
}

export async function apiPatch<TRequest, TResponse>(
  path: string,
  body?: TRequest,
): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
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
