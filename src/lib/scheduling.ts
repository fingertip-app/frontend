/**
 * 날짜/시간 포맷팅 유틸 함수
 * 예약 일정과 QR 확인서에서 사용
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * ISO 8601 형식의 날짜 문자열을 "5월 29일 (월)" 형식으로 포맷팅
 * @param iso ISO 8601 문자열 (예: "2026-05-29T10:00:00")
 * @returns 포맷된 날짜 문자열. 유효하지 않으면 "-" 반환
 */
export function formatScheduleDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "-";
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdayIndex = date.getDay();
  const weekday = WEEKDAYS[weekdayIndex];
  
  return `${month}월 ${day}일 (${weekday})`;
}

/**
 * ISO 8601 형식의 날짜 문자열에서 시간만 추출
 * @param iso ISO 8601 문자열 (예: "2026-05-29T10:00:00")
 * @returns 시간 문자열 (예: "10:00"). 유효하지 않으면 "-" 반환
 */
export function formatScheduleTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "-";
  
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${hours}:${minutes}`;
}

/**
 * 다가오는 예약을 위한 D-day 계산
 * @param iso ISO 8601 문자열
 * @returns D-day 문자열 (예: "D-4") 또는 "오늘" 또는 "지남"
 */
export function calculateDDay(iso: string | null | undefined): string {
  if (!iso) return "-";
  
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "-";
  
  // 시간 무시하고 날짜만 비교
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "오늘";
  if (diffDays < 0) return "지남";
  
  return `D-${diffDays}`;
}
