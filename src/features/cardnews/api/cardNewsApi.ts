import { apiGet } from '@/services/api'
import type { CardNews } from '@/types/api'

/**
 * 활성 카드뉴스 목록 조회
 * GET /card-news/active
 *
 * ⚠️ 경로는 /card-news (하이픈 포함)
 */
export async function getActiveCardNews(): Promise<CardNews[]> {
  return apiGet<CardNews[]>('/card-news/active')
}

/**
 * 카드뉴스 상세 조회
 * GET /card-news/{cardNewsId}
 */
export async function getCardNewsDetail(cardNewsId: number): Promise<CardNews> {
  return apiGet<CardNews>(`/card-news/${cardNewsId}`)
}

/**
 * 타입별 카드뉴스 조회
 * GET /card-news/type/{contentType}
 */
export async function getCardNewsByType(contentType: string): Promise<CardNews[]> {
  return apiGet<CardNews[]>(`/card-news/type/${contentType}`)
}
