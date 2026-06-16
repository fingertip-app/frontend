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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { DetailBottomSheet } from "./DetailBottomSheet";
import { MainLayout } from "@/features/home/MainLayout";
import { MainTabParamList } from "@/navigation/RootNavigator";

// ─── 타입 ────────────────────────────────────────────────────────────────────

type CategoryItem = {
  id: string;
  label: string;
  icon: string;
};

type FilterChip = {
  id: string;
  label: string;
  icon: string;
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
};

// ─── 상수 / 데이터 ────────────────────────────────────────────────────────────

const BRAND = "#92400E";
const BRAND_BG = "#FEF3E2";
const BRAND_LIGHT = "#B45309";

const CATEGORIES: CategoryItem[] = [
  { id: "all",      label: "전체",    icon: "✨" },
  { id: "pottery",  label: "도예",    icon: "🏺" },
  { id: "hanji",    label: "한지",    icon: "📜" },
  { id: "woodwork", label: "목공",    icon: "🪵" },
  { id: "dyeing",   label: "염색",    icon: "🎨" },
  { id: "food",     label: "전통음식", icon: "🍱" },
  { id: "etc",      label: "기타",    icon: "🪭" },
];

const FILTER_CHIPS: FilterChip[] = [
  { id: "popular",  label: "인기",       icon: "🔥" },
  { id: "family",   label: "가족체험",    icon: "👨‍👩‍👧" },
  { id: "foreign",  label: "외국인 추천", icon: "🌏" },
  { id: "monthly",  label: "월정액",     icon: "📅" },
];

const SORT_OPTIONS: SortOption[] = [
  "추천순",
  "가격 낮은순",
  "가격 높은순",
  "별점순",
  "리뷰 많은순",
];

const REGION_OPTIONS = ["전체 지역", "서울", "경기", "전북", "경남", "제주"];
const DATE_OPTIONS   = ["날짜 선택", "오늘", "이번 주말", "다음 주"];
const TIME_OPTIONS   = ["시간 선택", "오전", "오후", "저녁"];
const LEVEL_OPTIONS  = ["난이도", "입문", "초급", "중급"];

const ALL_EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "이천 도자기 물레 체험",
    category: "도예",
    location: "경기 이천시",
    artisan: "김도예 장인",
    rating: 4.9,
    reviewCount: 128,
    duration: "2시간",
    price: 35000,
    tags: [],
    badge: "BEST",
    imageUri: "https://picsum.photos/seed/pottery/300/200",
    todayBooking: true,
    foreignOk: true,
    highlight: "오늘 예약 가능",
    highlightColor: "#E87B35",
  },
  {
    id: "2",
    title: "전주 한지 등 만들기 체험",
    category: "한지",
    location: "전북 전주시",
    artisan: "한지마을",
    rating: 4.8,
    reviewCount: 96,
    duration: "1.5시간",
    price: 28000,
    tags: ["가족 추천"],
    imageUri: "https://picsum.photos/seed/hanji/300/200",
    foreignOk: true,
    familyOk: true,
  },
  {
    id: "3",
    title: "서울 전통 매듭 체험",
    category: "기타",
    location: "서울 종로구",
    artisan: "김매수 장인",
    rating: 4.7,
    reviewCount: 74,
    duration: "1시간",
    price: 25000,
    tags: ["월정액"],
    imageUri: "https://picsum.photos/seed/knot/300/200",
    foreignOk: true,
  },
  {
    id: "4",
    title: "가평 목공예 소품 만들기",
    category: "목공",
    location: "경기 가평군",
    artisan: "목공방 하루",
    rating: 4.6,
    reviewCount: 52,
    duration: "2.5시간",
    price: 30000,
    tags: ["가족 추천", "초급"],
    imageUri: "https://picsum.photos/seed/woodcraft/300/200",
  },
  {
    id: "5",
    title: "천연 염색 스카프 만들기",
    category: "염색",
    location: "서울 종로구",
    artisan: "염색공방 자연",
    rating: 4.5,
    reviewCount: 41,
    duration: "2시간",
    price: 38000,
    tags: ["외국어 가능"],
    imageUri: "https://picsum.photos/seed/dye/300/200",
    foreignOk: true,
    badge: "NEW",
  },
  {
    id: "6",
    title: "전통 다과 & 다도 체험",
    category: "전통음식",
    location: "서울 중구",
    artisan: "다원 하늘",
    rating: 4.9,
    reviewCount: 203,
    duration: "1.5시간",
    price: 42000,
    tags: ["가족 추천"],
    imageUri: "https://picsum.photos/seed/tea/300/200",
    familyOk: true,
    badge: "BEST",
  },
  {
    id: "7",
    title: "제주 옹기 체험",
    category: "도예",
    location: "제주 서귀포시",
    artisan: "제주옹기 박장인",
    rating: 4.4,
    reviewCount: 33,
    duration: "3시간",
    price: 45000,
    tags: ["초급"],
    imageUri: "https://picsum.photos/seed/jeju/300/200",
  },
  {
    id: "8",
    title: "전통 한지 부채 만들기",
    category: "한지",
    location: "전북 전주시",
    artisan: "부채마을",
    rating: 4.6,
    reviewCount: 67,
    duration: "1시간",
    price: 22000,
    tags: ["가족 추천", "입문"],
    imageUri: "https://picsum.photos/seed/fan/300/200",
    familyOk: true,
    foreignOk: true,
    highlight: "오늘 예약 가능",
    highlightColor: "#E87B35",
  },
];

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function categoryToId(label: string): string {
  return CATEGORIES.find((c) => c.label === label)?.id ?? "etc";
}

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
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      <Ionicons name="search-outline" size={18} color="#9CA3AF" />
      <TextInput
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 14,
          color: "#111827",
          padding: 0,
        }}
        placeholder="어떤 전통 체험을 찾고 있나요?"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#D1D5DB" />
        </TouchableOpacity>
      ) : (
        <Feather name="sliders" size={17} color="#6B7280" />
      )}
    </View>
  );
}

