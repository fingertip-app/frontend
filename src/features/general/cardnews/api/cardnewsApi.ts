import { apiGet } from '@/services/api';
import type { CardNews } from '@/types/api';

/**
 * 활성화된 카드뉴스 목록 조회
 * GET /card-news/active
 * @returns 모든 활성 카드뉴스 목록
 * @throws Error 네트워크 에러
 */
export async function getActiveCardNews(): Promise<CardNews[]> {
  return apiGet<CardNews[]>('/card-news/active');
}

/**
 * 카드뉴스 상세 조회
 * GET /card-news/{cardNewsId}
 * @param cardNewsId 카드뉴스 ID
 * @returns 카드뉴스 상세 정보
 * @throws Error 네트워크 에러, 카드뉴스 없음 (404)
 */
export async function getCardNews(cardNewsId: number): Promise<CardNews> {
  return apiGet<CardNews>(`/card-news/${cardNewsId}`);
}

/**
 * 유형별 카드뉴스 조회
 * GET /card-news/type/{contentType}
 * @param contentType 콘텐츠 유형 (k_drama, k_pop, k_anime, festival)
 * @returns 해당 유형의 카드뉴스 목록
 * @throws Error 네트워크 에러
 */
export async function getCardNewsByType(contentType: string): Promise<CardNews[]> {
  return apiGet<CardNews[]>(`/card-news/type/${contentType}`);
}
