export interface KakaoAddressResult {
  label: string
  lat: number
  lng: number
}

interface KakaoAddressDocument {
  address_name: string
  road_address?: { address_name: string } | null
  address?: { address_name: string } | null
  y: string
  x: string
}

export async function reverseGeocodeKakaoAddress(lat: number, lng: number): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } },
    )
    if (!response.ok) return null

    const data = await response.json()
    const doc = data.documents?.[0]
    if (!doc) return null
    return doc.road_address?.address_name ?? doc.address?.address_name ?? null
  } catch {
    return null
  }
}

export async function searchKakaoAddress(query: string): Promise<KakaoAddressResult[]> {
  const apiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY
  if (!apiKey || !query.trim()) return []

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query.trim())}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } },
    )
    if (!response.ok) return []

    const data = await response.json()
    const documents = (data.documents ?? []) as KakaoAddressDocument[]
    return documents.map((doc) => ({
      label: doc.road_address?.address_name ?? doc.address?.address_name ?? doc.address_name,
      lat: Number(doc.y),
      lng: Number(doc.x),
    }))
  } catch {
    return []
  }
}
