import { chungbukPost } from '@/services/chungbukApi'
import { adaptExplainResponse } from '@/features/chungbuk/adapters'
import type { ChungbukExplainResponse } from '@/features/chungbuk/adapters'
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
