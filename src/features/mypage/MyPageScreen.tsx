import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MainLayout } from "@/features/home/MainLayout";
import { logout } from "@/features/auth/api/authApi";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BG       = "#F7F4EF";   // 크림 배경
const BRAND    = "#3B2314";   // 다크 브라운
const TEXT     = "#1C1410";
const TEXT_S   = "#7A6F65";
const BORDER   = "#E8E2D9";
const CARD_BG  = "#FFFFFF";
const ICON_BG  = "#F0EBE4";   // 아이콘 원형 배경

// ─── 관심 태그 pill ───────────────────────────────────────────────────────────
function InterestTag({ label }: { label: string }) {
  return (
    <View style={ts.tag}>
      <Text style={ts.tagText}>{label}</Text>
    </View>
  );
}
const ts = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BG,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 12, fontWeight: "500", color: TEXT_S },
});

// ─── 통계 아이템 ──────────────────────────────────────────────────────────────
function StatItem({
  label,
  value,
  isLast,
  onPress,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={ss.item} activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
        <Text style={ss.label} numberOfLines={1}>{label}</Text>
        <Text style={ss.value} numberOfLines={1}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
}
const ss = StyleSheet.create({
  item: {
    alignItems: "center",
    paddingVertical: 4,
    width: "100%",
  },
  label: { fontSize: 12, color: TEXT_S, marginBottom: 5, fontWeight: "400" },
  value: { fontSize: 20, fontWeight: "800", color: TEXT },
});

// ─── 활동 카드 ────────────────────────────────────────────────────────────────
function ActivityCard({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={ac.card} activeOpacity={0.8} onPress={onPress}>
      <View style={ac.iconWrap}>
        <Ionicons name={icon} size={26} color={BRAND} />
      </View>
      <Text style={ac.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const ac = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: "600", color: TEXT },
});

// ─── 메인 스크린 ──────────────────────────────────────────────────────────────
export function MyPageScreen() {
  const interests = ["도예", "한지", "힐링체험", "전통음식"];
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  return (
    <MainLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ms.scroll}
      >

        {/* ── 프로필 카드 ── */}
        <View style={ms.profileCard}>
          <View style={ms.profileRow}>
            {/* 아바타 */}
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=47" }}
              style={ms.avatar}
            />
            {/* 이름 + 소개 */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={ms.profileName}>김하루 님</Text>
                <TouchableOpacity hitSlop={8} style={{ marginLeft: 6 }}>
                  <Feather name="edit-2" size={14} color={TEXT_S} />
                </TouchableOpacity>
              </View>
              <Text style={ms.profileBio}>전통문화를 사랑하는 여행자</Text>
            </View>
          </View>

          {/* 관심 태그 */}
          <View style={ms.tagRow}>
            {interests.map((t) => (
              <InterestTag key={t} label={t} />
            ))}
          </View>
        </View>

        {/* ── 통계 4개 ── */}
        <View style={ms.statsRow}>
          <StatItem label="찜한 체험"   value="12" onPress={() => navigation.navigate("Wishlist")} />
          <View style={ms.statDivider} />
          <StatItem label="작성한 후기" value="8" onPress={() => navigation.navigate("MyReviews")} />
          <View style={ms.statDivider} />
          <StatItem label="쿠폰함"      value="3" />
          <View style={ms.statDivider} />
          <StatItem label="포인트"      value="1,250P" isLast />
        </View>

        {/* ── 섹션 타이틀 ── */}
        <Text style={ms.sectionTitle}>나의 활동</Text>

        {/* ── 활동 카드 ── */}
        <View style={ms.grid}>
          <ActivityCard icon="heart-outline" label="찜한 체험" onPress={() => navigation.navigate("Wishlist")} />
          <ActivityCard icon="create-outline"        label="후기 작성" onPress={() => navigation.navigate("MyReviews")} />
        </View>

        {/* ── 기타 메뉴 리스트 ── */}
        <View style={ms.menuSection}>
          {["공지사항", "자주 묻는 질문", "이용약관", "로그아웃"].map((item) => (
            <TouchableOpacity
              key={item}
              style={ms.menuItem}
              activeOpacity={0.7}
              onPress={item === "로그아웃" ? handleLogout : undefined}
            >
              <Text style={[ms.menuItemText, item === "로그아웃" && { color: "#EF4444" }]}>
                {item}
              </Text>
              {item !== "로그아웃" && (
                <Ionicons name="chevron-forward" size={18} color="#D4CDC4" />
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </MainLayout>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  scroll: {
    paddingTop: 16,
    paddingBottom: 48,
  },

  // 프로필 카드
  profileCard: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: ICON_BG,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },
  profileBio: {
    fontSize: 13,
    color: TEXT_S,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // 통계 행
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 26,
    paddingVertical: 6,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: BORDER,
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginHorizontal: 20,
    marginBottom: 14,
  },

  // 2×2 그리드
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 16,
    justifyContent: "space-between",
  },

  // 메뉴 리스트
  menuSection: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT,
  },
});