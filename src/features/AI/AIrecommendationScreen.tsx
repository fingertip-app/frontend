import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MainLayout } from "@/features/home/MainLayout";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BG        = "#F5F0EA";   // 크림 배경
const BRAND     = "#3B2314";   // 다크 브라운 (버튼/활성)
const BRAND_MID = "#92400E";   // 미드 브라운 (가격/강조)
const CHIP_BG   = "#FFFFFF";   // 칩 기본 배경
const CHIP_BD   = "#DDD8D0";   // 칩 기본 테두리
const TEXT_MAIN = "#1C1410";
const TEXT_SUB  = "#7A6F65";

// ─── 데이터 ────────────────────────────────────────────────────────────────────
const EXPERIENCES_LIST = ["쉼/힐링", "자기계발", "활동적인", "전통문화", "예술체험"];

const FIELDS = ["도예", "목공", "한지", "염색", "전통음식", "전통주", "국악", "기타"];

type Companion = { id: string; icon: string; label: string };
const COMPANIONS: Companion[] = [
  { id: "solo",    icon: "person-outline",       label: "혼자"      },
  { id: "couple",  icon: "heart-outline",         label: "연인"      },
  { id: "friend",  icon: "people-outline",        label: "친구"      },
  { id: "family",  icon: "people-circle-outline", label: "가족"      },
  { id: "child",   icon: "happy-outline",         label: "아이와 함께" },
];

const DURATIONS = ["1시간 이내", "1~2시간", "2~3시간", "3시간 이상"];

const MOCK_RECOMMENDATIONS = [
  {
    id: "1",
    title: "이천 도자기 물레 체험",
    category: "도예",
    location: "경기 이천시",
    rating: 4.9,
    reviewCount: 128,
    price: 35000,
    imageUri: "https://picsum.photos/seed/pottery/300/200",
    reason: "가족과 함께 활동적으로 즐기기에 완벽한 도예 체험이에요!",
  },
  {
    id: "2",
    title: "전주 한지 등 만들기 체험",
    category: "한지",
    location: "전북 전주시",
    rating: 4.8,
    reviewCount: 96,
    price: 28000,
    imageUri: "https://picsum.photos/seed/hanji/300/200",
    reason: "선택하신 '한지' 관심사에 딱 맞는 인기 체험입니다.",
  },
  {
    id: "3",
    title: "전통 다과 & 다도 체험",
    category: "전통음식",
    location: "서울 중구",
    rating: 4.9,
    reviewCount: 203,
    price: 42000,
    imageUri: "https://picsum.photos/seed/tea/300/200",
    reason: "쉼/힐링을 원하시는 분께 조용한 다도 체험을 추천드려요.",
  },
];

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

