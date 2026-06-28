import { chungbukPost, resolveChungbukImageUrl } from '@/services/chungbukApi'
import { adaptExplainResponse } from '@/features/chungbuk/adapters'
import type { ChungbukExplainResponse, ChungbukExperience } from '@/features/chungbuk/adapters'
import type { ExplainResponse } from '@/types/api'

/**
 * AI 문화 해설 - 충북 시도무형유산 전용 챗봇
 * POST /chungbuk/ai/explain
 *
 * @param query 질문 내용 (최대 500자)
 * @param locale 언어 코드 (기본값: "ko")
 */
export async function explainCulture(
  query: string,
  locale: string = 'ko'
): Promise<ExplainResponse> {
  const raw = await chungbukPost<{ query: string; locale: string }, ChungbukExplainResponse>(
    '/ai/explain',
    { query, locale },
  )
  return adaptExplainResponse(raw)
}

export interface ChungbukRecommendResult {
  answer: string
  matchingKeywords: string[]
  recommendedTags: string[]
  recommendedExperiences: {
    id: number
    title: string
    location: string
    price: number
    durationMinutes?: number
    tags?: string[]
    matchReason?: string
    imageUrl?: string
  }[]
  fallback: boolean
  message?: string | null
}

/**
 * 충북 체험 추천 - 자연어 질의로 충북 체험을 추천한다.
 * /experiences/recommend(체험 목록) + /ai/explain(해설 텍스트)을 조합한다.
 */
export async function recommendChungbukExperiences(
  query: string,
  locale: string = 'ko',
): Promise<ChungbukRecommendResult> {
  const experiences = await chungbukPost<{ query: string; top_k: number }, ChungbukExperience[]>(
    '/experiences/recommend',
    { query, top_k: 5 },
  )

  // 답변 텍스트는 실제 추천된 충북 체험으로 구성한다 (explain은 짧은 질의에서 '없음'을 자주 반환해 부적합).
  const topNames = experiences.slice(0, 3).map((e) => e.title).join(', ')
  const answer = experiences.length
    ? `입력하신 취향을 바탕으로 충북 무형유산 체험을 찾아봤어요. ${topNames} 등을 추천드려요.`
    : '조건에 맞는 충북 체험을 찾지 못했어요. 다른 키워드로 다시 시도해 주세요.'

  return {
    answer,
    matchingKeywords: [],
    recommendedTags: ['충북'],
    recommendedExperiences: experiences.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location ?? '충청북도',
      price: e.price,
      durationMinutes: e.duration_minutes,
      tags: ['충북'],
      matchReason: '충북 무형유산 추천 체험',
      imageUrl: resolveChungbukImageUrl(e.image_url) ?? undefined,
    })),
    fallback: false,
    message: null,
  }
}
