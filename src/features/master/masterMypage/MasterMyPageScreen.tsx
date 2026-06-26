import React from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { logout } from "@/features/auth/api/authApi";
import { useMasterAccount } from "@/features/master/hooks/useMasterAccount";
import { useTheme } from "@/theme/ThemeContext";
import { useUnreadNotificationCount } from "@/features/notifications/useUnreadNotificationCount";

// ─── 통계 아이템 ──────────────────────────────────────────────────────────────
function StatItem({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={ss.item} activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
        <Text style={[ss.label, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
        <Text style={[ss.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
}
const ss = StyleSheet.create({
  item: { alignItems: "center", paddingVertical: 4, width: "100%" },
  label: { fontSize: 12, marginBottom: 5, fontWeight: "400" },
  value: { fontSize: 20, fontWeight: "800" },
});

// ─── 장인(Master) 메인 스크린 ──────────────────────────────────────────────────
export function MasterMyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { data, error, reload } = useMasterAccount();
  const unreadCount = useUnreadNotificationCount();

  useFocusEffect(
    React.useCallback(() => {
      void reload();
    }, [reload])
  );

  React.useEffect(() => {
    if (error) Alert.alert("오류", error.message);
  }, [error]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch {
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  const handleSwitchToUserMode = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  return (
    <SafeAreaView style={[ms.safeArea, { backgroundColor: colors.bg }]} edges={["top"]}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader
        activeItem="프로필"
        rightComponent={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              hitSlop={10}
              style={{ marginRight: 16 }}
              onPress={() => navigation.navigate("Notifications")}
            >
              <View>
                <Ionicons name="notifications-outline" size={23} color={colors.text} />
                {unreadCount > 0 && <View style={[ms.notiBadge, { borderColor: colors.bg }]} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={23} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ms.scroll}
      >

        {/* ── 프로필 카드 (공방 정보) ── */}
        <View style={[ms.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={ms.profileRow}>
            <Image
              source={{ uri: data?.profile.imageUrl }}
              style={[ms.avatar, { backgroundColor: colors.border }]}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={[ms.profileName, { color: colors.text }]}>{data?.profile.name ?? "-"}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  style={{ marginLeft: 6 }}
                  onPress={() => navigation.navigate("MasterProfile")}
                >
                  <Feather name="edit-2" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[ms.profileBio, { color: colors.textSecondary }]}>
                {data
                  ? `${data.profile.heritageCategory} · 마스터 ${data.profile.masterName} 님`
                  : "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 요약 통계 ── */}
        <View style={ms.statsRow}>
          <StatItem
            label="신규 예약"
            value={`${data?.stats.pendingReservationCount ?? 0}건`}
          />
          <View style={[ms.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            label="운영 클래스"
            value={`${data?.stats.activeExperienceCount ?? 0}개`}
          />
          <View style={[ms.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            label="이달의 수익"
            value={
              data?.stats.monthlyRevenue
                ? `${(data.stats.monthlyRevenue / 10000).toFixed(0)}만원`
                : "0원"
            }
          />
        </View>

        {/* ── 공방 관리 메뉴 (버튼형) ── */}
        <Text style={[ms.sectionTitle, { color: colors.text }]}>공방 관리</Text>
        <View style={ms.actionContainer}>
          <TouchableOpacity
            style={[ms.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MasterBookings")}
          >
            <Ionicons name="calendar-outline" size={28} color={colors.accent} />
            <Text style={[ms.actionLabel, { color: colors.text }]}>예약 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ms.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MasterExperience")}
          >
            <Ionicons name="hammer-outline" size={28} color={colors.accent} />
            <Text style={[ms.actionLabel, { color: colors.text }]}>클래스 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ms.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => Alert.alert("알림", "정산 API 구현이 필요합니다.")}
          >
            <Ionicons name="wallet-outline" size={28} color={colors.accent} />
            <Text style={[ms.actionLabel, { color: colors.text }]}>정산 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ms.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MasterReviews")}
          >
            <Ionicons name="chatbubbles-outline" size={28} color={colors.accent} />
            <Text style={[ms.actionLabel, { color: colors.text }]}>후기 관리</Text>
          </TouchableOpacity>
        </View>

        {/* ── 기타 설정 메뉴 ── */}
        <View style={ms.menuSection}>
          {["프로필 수정", "일반 유저 모드로 전환", "로그아웃"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[ms.menuItem, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {
                if (item === "프로필 수정") {
                  navigation.navigate("MasterProfile");
                } else if (item === "일반 유저 모드로 전환") {
                  handleSwitchToUserMode();
                } else if (item === "로그아웃") {
                  handleLogout();
                }
              }}
            >
              <Text style={[
                ms.menuItemText,
                { color: colors.text },
                item === "로그아웃" && { color: "#EF4444" },
                item === "일반 유저 모드로 전환" && { color: "#3B82F6", fontWeight: "600" }
              ]}>
                {item}
              </Text>
              {item !== "로그아웃" && <Ionicons name="chevron-forward" size={18} color={colors.border} />}
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
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 48 },
  notiBadge: { position: "absolute", top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E04848", borderWidth: 1 },

  profileCard: { marginHorizontal: 16, borderRadius: 18, padding: 18, borderWidth: 1, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 62, height: 62, borderRadius: 31 },
  profileName: { fontSize: 18, fontWeight: "800" },
  profileBio: { fontSize: 13, lineHeight: 18 },

  statsRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 26, paddingVertical: 6 },
  statDivider: { width: 1, height: 28 },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginHorizontal: 20, marginBottom: 14 },

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
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionLabel: { fontSize: 14, fontWeight: "600", marginTop: 10 },

  menuSection: { marginHorizontal: 20, marginTop: 8 },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1 },
  menuItemText: { fontSize: 15, fontWeight: "500" },
});
