import { apiGet } from '@/services/api';

/**
 * 배너 인터페이스
 */
export interface Banner {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl?: string;
}

/**
 * 장인 인터페이스 (추천/주변)
 */
export interface Artisan {
  id: number;
  name: string;
  badge?: string;
  quote?: string;
  imageUrl: string;
  category?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

/**
 * 히어로 배너 목록 조회
 * GET /banners/hero
 * @returns 홈 화면 상단 배너 목록
 */
export async function getHeroBanners(): Promise<Banner[]> {
  return apiGet<Banner[]>('/banners/hero');
}

/**
 * 추천 장인 조회
 * GET /artisans/recommended
 * @returns 오늘의 추천 장인
 */
export async function getRecommendedArtisan(): Promise<Artisan> {
  return apiGet<Artisan>('/artisans/recommended');
}

/**
 * 근처 장인 목록 조회
 * GET /artisans/nearby
 * @param lat 현재 위도
 * @param lng 현재 경도
 * @param radiusKm 검색 반경 (기본값: 10km)
 * @returns 근처 장인 목록
 */
export async function getNearbyArtisans(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<Artisan[]> {
  return apiGet<Artisan[]>(
    `/artisans/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
  );
}
