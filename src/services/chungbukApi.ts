import { supabase } from '@/lib/supabase'

// 충북 FastAPI는 기존 Spring과 별개의 서버라 base URL을 따로 둔다.
const rawChungbukBaseUrl = process.env.EXPO_PUBLIC_CHUNGBUK_API_BASE_URL?.trim() || 'http://localhost:8000'
export const CHUNGBUK_BASE_URL = rawChungbukBaseUrl.replace(/\/$/, '')
const CHUNGBUK_API_PREFIX = '/api/v1/chungbuk'

// 이미지 경로가 '/static/...' 상대경로면 충북 서버 절대 URL로 변환한다.
// (로컬/EC2 base가 달라도 같은 JSON으로 동작하게)
export function resolveChungbukImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // 경로에 공백 등 URL에 쓸 수 없는 문자가 들어있을 수 있어 세그먼트별로 인코딩한다.
  const encodedPath = url
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${CHUNGBUK_BASE_URL}${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`
}

export class ChungbukApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ChungbukApiError'
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 충북 FastAPI는 { success, data } 래핑이 없고 응답을 그대로 반환한다 (Spring과 다름).
async function parseResponse<T>(response: Response): Promise<T> {
  console.log('🟢 Chungbuk API Response status:', response.status)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { detail?: string }
    console.log('🔴 Chungbuk API Error payload:', payload)
    throw new ChungbukApiError(response.status, payload.detail ?? `Chungbuk API request failed: ${response.status}`)
  }
  const data = (await response.json()) as T
  console.log('🟢 Chungbuk API Response payload:', data)
  return data
}

export async function chungbukGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  console.log('🟢 Chungbuk API GET:', url)
  const response = await fetch(url, { headers: { ...authHeader } })
  return parseResponse<T>(response)
}

export async function chungbukPost<TRequest, TResponse>(path: string, body?: TRequest): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  console.log('🟢 Chungbuk API POST:', url)
  console.log('🟢 Chungbuk API POST body:', JSON.stringify(body, null, 2))
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return parseResponse<TResponse>(response)
}

export async function chungbukPatch<TResponse, TRequest = void>(path: string, body?: TRequest): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  console.log('🟢 Chungbuk API PATCH:', url)
  console.log('🟢 Chungbuk API PATCH body:', JSON.stringify(body, null, 2))
  const response = await fetch(url, {
    method: 'PATCH',
    headers: body !== undefined ? { 'Content-Type': 'application/json', ...authHeader } : { ...authHeader },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return parseResponse<TResponse>(response)
}

export async function chungbukDelete<TResponse = void>(path: string): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  console.log('🟢 Chungbuk API DELETE:', url)
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { ...authHeader },
  })
  console.log('🟢 Chungbuk API Response status:', response.status)
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { detail?: string }
    console.log('🔴 Chungbuk API Error payload:', payload)
    throw new ChungbukApiError(response.status, payload.detail ?? `Chungbuk API request failed: ${response.status}`)
  }
  if (response.status === 204) {
    return undefined as TResponse
  }
  return (await response.json()) as TResponse
}
