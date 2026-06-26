import { apiPost } from '@/services/api'
import type { ExplainRequest, ExplainResponse } from '@/types/api'

/**
 * AI 문화 해설
 * POST /v1/ai/explain
 *
 * @param query 질문 내용 (최대 500자)
 * @param locale 언어 코드 (기본값: "ko")
 */
export async function explainCulture(
  query: string,
  locale: string = 'ko'
): Promise<ExplainResponse> {
  const request: ExplainRequest = {
    query,
    locale,
  }

  return apiPost<ExplainRequest, ExplainResponse>('/v1/ai/explain', request)
}
