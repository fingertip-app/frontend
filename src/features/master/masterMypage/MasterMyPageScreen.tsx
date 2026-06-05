import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";

// ─── 기존 테마 팔레트 재사용 ──────────────────────────────────────────────────
const BG       = "#F7F4EF";
const BRAND    = "#3B2314";
const TEXT     = "#1C1410";
const TEXT_S   = "#7A6F65";
const BORDER   = "#E8E2D9";
const CARD_BG  = "#FFFFFF";
const ICON_BG  = "#F0EBE4";

// ─── 통계 아이템 ──────────────────────────────────────────────────────────────
function StatItem({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
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
  item: { alignItems: "center", paddingVertical: 4, width: "100%" },
  label: { fontSize: 12, color: TEXT_S, marginBottom: 5, fontWeight: "400" },
  value: { fontSize: 20, fontWeight: "800", color: TEXT },
});

// ─── 장인(Master) 메인 스크린 ──────────────────────────────────────────────────
export function MasterMyPageScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={ms.safeArea} edges={["top"]}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={ms.scroll}
      >

        {/* ── 헤더 ── */}
        <View style={ms.header}>
          <Text style={ms.headerTitle}>마스터 관리</Text>
          <View style={ms.headerIcons}>
            <TouchableOpacity hitSlop={10} style={{ marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={23} color={TEXT} />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={10}>
              <Ionicons name="settings-outline" size={23} color={TEXT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 프로필 카드 (공방 정보) ── */}
        <View style={ms.profileCard}>
          <View style={ms.profileRow}>
            <Image
              source={{ uri: "https://picsum.photos/seed/master/150/150" }}
              style={ms.avatar}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={ms.profileName}>이천 도예 공방</Text>
                <TouchableOpacity hitSlop={8} style={{ marginLeft: 6 }}>
                  <Feather name="edit-2" size={14} color={TEXT_S} />
                </TouchableOpacity>
              </View>
              <Text style={ms.profileBio}>마스터 김도예 님</Text>
            </View>
          </View>
        </View>

        {/* ── 요약 통계 ── */}
        <View style={ms.statsRow}>
          <StatItem label="신규 예약" value="3건" />
          <View style={ms.statDivider} />
          <StatItem label="운영 클래스" value="2개" />
          <View style={ms.statDivider} />
          <StatItem label="이달의 수익" value="1.2M" />
        </View>

        {/* ── 공방 관리 메뉴 (버튼형) ── */}
        <Text style={ms.sectionTitle}>공방 관리</Text>
        <View style={ms.actionContainer}>
          <TouchableOpacity style={ms.actionCard} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={28} color={BRAND} />
            <Text style={ms.actionLabel}>예약 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.actionCard} activeOpacity={0.8}>
            <Ionicons name="hammer-outline" size={28} color={BRAND} />
            <Text style={ms.actionLabel}>클래스 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.actionCard} activeOpacity={0.8}>
            <Ionicons name="wallet-outline" size={28} color={BRAND} />
            <Text style={ms.actionLabel}>정산 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.actionCard} activeOpacity={0.8}>
            <Ionicons name="chatbubbles-outline" size={28} color={BRAND} />
            <Text style={ms.actionLabel}>후기 관리</Text>
          </TouchableOpacity>
        </View>

        {/* ── 기타 설정 메뉴 ── */}
        <View style={ms.menuSection}>
          {["프로필 수정", "공지사항 관리", "일반 유저 모드로 전환", "로그아웃"].map((item) => (
            <TouchableOpacity key={item} style={ms.menuItem} activeOpacity={0.7}>
              <Text style={[
                ms.menuItemText,
                item === "로그아웃" && { color: "#EF4444" },
                item === "일반 유저 모드로 전환" && { color: "#3B82F6", fontWeight: "600" }
              ]}>
                {item}
              </Text>
              {item !== "로그아웃" && <Ionicons name="chevron-forward" size={18} color="#D4CDC4" />}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="프로필" />
    </SafeAreaView>
  );
}

const ms = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 48 },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: TEXT, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  profileCard: { backgroundColor: CARD_BG, marginHorizontal: 16, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: ICON_BG },
  profileName: { fontSize: 18, fontWeight: "800", color: TEXT },
  profileBio: { fontSize: 13, color: TEXT_S, lineHeight: 18 },

  statsRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 26, paddingVertical: 6 },
  statDivider: { width: 1, height: 28, backgroundColor: BORDER },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: TEXT, marginHorizontal: 20, marginBottom: 14 },

  actionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    width: "48%",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionLabel: { fontSize: 14, fontWeight: "600", color: TEXT, marginTop: 10 },

  menuSection: { marginHorizontal: 20, marginTop: 8 },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  menuItemText: { fontSize: 15, fontWeight: "500", color: TEXT },
});