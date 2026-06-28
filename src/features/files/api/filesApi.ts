import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ApiError } from '@/services/api'

interface UploadResponse {
  success: boolean
  message?: string
  errorCode?: string
  data?: { url?: string }
}

export interface UploadImageSource {
  uri: string
  fileName?: string | null
  mimeType?: string | null
}

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8080'
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '').endsWith('/api')
  ? rawApiBaseUrl.replace(/\/$/, '')
  : `${rawApiBaseUrl.replace(/\/$/, '')}/api`

function getFileName(file: UploadImageSource): string {
  if (file.fileName) return file.fileName
  const extension = file.mimeType?.split('/')[1] || 'jpg'
  return `experience-${Date.now()}.${extension}`
}

export async function uploadImage(
  file: UploadImageSource,
  type = 'experience',
): Promise<string> {
  const formData = new FormData()
  const fileName = getFileName(file)
  const mimeType = file.mimeType || 'image/jpeg'

  if (Platform.OS === 'web') {
    const fileResponse = await fetch(file.uri)
    if (!fileResponse.ok) throw new Error('선택한 이미지 파일을 읽지 못했습니다.')
    formData.append('file', await fileResponse.blob(), fileName)
  } else {
    formData.append('file', { uri: file.uri, name: fileName, type: mimeType } as never)
  }
  formData.append('type', type)

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  console.log('🟡 File Upload POST:', `${API_BASE_URL}/files/upload`, 'fileName:', fileName, 'type:', type)
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const payload = (await response.json().catch(() => ({}))) as UploadResponse
  console.log('🟡 File Upload Response status:', response.status)
  console.log('🟡 File Upload Response payload:', payload)

  if (!response.ok || !payload.success) {
    throw new ApiError(
      response.status,
      payload.message ?? '이미지 업로드에 실패했습니다.',
      payload.errorCode,
    )
  }
  if (!payload.data?.url) throw new Error('이미지 업로드 응답에 URL이 없습니다.')
  return payload.data.url
}
