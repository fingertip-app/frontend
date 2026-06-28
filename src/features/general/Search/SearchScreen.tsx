import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { DetailBottomSheet } from "./DetailBottomSheet";
import { MainLayout } from "@/features/general/home/MainLayout";
import { MainTabParamList } from "@/navigation/RootNavigator";
import { getActiveExperiencesWithReviewStats } from "@/features/experiences/api/experiencesApi";
import { addToWishlist, removeFromWishlist, checkWishlist } from "@/features/wishlists/api/wishlistsApi";
import type { Experience as ApiExperience } from "@/types/api";
import { useTheme } from "@/theme/ThemeContext";
import type { ThemeColors } from "@/theme/colors";

// ─── 타입 ────────────────────────────────────────────────────────────────────

type CategoryItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type FilterChip = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type SortOption = "추천순" | "가격 낮은순" | "가격 높은순" | "별점순" | "리뷰 많은순";

export type Experience = {
  id: string;
  title: string;
  category: string;
  location: string;
  artisan: string;
  rating: number;
  reviewCount: number;
  duration: string;
  price: number;
  tags: string[];
  badge?: "BEST" | "NEW";
  imageUri: string;
  todayBooking?: boolean;
  foreignOk?: boolean;
  familyOk?: boolean;
  highlight?: string;
  highlightColor?: string;
  difficulty: string;
};

// ─── 상수 / 데이터 ────────────────────────────────────────────────────────────

// 체험의 category는 자유 텍스트(백엔드 Experience.category)라 고정된 값 목록이 없다.
// 알려진 분야는 선형 아이콘으로 표시하고, 모르는 분야는 기본 아이콘으로 처리한다.
const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  도자기: "ellipse-outline",
  도예: "ellipse-outline",
  한지공예: "document-text-outline",
  한지: "document-text-outline",
  목공: "hammer-outline",
  염색: "color-palette-outline",
  전통음식: "restaurant-outline",
  모시짜기: "git-branch-outline",
  갓일: "ribbon-outline",
  자수: "cut-outline",
  매듭공예: "link-outline",
  한복: "shirt-outline",
  탈제작: "happy-outline",
  국악: "musical-notes-outline",
  전통주: "wine-outline",
};
const DEFAULT_CATEGORY_ICON: React.ComponentProps<typeof Ionicons>["name"] = "sparkles-outline";

const FILTER_CHIPS: FilterChip[] = [
  { id: "popular", label: "인기", icon: "flame-outline" },
  { id: "family", label: "가족체험", icon: "people-outline" },
  { id: "foreign", label: "외국인 추천", icon: "earth-outline" },
  { id: "monthly", label: "월정액", icon: "calendar-outline" },
];

const SORT_OPTIONS: SortOption[] = [
  "추천순",
  "가격 낮은순",
  "가격 높은순",
  "별점순",
  "리뷰 많은순",
];

const DATE_OPTIONS   = ["날짜 선택", "오늘", "이번 주말", "다음 주"];
const TIME_OPTIONS   = ["시간 선택", "오전", "오후", "저녁"];

// locationAddress의 시/도 전체 표기를 짧은 표시명으로 변환 (목록에 없으면 앞 2글자로 대체)
const REGION_LABELS: Record<string, string> = {
  "서울특별시": "서울",
  "경기도": "경기",
  "인천광역시": "인천",
  "강원도": "강원",
  "강원특별자치도": "강원",
  "충청북도": "충북",
  "충청남도": "충남",
  "대전광역시": "대전",
  "세종특별자치시": "세종",
  "전라북도": "전북",
  "전북특별자치도": "전북",
  "전라남도": "전남",
  "광주광역시": "광주",
  "경상북도": "경북",
  "경상남도": "경남",
  "대구광역시": "대구",
  "울산광역시": "울산",
  "부산광역시": "부산",
  "제주특별자치도": "제주",
};

function shortRegionOf(location: string): string {
  const province = location.trim().split(/\s+/)[0] ?? "";
  return REGION_LABELS[province] ?? province.slice(0, 2);
}

