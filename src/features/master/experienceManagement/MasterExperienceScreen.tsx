import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MasterHeader } from "../components/MasterHeader";
import { getMyArtisan } from "@/features/artisans/api/artisanApi";
import { getArtisanExperiences } from "@/features/experiences/api/experiencesApi";
import type { Experience } from "@/types/api";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80";

function mapExperienceToListItem(exp: Experience) {
  const bookings = exp.schedules?.reduce((sum, s) => sum + (s.bookedSlots ?? 0), 0) ?? 0;
  return {
    id: String(exp.id),
    title: exp.title,
    bookings: bookings > 0 ? bookings : null,
    rating: 0,
    active: exp.isActive,
    imageUri: PLACEHOLDER_IMAGE,
    statusLabel: exp.isActive ? "ACTIVE" : "INACTIVE",
  };
}

export function MasterExperienceScreen({
  onMenuPress,
  onNotificationPress,
}: {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}) {
  const [experiences, setExperiences] = useState<ReturnType<typeof mapExperienceToListItem>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadExperiences = useCallback(async () => {
    setIsLoading(true);
    try {
      const artisan = await getMyArtisan();
      const myExperiences = await getArtisanExperiences(artisan.id);
      setExperiences(myExperiences.map(mapExperienceToListItem));
    } catch {
      Alert.alert("오류", "체험 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExperiences();
    }, [loadExperiences])
  );

  const handleComingSoon = () => {
    Alert.alert("알림", "준비 중인 기능입니다.");
  };

  const handleMorePress = (id: string) => {
    Alert.alert("체험 관리", undefined, [
      { text: "수정", onPress: () => navigation.navigate("MasterExperienceCreate") },
      { text: "비활성화", onPress: () => toggleActive(id) },
      { text: "취소", style: "cancel" },
    ]);
  };

  const toggleActive = (id: string) => {
    setExperiences((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              active: !e.active,
              statusLabel: !e.active ? "ACTIVE" : "INACTIVE",
            }
          : e
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader activeItem="체험관리" hasNotification={true} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 요약 통계 2칸 ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: 8 }]}>
            <Text style={styles.statLabel}>운영 승인 체험</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>총 후기 수</Text>
            <Text style={styles.statValue}>124</Text>
          </View>
        </View>

        {/* ── 나의 체험 목록 헤더 ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>나의 체험 목록</Text>
        </View>

        {isLoading && <ActivityIndicator size="large" color={BRAND} style={{ marginTop: 20 }} />}

        {!isLoading && experiences.length === 0 && (
          <Text style={{ color: GRAY, textAlign: "center", marginTop: 20 }}>
            등록된 체험이 없습니다. 새 체험을 등록해보세요.
          </Text>
        )}

        {/* ── 체험 카드 목록 ── */}
        {!isLoading && experiences.map((item) => (
          <View key={item.id} style={styles.experienceCard}>
            {/* 이미지 + ACTIVE 뱃지 */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.statusBadge,
                  item.active ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text style={styles.badgeText}>{item.statusLabel}</Text>
              </View>
            </View>

            {/* 카드 하단 정보 */}
            <View style={styles.cardBody}>
              {/* 제목 + 더보기 */}
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <TouchableOpacity hitSlop={8} onPress={() => handleMorePress(item.id)}>
                  <Ionicons name="ellipsis-vertical" size={18} color={GRAY} />
                </TouchableOpacity>
              </View>

              {/* 예약 건수 · 평점 */}
              <Text style={styles.cardMeta}>
                {item.bookings != null
                  ? `예약 ${item.bookings}건 | 평점 ${item.rating}`
                  : `최근 진행 없음 | 평점 ${item.rating}`}
              </Text>

              {/* 수정 · 상세 · 토글 */}
              <View style={styles.cardActions}>
                <View style={styles.cardActionsLeft}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={6}
                    onPress={() => navigation.navigate("MasterExperienceCreate")}
                  >
                    <Ionicons name="pencil-outline" size={14} color={GRAY} />
                    <Text style={styles.actionBtnText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} hitSlop={6} onPress={handleComingSoon}>
                    <Ionicons name="eye-outline" size={14} color={GRAY} />
                    <Text style={styles.actionBtnText}>상세</Text>
                  </TouchableOpacity>
                </View>
                <Switch
                  value={item.active}
                  onValueChange={() => toggleActive(item.id)}
                  trackColor={{ false: "#D1CBC4", true: BRAND }}
                  thumbColor={CARD}
                  ios_backgroundColor="#D1CBC4"
                  style={Platform.OS === "android" ? { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] } : undefined}
                />
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── 새 체험 등록 FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Step1BasicInfo")}
      >
        <Ionicons name="add" size={16} color="#FFF" />
        <Text style={styles.fabText}>새체험 등록</Text>
      </TouchableOpacity>

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="체험관리" />
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  // 통계 2칸
  statsRow: { flexDirection: "row", marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statLabel: { fontSize: 13, color: GRAY, fontWeight: "500", marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800", color: BRAND },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: BRAND },
  moreLink: { fontSize: 13, color: GRAY },

  // 체험 카드
  experienceCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // 이미지 영역
  imageWrapper: { position: "relative" },
  cardImage: { width: "100%", height: 180 },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: { backgroundColor: BRAND },
  badgeInactive: { backgroundColor: "rgba(90,75,68,0.75)" },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#FFF", letterSpacing: 1 },

  // 카드 하단
  cardBody: { padding: 14 },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: BRAND, flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 13, color: GRAY, marginBottom: 14 },

  // 하단 액션 행
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardActionsLeft: { flexDirection: "row", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtnText: { fontSize: 13, color: GRAY, fontWeight: "500" },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BRAND,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 50,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: "#FFF", fontSize: 14, fontWeight: "700" },

});