/** 카테고리 가로 스크롤 */
function CategoryRow({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 4 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
    >
      {CATEGORIES.map((cat) => {
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
                backgroundColor: active ? BRAND_BG : "#F9FAFB",
                borderWidth: 1.5,
                borderColor: active ? BRAND : "#F0EDE8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
            </View>
            <Text
              style={{
                marginTop: 5,
                fontSize: 11,
                fontWeight: active ? "700" : "500",
                color: active ? BRAND : "#6B7280",
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
              borderColor: active ? BRAND : "#E5E7EB",
              backgroundColor: active ? BRAND : "#FFFFFF",
            }}
          >
            <Text style={{ fontSize: 12, marginRight: 4 }}>{chip.icon}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: active ? "#FFFFFF" : "#374151",
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
            borderColor: "#E5E7EB",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text style={{ fontSize: 12, color: "#374151", fontWeight: "500" }}>
            {label}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#9CA3AF" style={{ marginLeft: 3 }} />
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
          backgroundColor: "#FFFFFF",
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
            backgroundColor: "#E5E7EB",
            alignSelf: "center",
            marginBottom: 16,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
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
                backgroundColor: active ? BRAND_BG : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: active ? "700" : "400",
                  color: active ? BRAND : "#374151",
                }}
              >
                {opt}
              </Text>
              {active && <Ionicons name="checkmark" size={18} color={BRAND} />}
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
function ExperienceCard({ item, onPress }: { item: Experience; onPress: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={{
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
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
              backgroundColor: BRAND,
              borderRadius: 5,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800" }}>
              {item.badge}
            </Text>
          </View>
        )}
      </View>

      {/* 정보 영역 */}
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 11, justifyContent: "space-between" }}>
        {/* 제목 + 찜 */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: "#111827", paddingRight: 6, lineHeight: 20 }} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => setLiked((p) => !p)} hitSlop={8}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#EF4444" : "#D1D5DB"} />
          </TouchableOpacity>
        </View>

        {/* 위치 · 장인 */}
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
          {item.location} · {item.artisan}
        </Text>

        {/* 별점 · 리뷰 · 시간 */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>{item.rating}</Text>
          <Text style={{ fontSize: 12, color: "#9CA3AF" }}>({item.reviewCount})</Text>
          <Text style={{ color: "#E5E7EB", marginHorizontal: 2 }}>·</Text>
          <Feather name="clock" size={11} color="#9CA3AF" />
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 2 }}>{item.duration}</Text>
        </View>

        {/* 태그 행 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 5, alignItems: "center" }}>
          {item.foreignOk && (
            <View style={{ backgroundColor: "#EFF6FF", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#0369A1" }}>외국어 가능</Text>
            </View>
          )}
          {item.highlight && (
            <View style={{ backgroundColor: BRAND_BG, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: item.highlightColor }}>{item.highlight}</Text>
            </View>
          )}
          {item.tags.map((t) => <TagBadge key={t} label={t} />)}
        </View>

        {/* 가격 */}
        <Text style={{ textAlign: "right", fontSize: 15, fontWeight: "800", color: BRAND, marginTop: 4 }}>
          {item.price.toLocaleString()}원~
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** 결과 없음 */
function EmptyState({ query }: { query: string }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 80 }}>
      <Text style={{ fontSize: 40 }}>🔍</Text>
      <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", color: "#374151" }}>
        검색 결과가 없어요
      </Text>
      <Text style={{ marginTop: 6, fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
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

  const [query, setQuery]               = useState("");
  const [activeCategory, setCategory]   = useState("all");
  const [activeFilter, setFilter]       = useState(route.params?.filter ?? "popular");
  const [openDropdown, setDropdown]     = useState<DropdownKey>(null);
  const [selectedExp, setSelectedExp]   = useState<Experience | null>(null);

  // 드롭다운 선택값
  const [region, setRegion] = useState("지역");
  const [date,   setDate]   = useState("날짜");
  const [time,   setTime]   = useState("시간");
  const [level,  setLevel]  = useState("난이도");
  const [sort,   setSort]   = useState<SortOption>("추천순");

  // 라우트 파라미터가 변경될 때마다 필터를 갱신
  useEffect(() => {
    if (route.params?.filter) {
      setFilter(route.params.filter);
      // 파라미터를 적용한 후 초기화하여 다음에 또 들어와도 useEffect가 다시 실행되게 함
      navigation.setParams({ filter: undefined });
    }
  }, [route.params?.filter, navigation]);

  // 드롭다운 설정 맵
  const dropdownConfig: Record<
    Exclude<DropdownKey, null>,
    { title: string; options: string[]; selected: string; onSelect: (v: string) => void }
  > = {
    region: { title: "지역 선택",  options: REGION_OPTIONS, selected: region, onSelect: setRegion },
    date:   { title: "날짜 선택",  options: DATE_OPTIONS,   selected: date,   onSelect: setDate   },
    time:   { title: "시간 선택",  options: TIME_OPTIONS,   selected: time,   onSelect: setTime   },
    level:  { title: "난이도 선택", options: LEVEL_OPTIONS,  selected: level,  onSelect: setLevel  },
    sort:   { title: "정렬 기준",  options: SORT_OPTIONS,   selected: sort,   onSelect: (v) => setSort(v as SortOption) },
  };

  // 필터링 + 정렬
  const results = useMemo(() => {
    let list = ALL_EXPERIENCES.filter((exp) => {
      // 카테고리
      if (activeCategory !== "all") {
        const catLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label;
        if (catLabel && exp.category !== catLabel) return false;
      }
      // 필터 칩
      if (activeFilter === "family"  && !exp.familyOk)  return false;
      if (activeFilter === "foreign" && !exp.foreignOk) return false;
      if (activeFilter === "monthly" && !exp.tags.includes("월정액")) return false;
      // 검색어
      if (query) {
        const q = query.toLowerCase();
        if (!exp.title.includes(q) && !exp.location.includes(q) && !exp.artisan.includes(q))
          return false;
      }
      return true;
    });

    // 정렬
    if (sort === "가격 낮은순")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "가격 높은순")  list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "별점순")       list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "리뷰 많은순")   list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);

    return list;
  }, [query, activeCategory, activeFilter, sort]);

  const currentDropdown = openDropdown ? dropdownConfig[openDropdown] : null;

  return (
    <MainLayout>
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        {/* ── 검색창 ── */}
        <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />

        {/* ── 스크롤 콘텐츠 ── */}
        <FlatList
          data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExperienceCard item={item} onPress={() => setSelectedExp(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState query={query} />}
        ListHeaderComponent={
          <>
            {/* 카테고리 */}
            <CategoryRow selected={activeCategory} onSelect={setCategory} />

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
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>전체 </Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: BRAND }}>{results.length}</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>개의 체험</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => setDropdown("sort")}
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Feather name="bar-chart-2" size={13} color="#6B7280" />
                <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>{sort}</Text>
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