/** 알약형 선택 칩 */
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** 누구와 — 아이콘 카드 */
function CompanionCard({
  item,
  active,
  onPress,
}: {
  item: Companion;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.companionCard, active && s.companionCardActive]}
    >
      <Ionicons
        name={item.icon as any}
        size={26}
        color={active ? "#FFFFFF" : TEXT_MAIN}
      />
      <Text style={[s.companionLabel, active && s.companionLabelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

/** 섹션 제목 */
function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

// ─── 결과 카드 ─────────────────────────────────────────────────────────────────
function ResultCard({ item }: { item: typeof MOCK_RECOMMENDATIONS[0] }) {
  const [liked, setLiked] = useState(false);
  return (
    <TouchableOpacity style={s.resultCard} activeOpacity={0.9}>
      <Image source={{ uri: item.imageUri }} style={s.resultImage} resizeMode="cover" />
      {/* AI 추천 이유 뱃지 */}
      <View style={s.reasonBadge}>
        <Text style={s.reasonText}>✨ {item.reason}</Text>
      </View>
      <View style={s.resultInfo}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={s.resultCategory}>{item.category}</Text>
            <Text style={s.resultTitle} numberOfLines={2}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => setLiked((p) => !p)} hitSlop={8} style={{ marginLeft: 8 }}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#EF4444" : "#D1D5DB"}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT_MAIN }}>{item.rating}</Text>
          <Text style={{ fontSize: 12, color: TEXT_SUB }}>({item.reviewCount})</Text>
          <Text style={{ color: "#DDD8D0", marginHorizontal: 4 }}>·</Text>
          <Ionicons name="location-outline" size={12} color={TEXT_SUB} />
          <Text style={{ fontSize: 12, color: TEXT_SUB }}>{item.location}</Text>
        </View>
        <Text style={s.resultPrice}>{item.price.toLocaleString()}원~</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── 메인 스크린 ───────────────────────────────────────────────────────────────
export function AIrecommendationScreen() {
  const [selExperiences, setSelExperiences] = useState<string[]>([]);
  const [selFields,      setSelFields]      = useState<string[]>([]);
  const [selCompanion,   setSelCompanion]   = useState<string | null>(null);
  const [selDuration,    setSelDuration]    = useState<string | null>(null);

  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleRecommend = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsRecommended(true);
    }, 1400);
  };

  const handleReset = () => {
    setIsRecommended(false);
    setSelExperiences([]);
    setSelFields([]);
    setSelCompanion(null);
    setSelDuration(null);
  };

  // ── 결과 화면 ──────────────────────────────────────────────────────────────
  if (isRecommended) {
    return (
      <MainLayout>
        <View style={s.safeArea}>
          {/* 헤더 */}
          <View style={[s.header, { justifyContent: "flex-start" }]}>
            <TouchableOpacity onPress={handleReset} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={TEXT_MAIN} />
            </TouchableOpacity>
          </View>

        <FlatList
          data={MOCK_RECOMMENDATIONS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={{ marginTop: 24, marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: TEXT_MAIN, lineHeight: 30 }}>
                ✨ AI가 분석한{"\n"}맞춤 체험이에요
              </Text>
              <Text style={{ fontSize: 14, color: TEXT_SUB, marginTop: 6 }}>
                선택하신 취향을 바탕으로 가장 적합한 체험을 찾았어요.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ResultCard item={item} />}
          ListFooterComponent={
            <TouchableOpacity style={s.resetButton} onPress={handleReset} activeOpacity={0.8}>
              <Ionicons name="refresh" size={17} color={TEXT_MAIN} />
              <Text style={s.resetButtonText}>다시 추천받기</Text>
            </TouchableOpacity>
          }
        />
        </View>
      </MainLayout>
    );
  }

  // ── 설문 화면 ──────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <View style={s.safeArea}>
      {/* 헤더 */}
        <View style={[s.header, { justifyContent: "flex-end" }]}>
        <Text style={s.headerStep}>1/5</Text>
      </View>

      {/* 진행 바 */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: "20%" }]} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 인트로 */}
        <View style={{ marginBottom: 32 }}>
          <Text style={s.pageTitle}>당신의 취향을{"\n"}선택해주세요</Text>
          <Text style={s.pageSubtitle}>
            선택한 취향을 바탕으로 딱 맞는 체험을 추천해드려요.
          </Text>
        </View>

        {/* ① 어떤 경험을 원하시나요? */}
        <View style={s.section}>
          <SectionTitle>어떤 경험을 원하시나요?</SectionTitle>
          <View style={s.chipRow}>
            {EXPERIENCES_LIST.map((exp) => (
              <Chip
                key={exp}
                label={exp}
                active={selExperiences.includes(exp)}
                onPress={() =>
                  setSelExperiences((p) => toggleArr(p, exp))
                }
              />
            ))}
          </View>
        </View>

        {/* ② 어떤 분야에 관심이 있으신가요? */}
        <View style={s.section}>
          <SectionTitle>어떤 분야에 관심이 있으신가요?</SectionTitle>
          <View style={s.chipRow}>
            {FIELDS.map((f) => (
              <Chip
                key={f}
                label={f}
                active={selFields.includes(f)}
                onPress={() => setSelFields((p) => toggleArr(p, f))}
              />
            ))}
          </View>
        </View>

        {/* ③ 누구와 함께하시나요? */}
        <View style={s.section}>
          <SectionTitle>누구와 함께하시나요?</SectionTitle>
          {/* 첫 줄: 혼자 / 연인 / 친구 */}
          <View style={s.companionRow}>
            {COMPANIONS.slice(0, 3).map((c) => (
              <CompanionCard
                key={c.id}
                item={c}
                active={selCompanion === c.id}
                onPress={() => setSelCompanion(c.id)}
              />
            ))}
          </View>
          {/* 둘째 줄: 가족 / 아이와 함께 */}
          <View style={[s.companionRow, { marginTop: 10 }]}>
            {COMPANIONS.slice(3).map((c) => (
              <CompanionCard
                key={c.id}
                item={c}
                active={selCompanion === c.id}
                onPress={() => setSelCompanion(c.id)}
              />
            ))}
          </View>
        </View>

        {/* ④ 어느 정도의 시간을 원하시나요? */}
        <View style={s.section}>
          <SectionTitle>어느 정도의 시간을 원하시나요?</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {DURATIONS.map((d) => (
              <Chip
                key={d}
                label={d}
                active={selDuration === d}
                onPress={() => setSelDuration(d)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, isAnalyzing && s.submitBtnDisabled]}
          onPress={handleRecommend}
          activeOpacity={0.85}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
              <Text style={s.submitBtnText}>AI가 취향을 분석하고 있어요...</Text>
            </View>
          ) : (
            <Text style={s.submitBtnText}>추천 체험 보기</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </MainLayout>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 4 : 12,
    paddingBottom: 12,
    backgroundColor: BG,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_MAIN,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  headerStep: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SUB,
  },

  // 진행 바
  progressBar: {
    height: 2,
    backgroundColor: "#E8E2D9",
    marginHorizontal: 0,
  },
  progressFill: {
    height: 2,
    backgroundColor: BRAND,
    borderRadius: 1,
  },

  // 스크롤
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },

  // 페이지 제목
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_MAIN,
    lineHeight: 36,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  pageSubtitle: {
    fontSize: 14,
    color: TEXT_SUB,
    lineHeight: 20,
  },

  // 섹션
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_MAIN,
    marginBottom: 14,
  },

  // 칩
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    borderWidth: 1,
    borderColor: CHIP_BD,
  },
  chipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_MAIN,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // 동반자 카드
  companionRow: {
    flexDirection: "row",
    gap: 10,
  },
  companionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: CHIP_BG,
    borderWidth: 1,
    borderColor: CHIP_BD,
    gap: 6,
  },
  companionCardActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  companionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MAIN,
  },
  companionLabelActive: {
    color: "#FFFFFF",
  },

  // 하단 버튼
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: "#E8E2D9",
  },
  submitBtn: {
    backgroundColor: BRAND,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#C4BDB5",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── 결과 화면 ──
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  resultImage: {
    width: "100%",
    height: 170,
  },
  reasonBadge: {
    position: "absolute",
    top: 136,
    left: 12,
    right: 12,
    backgroundColor: "rgba(59,35,20,0.82)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  reasonText: {
    fontSize: 12,
    color: "#FEF3E2",
    fontWeight: "600",
    lineHeight: 17,
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  resultCategory: {
    fontSize: 12,
    color: BRAND_MID,
    fontWeight: "600",
    marginBottom: 3,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_MAIN,
    lineHeight: 24,
  },
  resultPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: BRAND_MID,
    marginTop: 10,
    textAlign: "right",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4DC",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 15,
    color: TEXT_MAIN,
    fontWeight: "700",
  },
});