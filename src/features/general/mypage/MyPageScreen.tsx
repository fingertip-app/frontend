import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MainLayout } from "@/features/general/home/MainLayout";
import { logout, getCurrentProfile, deleteAccount } from "@/features/auth/api/authApi";
import { UserProfile } from "@/features/auth/types";
import { getUserStats, UserStats } from "@/features/general/mypage/api/mypageApi";
import { useTheme } from "@/theme/ThemeContext";
import { useUnreadNotificationCount } from "@/features/notifications/useUnreadNotificationCount";

// ─── 관심 태그 pill ───────────────────────────────────────────────────────────
function InterestTag({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[ts.tag, { borderColor: colors.border, backgroundColor: colors.bg }]}>
      <Text style={[ts.tagText, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}
const ts = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 12, fontWeight: "500" },
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
  item: {
    alignItems: "center",
    paddingVertical: 4,
    width: "100%",
  },
  label: { fontSize: 12, marginBottom: 5, fontWeight: "400" },
  value: { fontSize: 20, fontWeight: "800" },
});

// ─── 활동 카드 ────────────────────────────────────────────────────────────────
function ActivityCard({
  icon,
  label,
  onPress,
  showBadge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showBadge?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[ac.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[ac.iconWrap, { backgroundColor: colors.bg }]}>
        <Ionicons name={icon} size={26} color={colors.accent} />
        {showBadge && <View style={[ac.badge, { borderColor: colors.card }]} />}
      </View>
      <Text style={[ac.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const ac = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: "600" },
  badge: { position: "absolute", top: 0, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#E04848", borderWidth: 1.5 },
});

// ─── 메인 스크린 ──────────────────────────────────────────────────────────────
export function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const unreadCount = useUnreadNotificationCount();

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadStats();
    }, [])
  );

  const loadProfile = async () => {
    try {
      console.log("🔵 프로필 로드 시작");
      const currentProfile = await getCurrentProfile();
      console.log("🔵 프로필 데이터:", currentProfile);
      setProfile(currentProfile);
    } catch (e) {
      console.log("🔴 프로필 로드 실패:", e);
      Alert.alert("알림", "프로필 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log("🔵 통계 로드 시작");
      const userStats = await getUserStats();
      console.log("🔵 통계 데이터:", userStats);
      setStats(userStats);
    } catch (e) {
      console.log("🔴 통계 로드 실패:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch {
              Alert.alert('오류', '회원 탈퇴에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <MainLayout activeItem="마이페이지">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeItem="마이페이지">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ms.scroll}
      >

        {/* ── 프로필 카드 ── */}
        <View style={[ms.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={ms.profileRow}>
            {/* 아바타 */}
            {profile?.profileImageUrl ? (
              <Image
                source={{ uri: profile.profileImageUrl }}
                style={ms.avatar}
              />
            ) : (
              <View style={[ms.avatar, { backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person" size={32} color={colors.textSecondary} />
              </View>
            )}
            {/* 이름 + 소개 */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={[ms.profileName, { color: colors.text }]}>{profile?.name || profile?.nickname || "사용자"} 님</Text>
                <TouchableOpacity hitSlop={8} style={{ marginLeft: 6 }} onPress={() => navigation.navigate("ProfileEdit")}>
                  <Feather name="edit-2" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[ms.profileBio, { color: colors.textSecondary }]}>{profile?.email || ""}</Text>
              {profile?.phone && (
                <Text style={[ms.profileBio, { color: colors.textSecondary }]}>{profile.phone}</Text>
              )}
            </View>
          </View>

          {/* 관심 태그 */}
          {profile?.preferredCategories && profile.preferredCategories.length > 0 && (
            <View style={ms.tagRow}>
              {profile.preferredCategories.map((category: string) => (
                <InterestTag key={category} label={category} />
              ))}
            </View>
          )}
        </View>

        {/* ── 통계 4개 ── */}
        <View style={ms.statsRow}>
          <StatItem
            label="찜한 체험"
            value={stats?.wishlistCount?.toString() || "0"}
            onPress={() => navigation.navigate("Wishlist")}
          />
          <View style={[ms.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            label="작성한 후기"
            value={stats?.reviewCount?.toString() || "0"}
            onPress={() => navigation.navigate("MyReviews")}
            isLast
          />
        </View>

        {/* ── 섹션 타이틀 ── */}
        <Text style={[ms.sectionTitle, { color: colors.text }]}>나의 활동</Text>

        {/* ── 활동 카드 ── */}
        <View style={ms.grid}>
          <ActivityCard
            icon="notifications-outline"
            label="알림"
            onPress={() => navigation.navigate("Notifications")}
            showBadge={unreadCount > 0}
          />
          <ActivityCard
            icon="calendar-outline"
            label="예약 내역"
            onPress={() => navigation.navigate("MainTabs", { screen: "Bookings" })}
          />
          <ActivityCard icon="heart-outline" label="찜한 체험" onPress={() => navigation.navigate("Wishlist")} />
          <ActivityCard icon="create-outline"        label="후기 작성" onPress={() => navigation.navigate("MyReviews")} />
        </View>

        {/* ── 기타 메뉴 리스트 ── */}
        <View style={ms.menuSection}>
          {["공지사항", "자주 묻는 질문", "이용약관", "로그아웃", "회원탈퇴"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[ms.menuItem, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={
                item === "로그아웃" ? handleLogout :
                item === "회원탈퇴" ? handleDeleteAccount :
                item === "공지사항" ? () => navigation.navigate("Notice") :
                item === "자주 묻는 질문" ? () => navigation.navigate("FAQ") :
                item === "이용약관" ? () => navigation.navigate("Terms") :
                undefined
              }
            >
              <Text style={[
                ms.menuItemText,
                { color: (item === "로그아웃" || item === "회원탈퇴") ? "#EF4444" : colors.text }
              ]}>
                {item}
              </Text>
              {item !== "로그아웃" && item !== "회원탈퇴" && (
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
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
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
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
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
  },
  profileBio: {
    fontSize: 13,
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
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
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
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
});