// API Experience를 UI Experience로 변환
function mapApiExperienceToUI(exp: ApiExperience): Experience {
  const hasUpcomingSchedule = exp.schedules?.some(s => {
    const scheduledDate = new Date(s.scheduledAt);
    const today = new Date();
    return s.isActive && scheduledDate >= today && s.remainingSlots > 0;
  });

  const isFamilyFriendly = exp.maxParticipants >= 4;
  // supportedLanguages가 비어있으면(아직 데이터 미입력) 외국인 추천에서도 노출되도록 기본값 true 처리
  const isForeignOk = !exp.supportedLanguages?.length
    || exp.supportedLanguages.includes('en')
    || exp.supportedLanguages.includes('영어');

  // images 배열에서 첫 번째 이미지 URL 추출
  const imageUrl = exp.images && exp.images.length > 0
    ? exp.images[0].imageUrl
    : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";

  return {
    id: String(exp.id),
    title: exp.title,
    category: exp.category || "기타",
    location: exp.locationAddress || "위치 미정",
    artisan: "장인", // TODO: artisan 정보 추가 필요
    rating: Number((exp.averageRating ?? 0).toFixed(1)),
    reviewCount: exp.reviewCount ?? 0,
    duration: exp.durationMinutes ? `${exp.durationMinutes}분` : "시간 미정",
    price: exp.price || 0,
    tags: exp.tags ?? [],
    imageUri: imageUrl,
    todayBooking: hasUpcomingSchedule,
    foreignOk: isForeignOk,
    familyOk: isFamilyFriendly,
    highlight: hasUpcomingSchedule ? "예약 가능" : undefined,
    highlightColor: "#E87B35",
    difficulty: exp.difficulty || "초급",
  };
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────


// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

/** 상단 검색바 */
function SearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 14,
          color: colors.text,
          padding: 0,
        }}
        placeholder="어떤 전통 체험을 찾고 있나요?"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.border} />
        </TouchableOpacity>
      ) : (
        <Feather name="sliders" size={17} color={colors.textSecondary} />
      )}
    </View>
  );
}

