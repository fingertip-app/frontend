export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  brand: string;
  /** 단청 주 / 자개주 — primary accent (CTA, active states) */
  accent: string;
  /** 솔잎 청 / 청자개 — secondary accent */
  accentGreen: string;
  /** 청 / 남자개 — tertiary accent */
  accentBlue: string;
  /** 금 / 금선 — gold highlight (ratings, dividers) */
  gold: string;
};

// 민화(Minhwa) 모티프 — 한지 바탕에 단청 색채
export const lightColors: ThemeColors = {
  bg: "#FBF5E8",
  card: "#EFE5CE",
  text: "#2B2620",
  textSecondary: "#8A7C5E",
  border: "#DDD0B4",
  brand: "#2B2620",
  accent: "#C24438",
  accentGreen: "#2F5848",
  accentBlue: "#4A6F8E",
  gold: "#B8893B",
};

// 나전(Najeon) 모티프 — 칠흑 바탕에 자개 색채
export const darkColors: ThemeColors = {
  bg: "#0A0A0E",
  card: "#1C1822",
  text: "#EFE6DE",
  textSecondary: "#A2978F",
  border: "#2C2630",
  brand: "#EFE6DE",
  accent: "#C9A24B",
  accentGreen: "#A7BBAE",
  accentBlue: "#CBBCC2",
  gold: "#C9A24B",
};
