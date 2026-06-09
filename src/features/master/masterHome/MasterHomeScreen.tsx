import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";
const ACCENT_BG = "#F0EBE5";

// ─── 더미 데이터 ───────────────────────────────────────────────────────────────
const BOOKING_REQUESTS = [
  {
    id: "1",
    title: "이천 도자기 물레 체험",
    date: "2024.05.29 (월)",
    time: "14:00",
    guests: "2명",
    name: "이지원 외국인",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80",
  },
  {
    id: "2",
    title: "한지 공예 체험",
    date: "2024.05.30 (목)",
    time: "10:00",
    guests: "3명",
    name: "Yuki Tanaka",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
  },
];

const TODAY_SCHEDULES = [
  {
    id: "1",
    title: "도자기 핸드빌딩 체험",
    date: "2024.05.29 (수)",
    time: "11:00",
    guests: "4명",
    location: "경기도 이천시 신둔면 도자예술로 62",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80",
  },
];

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export function MasterHomeScreen({
  onMenuPress,
  onNotificationPress,
}: {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 상단 네비 바 ── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={onMenuPress} hitSlop={12}>
          <Ionicons name="menu" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>장인 홈</Text>
        <TouchableOpacity onPress={onNotificationPress} hitSlop={12}>
          <Ionicons name="notifications-outline" size={24} color={BRAND} />
        </TouchableOpacity>
      </View>

      {/* ── 본문 스크롤 ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 프로필 카드 ── */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&q=80" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>김도예 장인</Text>
              <View style={styles.certBadge}>
                <Text style={styles.certText}>인증완료</Text>
              </View>
            </View>
            <Text style={styles.profileDesc}>국가무형문화재 제105호 도예</Text>
            <Text style={styles.profileDesc}>경기도 이천시</Text>
            <TouchableOpacity style={styles.profileLinkRow}>
              <Text style={styles.profileLink}>프로필 보기</Text>
              <Ionicons name="chevron-forward" size={13} color={GRAY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 오늘의 현황 ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 현황</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.moreLink}>더보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { marginRight: 8 }]}>
            <Text style={styles.statLabel}>오늘 예약</Text>
            <Text style={styles.statValue}>
              3<Text style={styles.statUnit}>건</Text>
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>이번 달 수익</Text>
            <Text style={[styles.statValue, { fontSize: 22 }]}>
              1,230,000<Text style={styles.statUnit}>원</Text>
            </Text>
          </View>
        </View>
        <View style={[styles.statsGrid, { marginTop: 0 }]}>
          <View style={[styles.statCard, { marginRight: 8 }]}>
            <Text style={styles.statLabel}>평균 평점</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
              <Ionicons name="star" size={18} color={BRAND} />
              <Text style={[styles.statValue, { marginTop: 0 }]}>4.9</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>누적 후기</Text>
            <Text style={styles.statValue}>
              127<Text style={styles.statUnit}>개</Text>
            </Text>
          </View>
        </View>

        {/* ── 예약 요청 ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>예약 요청</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.moreLink}>전체 보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        {BOOKING_REQUESTS.map((item) => (
          <View key={item.id} style={styles.bookingCard}>
            <View style={styles.bookingTop}>
              <Image source={{ uri: item.image }} style={styles.bookingImage} />
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>{item.title}</Text>
                <View style={styles.bookingMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color={GRAY} />
                  <Text style={styles.bookingMeta}>
                    {item.date}  {item.time} · {item.guests}
                  </Text>
                </View>
                <View style={styles.bookingMetaRow}>
                  <Ionicons name="person-outline" size={12} color={GRAY} />
                  <Text style={styles.bookingMeta}>{item.name}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bookingActions}>
              <TouchableOpacity style={styles.rejectBtn}>
                <Text style={styles.rejectText}>거절</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn}>
                <Text style={styles.approveText}>승인</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── 오늘 체험 일정 ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>오늘 체험 일정</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.moreLink}>전체 보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        {TODAY_SCHEDULES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.scheduleCard} activeOpacity={0.8}>
            <Image source={{ uri: item.image }} style={styles.scheduleImage} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleMeta}>
                {item.date}  {item.time} · {item.guests}
              </Text>
              <View style={styles.bookingMetaRow}>
                <Ionicons name="location-outline" size={12} color={GRAY} />
                <Text style={[styles.bookingMeta, { flexShrink: 1 }]}>{item.location}</Text>
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
  safeArea: { flex: 1, backgroundColor: BG },

  // 네비바
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BG,
  },
  navTitle: { fontSize: 17, fontWeight: "700", color: BRAND },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  // 프로필 카드
  profileCard: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: BORDER },
  profileInfo: { flex: 1 },
  profileNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  profileName: { fontSize: 17, fontWeight: "700", color: BRAND },
  certBadge: {
    backgroundColor: "#EDE0D4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  certText: { fontSize: 11, color: BRAND, fontWeight: "600" },
  profileDesc: { fontSize: 13, color: GRAY, lineHeight: 20 },
  profileLinkRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  profileLink: { fontSize: 13, color: GRAY, fontWeight: "500" },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: BRAND },
  moreLink: { fontSize: 13, color: GRAY },

  // 통계 2x2 그리드
  statsGrid: { flexDirection: "row", marginBottom: 8 },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statLabel: { fontSize: 13, color: GRAY, fontWeight: "500", marginBottom: 2 },
  statValue: { fontSize: 26, fontWeight: "800", color: BRAND, marginTop: 4 },
  statUnit: { fontSize: 14, fontWeight: "500", color: GRAY },

  // 예약 요청 카드
  bookingCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bookingTop: { flexDirection: "row", gap: 12, marginBottom: 14 },
  bookingImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: BORDER },
  bookingInfo: { flex: 1, justifyContent: "center", gap: 5 },
  bookingTitle: { fontSize: 15, fontWeight: "700", color: BRAND },
  bookingMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bookingMeta: { fontSize: 12, color: GRAY },
  bookingActions: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },
  rejectText: { fontSize: 14, fontWeight: "600", color: GRAY },
  approveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: BRAND,
    alignItems: "center",
  },
  approveText: { fontSize: 14, fontWeight: "600", color: "#FFF" },

  // 오늘 체험 일정 카드
  scheduleCard: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
    padding: 14,
  },
  scheduleImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: BORDER },
  scheduleInfo: { flex: 1, justifyContent: "center", gap: 4 },
  scheduleTitle: { fontSize: 15, fontWeight: "700", color: BRAND },
  scheduleMeta: { fontSize: 12, color: GRAY },
});