/** 카테고리 가로 스크롤 */
function CategoryRow({
  categories,
  selected,
  onSelect,
}: {
  categories: CategoryItem[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 4 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
    >
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
            style={{ alignItems: "center" }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: active ? colors.accent : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={cat.icon}
                size={22}
                color={active ? colors.accent : colors.textSecondary}
              />
            </View>
            <Text
              style={{
                marginTop: 5,
                fontSize: 11,
                fontWeight: active ? "700" : "500",
                color: active ? colors.accent : colors.textSecondary,
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/** 필터 칩 (인기 / 가족체험 / 외국인 추천 / 월정액) */
function FilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
    >
      {FILTER_CHIPS.map((chip) => {
        const active = selected === chip.id;
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => onSelect(active ? "" : chip.id)}
            activeOpacity={0.75}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? colors.accent : colors.border,
              backgroundColor: active ? colors.accent : colors.card,
            }}
          >
            <Ionicons
              name={chip.icon}
              size={14}
              color={active ? colors.bg : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: active ? colors.bg : colors.text,
              }}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/** 드롭다운 필터 행 (지역 / 날짜 / 시간 / 난이도 / 정렬) */
function DropdownRow({
  region, date, time, level, sort,
  onRegion, onDate, onTime, onLevel, onSort,
}: {
  region: string; date: string; time: string; level: string; sort: SortOption;
  onRegion: () => void; onDate: () => void; onTime: () => void;
  onLevel: () => void; onSort: () => void;
}) {
  const { colors } = useTheme();
  const chips = [
    { label: region, onPress: onRegion },
    { label: date,   onPress: onDate   },
    { label: time,   onPress: onTime   },
    { label: level,  onPress: onLevel  },
    { label: sort,   onPress: onSort   },
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
    >
      {chips.map(({ label, onPress }) => (
        <TouchableOpacity
          key={label}
          onPress={onPress}
          activeOpacity={0.75}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.text, fontWeight: "500" }}>
            {label}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

/** 인라인 드롭다운 시트 */
function DropdownSheet({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 100,
      }}
    >
      {/* 딤드 배경 */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      {/* 시트 */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 32,
          paddingTop: 8,
        }}
      >
        {/* 핸들 */}
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginBottom: 16,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            paddingHorizontal: 20,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => { onSelect(opt); onClose(); }}
              activeOpacity={0.75}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: active ? colors.bg : colors.card,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: active ? "700" : "400",
                  color: active ? colors.accent : colors.text,
                }}
              >
                {opt}
              </Text>
              {active && <Ionicons name="checkmark" size={18} color={colors.accent} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** 태그 뱃지 */
function TagBadge({ label }: { label: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "가족 추천":  { bg: "#F0FDF4", text: "#15803D" },
    "월정액":    { bg: "#F5F3FF", text: "#7C3AED" },
    "초급":      { bg: "#EFF6FF", text: "#1D4ED8" },
    "입문":      { bg: "#ECFDF5", text: "#059669" },
    "외국어 가능": { bg: "#EFF6FF", text: "#0369A1" },
  };
  const style = map[label] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: style.text }}>{label}</Text>
    </View>
  );
}

/** 체험 카드 */
function ExperienceCard({ item, onPress, refreshTrigger }: { item: Experience; onPress: () => void; refreshTrigger?: number }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  // 마운트 시 + refreshTrigger 변경 시 찜 상태 확인
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const isLiked = await checkWishlist(Number(item.id));
        setLiked(isLiked);
      } catch (e) {
        console.log("찜 상태 확인 실패:", e);
      }
    };
    fetchWishlistStatus();
  }, [item.id, refreshTrigger]);

  // 찜 토글 핸들러
  const handleToggleWishlist = async () => {
    if (loading) return;

    setLoading(true);
    const experienceId = Number(item.id);

    try {
      if (liked) {
        await removeFromWishlist(experienceId);
        setLiked(false);
        console.log("✅ 찜 해제:", item.title);
      } else {
        await addToWishlist(experienceId);
        setLiked(true);
        console.log("✅ 찜 추가:", item.title);
      }
    } catch (error: any) {
      console.error("❌ 찜 토글 실패:", error);

      // 409 에러 (이미 찜됨) 처리
      if (error.status === 409) {
        console.log("⚠️ 이미 찜된 체험 - 상태 동기화");
        setLiked(true);
      } else {
        Alert.alert("알림", "찜 기능을 사용할 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 18,
        marginHorizontal: 16,
        marginBottom: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* 썸네일 */}
      <View>
        <Image
          source={{ uri: item.imageUri }}
          style={{ width: 112, height: 112 }}
          resizeMode="cover"
        />
        {item.badge && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: colors.accent,
              borderRadius: 5,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: colors.bg, fontSize: 10, fontWeight: "800" }}>
              {item.badge}
            </Text>
          </View>
        )}
      </View>

      {/* 정보 영역 */}
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 11, justifyContent: "space-between" }}>
        {/* 제목 + 찜 */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: colors.text, paddingRight: 6, lineHeight: 20 }} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={handleToggleWishlist} hitSlop={8} disabled={loading}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? colors.accent : colors.border} />
          </TouchableOpacity>
        </View>

        {/* 위치 · 장인 */}
        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
          {item.location} · {item.artisan}
        </Text>

        {/* 별점 · 리뷰 · 시간 */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
          <Ionicons name="star" size={12} color={colors.gold} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{item.rating}</Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>({item.reviewCount})</Text>
          <Text style={{ color: colors.border, marginHorizontal: 2 }}>·</Text>
          <Feather name="clock" size={11} color={colors.textSecondary} />
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 2 }}>{item.duration}</Text>
        </View>

        {/* 태그 행 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 5, alignItems: "center" }}>
          {item.foreignOk && (
            <View style={{ backgroundColor: "#EFF6FF", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#0369A1" }}>외국어 가능</Text>
            </View>
          )}
          {item.highlight && (
            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.accent }}>{item.highlight}</Text>
            </View>
          )}
          {item.tags.map((t) => <TagBadge key={t} label={t} />)}
        </View>

        {/* 가격 */}
        <Text style={{ textAlign: "right", fontSize: 15, fontWeight: "800", color: colors.accent, marginTop: 4 }}>
          {item.price.toLocaleString()}원~
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** 결과 없음 */
function EmptyState({ query }: { query: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingTop: 80 }}>
      <Ionicons name="search-outline" size={40} color={colors.border} />
      <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", color: colors.text }}>
        검색 결과가 없어요
      </Text>
      <Text style={{ marginTop: 6, fontSize: 13, color: colors.textSecondary, textAlign: "center" }}>
        {query ? `"${query}"에 해당하는 체험이 없습니다.\n다른 키워드로 검색해 보세요.` : "조건에 맞는 체험이 없습니다."}
      </Text>
    </View>
  );
}

// ─── 드롭다운 상태 타입 ────────────────────────────────────────────────────────
type DropdownKey = "region" | "date" | "time" | "level" | "sort" | null;

// ─── 메인 스크린 ──────────────────────────────────────────────────────────────

