/**
 * 스마트 대화 흐름 헬퍼
 * 사용자 입력에서 키워드를 추출하여 충분한 정보가 있는지 판단
 */

type CompanionType = "ALONE" | "FRIEND" | "FAMILY" | "COUPLE" | "KIDS" | "FOREIGN_GUEST" | "OTHER";

interface ExtractedInfo {
  hasCompanion: boolean;
  hasInterest: boolean;
  hasBudget: boolean;
  hasDuration: boolean;
  companion?: CompanionType;
  headCount?: number;
  interests?: string[];
  budget?: string;
  duration?: string;
}

const COMPANION_KEYWORDS: Record<string, { type: CompanionType; headCount: number }> = {
  "혼자": { type: "ALONE", headCount: 1 },
  "혼자요": { type: "ALONE", headCount: 1 },
  "나홀로": { type: "ALONE", headCount: 1 },
  "연인": { type: "COUPLE", headCount: 2 },
  "커플": { type: "COUPLE", headCount: 2 },
  "애인": { type: "COUPLE", headCount: 2 },
  "친구": { type: "FRIEND", headCount: 2 },
  "친구랑": { type: "FRIEND", headCount: 2 },
  "친구와": { type: "FRIEND", headCount: 2 },
  "가족": { type: "FAMILY", headCount: 3 },
  "식구": { type: "FAMILY", headCount: 3 },
  "아이": { type: "KIDS", headCount: 2 },
  "자녀": { type: "KIDS", headCount: 2 },
  "아기": { type: "KIDS", headCount: 2 },
  "외국인": { type: "FOREIGN_GUEST", headCount: 2 },
};

const INTEREST_KEYWORDS: Record<string, string[]> = {
  "도자기": ["도예", "도자기", "물레"],
  "한지": ["전통종이", "한지", "닥나무"],
  "자수": ["자수", "궁중자수", "바느질"],
  "갓": ["전통모자", "갓"],
  "모시": ["전통섬유", "모시"],
  "매듭": ["전통매듭", "매듭", "노리개"],
  "판소리": ["전통음악", "판소리"],
  "탈춤": ["전통공연", "하회탈"],
  "음악": ["전통음악", "가야금"],
  "공예": ["소품만들기", "체험형"],
  "전통": ["전통문화", "체험형"],
};

const BUDGET_KEYWORDS = [
  "2만원", "2만", "20000",
  "3만원", "3만", "30000",
  "5만원", "5만", "50000",
  "만원", "원",
];

const DURATION_KEYWORDS = [
  "1시간", "한시간", "60분",
  "2시간", "두시간", "120분",
  "3시간", "세시간", "180분",
  "시간",
];

/**
 * 사용자의 모든 답변을 분석하여 정보 추출
 */
export function extractInfoFromMessages(userAnswers: string[]): ExtractedInfo {
  const combined = userAnswers.join(" ").toLowerCase();

  const info: ExtractedInfo = {
    hasCompanion: false,
    hasInterest: false,
    hasBudget: false,
    hasDuration: false,
  };

  // 1. 동행자 추출
  for (const [keyword, data] of Object.entries(COMPANION_KEYWORDS)) {
    if (combined.includes(keyword)) {
      info.hasCompanion = true;
      info.companion = data.type;
      info.headCount = data.headCount;
      break;
    }
  }

  // 2. 관심사 추출
  const detectedInterests: string[] = [];
  for (const [keyword, tags] of Object.entries(INTEREST_KEYWORDS)) {
    if (combined.includes(keyword)) {
      detectedInterests.push(...tags);
    }
  }
  if (detectedInterests.length > 0) {
    info.hasInterest = true;
    info.interests = Array.from(new Set(detectedInterests));
  }

  // 3. 예산 추출
  if (BUDGET_KEYWORDS.some(kw => combined.includes(kw))) {
    info.hasBudget = true;
    info.budget = extractBudgetRange(combined);
  }

  // 4. 시간 추출
  if (DURATION_KEYWORDS.some(kw => combined.includes(kw))) {
    info.hasDuration = true;
    info.duration = extractDuration(combined);
  }

  return info;
}

function extractBudgetRange(text: string): string {
  if (text.includes("2만") || text.includes("20000")) return "2만원대";
  if (text.includes("3만") || text.includes("30000")) return "3~5만원대";
  if (text.includes("5만") || text.includes("50000")) return "3~5만원대";
  return "상관없어요";
}

function extractDuration(text: string): string {
  if (text.includes("1시간") || text.includes("한시간") || text.includes("60분")) return "1~2시간";
  if (text.includes("2시간") || text.includes("두시간") || text.includes("120분")) return "1~2시간";
  if (text.includes("3시간") || text.includes("세시간") || text.includes("180분")) return "2~3시간";
  return "1~2시간";
}

/**
 * 추천을 위한 최소 정보가 있는지 확인
 */
export function hasMinimumInfoForRecommendation(info: ExtractedInfo): boolean {
  // 관심사는 필수, 동행자는 선택
  return info.hasInterest;
}

/**
 * 다음 질문할 단계 결정
 */
export function getNextStep(info: ExtractedInfo): "companion" | "vibe" | "budget" | "duration" | "recommend" {
  if (!info.hasCompanion) return "companion";
  if (!info.hasInterest) return "vibe";

  // 관심사까지 있으면 바로 추천 가능
  if (hasMinimumInfoForRecommendation(info)) {
    return "recommend";
  }

  if (!info.hasBudget) return "budget";
  if (!info.hasDuration) return "duration";

  return "recommend";
}
