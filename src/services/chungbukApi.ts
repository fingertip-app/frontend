import { supabase } from '@/lib/supabase'

// 충북 FastAPI는 기존 Spring과 별개의 서버라 base URL을 따로 둔다.
const rawChungbukBaseUrl = process.env.EXPO_PUBLIC_CHUNGBUK_API_BASE_URL?.trim() || 'http://localhost:8000'
const CHUNGBUK_BASE_URL = rawChungbukBaseUrl.replace(/\/$/, '')
const CHUNGBUK_API_PREFIX = '/api/v1/chungbuk'

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
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { detail?: string }
    throw new ChungbukApiError(response.status, payload.detail ?? `Chungbuk API request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export async function chungbukGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  const response = await fetch(url, { headers: { ...authHeader } })
  return parseResponse<T>(response)
}

export async function chungbukPost<TRequest, TResponse>(path: string, body?: TRequest): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return parseResponse<TResponse>(response)
}

export async function chungbukPatch<TResponse>(path: string): Promise<TResponse> {
  const authHeader = await getAuthHeader()
  const url = `${CHUNGBUK_BASE_URL}${CHUNGBUK_API_PREFIX}${path}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { ...authHeader },
  })
  return parseResponse<TResponse>(response)
}
