import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useMasterHome } from "./useMasterHome";
import { useTheme } from "@/theme/ThemeContext";

function confirmAction(title: string, message: string, confirmText: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "취소", style: "cancel", onPress: () => resolve(false) },
      { text: confirmText, onPress: () => resolve(true) },
    ]);
  });
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export function MasterHomeScreen({
  onMenuPress,
  onNotificationPress,
}: {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { data, error, reload, approve, reject } = useMasterHome();
  const bookingRequests = data?.bookingRequests ?? [];
  const todaySchedules = data?.todaySchedules ?? [];

  // 예약 관리 등 다른 화면에서 승인/거절하고 돌아왔을 때 최신 상태로 갱신
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  // 데이터가 없는 게 아니라 조회 자체가 실패한 경우를 구분해서 알려줌
  useEffect(() => {
    if (error) Alert.alert("오류", error.message);
  }, [error]);

  const handleApprove = async (id: number) => {
    if (!(await confirmAction("예약 승인", "이 예약을 승인하시겠습니까?", "승인"))) return;
    try {
      await approve(id);
    } catch {
      Alert.alert("알림", "예약 승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: number) => {
    if (!(await confirmAction("예약 거절", "이 예약을 거절하시겠습니까?", "거절"))) return;
    try {
      await reject(id, "장인의 사정으로 예약을 거절했습니다.");
    } catch {
      Alert.alert("알림", "예약 거절에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader activeItem="홈" hasNotification={false} />

      {/* ── 본문 스크롤 ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 프로필 카드 ── */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image
            source={{ uri: data?.profile.imageUrl }}
            style={[styles.avatar, { backgroundColor: colors.border }]}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: colors.text }]}>{data?.profile.name ?? "-"}</Text>
              <View style={styles.certBadge}>
                <Text style={[styles.certText, { color: colors.text }]}>{data?.profile.certificationLabel ?? "-"}</Text>
              </View>
            </View>
            <Text style={[styles.profileDesc, { color: colors.textSecondary }]}>{data?.profile.description ?? "-"}</Text>
            <Text style={[styles.profileDesc, { color: colors.textSecondary }]}>{data?.profile.detail ?? "-"}</Text>
            <TouchableOpacity
              style={styles.profileLinkRow}
              onPress={() => navigation.navigate("MasterProfile")}
            >
              <Text style={[styles.profileLink, { color: colors.textSecondary }]}>프로필 보기</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 오늘의 현황 ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘의 현황</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => navigation.navigate("MasterTodayStatus")}
          >
            <Text style={[styles.moreLink, { color: colors.textSecondary }]}>더보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 8 }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>오늘 예약</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data?.stats.todayReservationCount ?? 0}<Text style={[styles.statUnit, { color: colors.textSecondary }]}>건</Text>
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>이번 달 수익</Text>
            <Text style={[styles.statValue, { color: colors.text, fontSize: 22 }]}>
              {(data?.stats.monthlyRevenue ?? 0).toLocaleString("ko-KR")}<Text style={[styles.statUnit, { color: colors.textSecondary }]}>원</Text>
            </Text>
          </View>
        </View>
        <View style={[styles.statsGrid, { marginTop: 0 }]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 8 }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>평균 평점</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
              <Ionicons name="star" size={18} color={colors.gold} />
              <Text style={[styles.statValue, { color: colors.text, marginTop: 0 }]}>
                {(data?.stats.averageRating ?? 0).toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>누적 후기</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data?.stats.reviewCount ?? 0}<Text style={[styles.statUnit, { color: colors.textSecondary }]}>개</Text>
            </Text>
          </View>
        </View>

        {/* ── 예약 요청 ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>예약 요청</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => navigation.navigate("MasterBookings")}
          >
            <Text style={[styles.moreLink, { color: colors.textSecondary }]}>전체 보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        {bookingRequests.map((item) => (
          <View key={item.id} style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.bookingTop}>
              <Image source={{ uri: item.image }} style={[styles.bookingImage, { backgroundColor: colors.border }]} />
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingTitle, { color: colors.text }]}>{item.title}</Text>
                <View style={styles.bookingMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>
                    {item.date}  {item.time} · {item.guests}
                  </Text>
                </View>
                <View style={styles.bookingMetaRow}>
                  <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>{item.name}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bookingActions}>
              <TouchableOpacity style={[styles.rejectBtn, { borderColor: colors.border }]} onPress={() => handleReject(item.id)}>
                <Text style={[styles.rejectText, { color: colors.textSecondary }]}>거절</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.approveBtn, { backgroundColor: colors.text }]} onPress={() => handleApprove(item.id)}>
                <Text style={[styles.approveText, { color: colors.bg }]}>승인</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── 오늘 체험 일정 ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘 체험 일정</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => navigation.navigate("MasterBookings")}
          >
            <Text style={[styles.moreLink, { color: colors.textSecondary }]}>전체 보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        {todaySchedules.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Image source={{ uri: item.image }} style={[styles.scheduleImage, { backgroundColor: colors.border }]} />
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.scheduleMeta, { color: colors.textSecondary }]}>
                {item.date}  {item.time} · {item.guests}
              </Text>
              <View style={styles.bookingMetaRow}>
                <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.bookingMeta, { color: colors.textSecondary, flexShrink: 1 }]}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="홈" />
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  // 프로필 카드
  profileCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  profileInfo: { flex: 1 },
  profileNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  profileName: { fontSize: 17, fontWeight: "700" },
  certBadge: {
    backgroundColor: "#EDE0D4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  certText: { fontSize: 11, fontWeight: "600" },
  profileDesc: { fontSize: 13, lineHeight: 20 },
  profileLinkRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  profileLink: { fontSize: 13, fontWeight: "500" },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  moreLink: { fontSize: 13 },

  // 통계 2x2 그리드
  statsGrid: { flexDirection: "row", marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  statLabel: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  statValue: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  statUnit: { fontSize: 14, fontWeight: "500" },

  // 예약 요청 카드
  bookingCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  bookingTop: { flexDirection: "row", gap: 12, marginBottom: 14 },
  bookingImage: { width: 80, height: 80, borderRadius: 10 },
  bookingInfo: { flex: 1, justifyContent: "center", gap: 5 },
  bookingTitle: { fontSize: 15, fontWeight: "700" },
  bookingMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bookingMeta: { fontSize: 12 },
  bookingActions: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
  },
  rejectText: { fontSize: 14, fontWeight: "600" },
  approveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
  },
  approveText: { fontSize: 14, fontWeight: "600" },

  // 오늘 체험 일정 카드
  scheduleCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  scheduleImage: { width: 72, height: 72, borderRadius: 10 },
  scheduleInfo: { flex: 1, justifyContent: "center", gap: 4 },
  scheduleTitle: { fontSize: 15, fontWeight: "700" },
  scheduleMeta: { fontSize: 12 },
});