export function SearchScreen() {
  const route = useRoute<RouteProp<MainTabParamList, "Explore">>();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, "Explore">>();
  const { colors } = useTheme();

  const [query, setQuery]               = useState("");
  const [activeCategory, setCategory]   = useState("all");
  const [activeFilter, setFilter]       = useState(route.params?.filter ?? "popular");
  const [openDropdown, setDropdown]     = useState<DropdownKey>(null);
  const [selectedExp, setSelectedExp]   = useState<Experience | null>(route.params?.exp ?? null);
  const [relatedExperienceIds, setRelatedExperienceIds] = useState<number[] | null>(
    route.params?.relatedExperienceIds ?? null,
  );
  const [relatedCategory, setRelatedCategory] = useState<string | null>(
    route.params?.relatedCategory ?? null,
  );

  // 드롭다운 선택값
  const [region, setRegion] = useState("지역");
  const [date,   setDate]   = useState("날짜");
  const [time,   setTime]   = useState("시간");
  const [level,  setLevel]  = useState("난이도");
  const [sort,   setSort]   = useState<SortOption>("추천순");

  // API 데이터 상태
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 화면 포커스 시 찜 상태 새로고침
  useFocusEffect(
    React.useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  // API에서 체험 목록 가져오기
  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiExperiences = await getActiveExperiencesWithReviewStats();
      const uiExperiences = apiExperiences.map(mapApiExperienceToUI);
      setAllExperiences(uiExperiences);
    } catch (e) {
      console.error("체험 목록 로딩 실패:", e);
      setError("체험 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // 라우트 파라미터가 변경될 때마다 필터를 갱신
  useEffect(() => {
    if (route.params?.filter) {
      setFilter(route.params.filter);
      navigation.setParams({ filter: undefined });
    }
  }, [route.params?.filter, navigation]);

  // 다른 화면(AI 추천 등)에서 특정 체험의 상세를 바로 열도록 넘겨준 경우
  useEffect(() => {
    if (route.params?.exp) {
      setSelectedExp(route.params.exp);
      navigation.setParams({ exp: undefined });
    }
  }, [route.params?.exp, navigation]);

  // 드로어 메뉴 등 다른 화면에서 특정 분야로 바로 필터링하도록 넘겨준 경우
  useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
      navigation.setParams({ category: undefined });
    }
  }, [route.params?.category, navigation]);

  useEffect(() => {
    if (route.params?.relatedExperienceIds) {
      setRelatedExperienceIds(route.params.relatedExperienceIds);
      setRelatedCategory(null);
      setQuery("");
      setCategory("all");
      setFilter("popular");
      setRegion("지역");
      setDate("날짜");
      setTime("시간");
      setLevel("난이도");
      navigation.setParams({ relatedExperienceIds: undefined });
    }
  }, [route.params?.relatedExperienceIds, navigation]);

  useEffect(() => {
    if (route.params?.relatedCategory) {
      setRelatedCategory(route.params.relatedCategory);
      setRelatedExperienceIds(null);
      setQuery("");
      setCategory("all");
      setFilter("popular");
      setRegion("지역");
      setDate("날짜");
      setTime("시간");
      setLevel("난이도");
      navigation.setParams({ relatedCategory: undefined });
    }
  }, [route.params?.relatedCategory, navigation]);

  // 체험 목록에 실제로 존재하는 분야로 카테고리 칩을 구성 (백엔드 category는 자유 텍스트라 고정 목록과 어긋날 수 있음)
  const categories = useMemo<CategoryItem[]>(() => {
    const distinctCategories = Array.from(new Set(allExperiences.map((exp) => exp.category))).sort();
    return [
      { id: "all", label: "전체", icon: "grid-outline" },
      ...distinctCategories.map((category) => ({
        id: category,
        label: category,
        icon: CATEGORY_ICONS[category] ?? DEFAULT_CATEGORY_ICON,
      })),
    ];
  }, [allExperiences]);

  // 체험 목록에 실제로 존재하는 지역/난이도로 드롭다운 옵션 구성
  const regionOptions = useMemo(() => {
    const distinctRegions = Array.from(new Set(allExperiences.map((exp) => shortRegionOf(exp.location)))).sort();
    return ["전체 지역", ...distinctRegions];
  }, [allExperiences]);

  const levelOptions = useMemo(() => {
    const distinctLevels = Array.from(new Set(allExperiences.map((exp) => exp.difficulty))).sort();
    return ["난이도", ...distinctLevels];
  }, [allExperiences]);

  // 드롭다운 설정 맵
  const dropdownConfig: Record<
    Exclude<DropdownKey, null>,
    { title: string; options: string[]; selected: string; onSelect: (v: string) => void }
  > = {
    region: { title: "지역 선택",  options: regionOptions, selected: region, onSelect: setRegion },
    date:   { title: "날짜 선택",  options: DATE_OPTIONS,   selected: date,   onSelect: setDate   },
    time:   { title: "시간 선택",  options: TIME_OPTIONS,   selected: time,   onSelect: setTime   },
    level:  { title: "난이도 선택", options: levelOptions,  selected: level,  onSelect: setLevel  },
    sort:   { title: "정렬 기준",  options: SORT_OPTIONS,   selected: sort,   onSelect: (v) => setSort(v as SortOption) },
  };

  // 필터링 + 정렬
  const results = useMemo(() => {
    let list = allExperiences.filter((exp) => {
      if (
        relatedExperienceIds &&
        !relatedExperienceIds.includes(Number(exp.id))
      ) return false;
      if (
        relatedCategory &&
        exp.category !== relatedCategory &&
        !exp.tags.includes(relatedCategory)
      ) return false;
      // 카테고리 (카테고리 id는 실제 category 값과 동일하다)
      if (activeCategory !== "all" && exp.category !== activeCategory) return false;
      // 지역
      if (region !== "지역" && region !== "전체 지역" && shortRegionOf(exp.location) !== region) return false;
      // 난이도
      if (level !== "난이도" && exp.difficulty !== level) return false;
      // 필터 칩
      if (activeFilter === "family"  && !exp.familyOk)  return false;
      if (activeFilter === "foreign" && !exp.foreignOk) return false;
      if (activeFilter === "monthly" && !exp.tags.includes("월정액")) return false;
      // 검색어
      if (query) {
        const q = query.trim().toLowerCase();
        const searchText = `${exp.title} ${exp.location} ${exp.artisan} ${exp.category}`.toLowerCase();
        if (!searchText.includes(q)) return false;
      }
      return true;
    });

    // 정렬
    if (sort === "가격 낮은순")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "가격 높은순")  list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "별점순")       list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "리뷰 많은순")   list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);

    return list;
  }, [
    allExperiences,
    query,
    activeCategory,
    region,
    level,
    activeFilter,
    sort,
    relatedExperienceIds,
    relatedCategory,
  ]);

  const currentDropdown = openDropdown ? dropdownConfig[openDropdown] : null;

  // 로딩 중 표시
  if (isLoading) {
    return (
      <MainLayout activeItem="탐색">
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ marginTop: 12, fontSize: 14, color: colors.textSecondary }}>체험 목록을 불러오는 중...</Text>
        </View>
      </MainLayout>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <MainLayout activeItem="탐색">
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.border} />
          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", color: colors.text }}>{error}</Text>
          <TouchableOpacity
            onPress={fetchExperiences}
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: colors.accent,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: colors.bg, fontWeight: "600" }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeItem="탐색">
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar barStyle={colors.bg === "#0A0A0E" ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

        {/* ── 검색창 ── */}
        <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />

        {/* ── 스크롤 콘텐츠 ── */}
        <FlatList
          data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExperienceCard item={item} onPress={() => setSelectedExp(item)} refreshTrigger={refreshTrigger} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState query={query} />}
        ListHeaderComponent={
          <>
            {/* 카테고리 */}
            <CategoryRow categories={categories} selected={activeCategory} onSelect={setCategory} />

            {/* 필터 칩 */}
            <FilterChips selected={activeFilter} onSelect={setFilter} />

            {/* 드롭다운 행 */}
            <DropdownRow
              region={region} date={date} time={time} level={level} sort={sort}
              onRegion={() => setDropdown("region")}
              onDate={()   => setDropdown("date")}
              onTime={()   => setDropdown("time")}
              onLevel={()  => setDropdown("level")}
              onSort={()   => setDropdown("sort")}
            />

            {/* 결과 수 */}
            <View style={{ flexDirection: "row", alignItems: "baseline", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>
                {relatedExperienceIds || relatedCategory ? "관련 체험 " : "전체 "}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: colors.accent }}>{results.length}</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>개의 체험</Text>
              <View style={{ flex: 1 }} />
              {relatedExperienceIds || relatedCategory ? (
                <TouchableOpacity
                  onPress={() => {
                    setRelatedExperienceIds(null);
                    setRelatedCategory(null);
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}>전체 보기</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setDropdown("sort")}
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Feather name="bar-chart-2" size={13} color={colors.textSecondary} />
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: "500" }}>{sort}</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />

      {/* ── 드롭다운 바텀 시트 ── */}
      {openDropdown && currentDropdown && (
        <DropdownSheet
          title={currentDropdown.title}
          options={currentDropdown.options}
          selected={currentDropdown.selected}
          onSelect={currentDropdown.onSelect}
          onClose={() => setDropdown(null)}
        />
      )}

      {/* ── 상세 바텀 시트 ── */}
      {selectedExp && (
        <DetailBottomSheet
          exp={selectedExp}
          onClose={() => setSelectedExp(null)}
        />
      )}
      </View>
    </MainLayout>
  );
}
