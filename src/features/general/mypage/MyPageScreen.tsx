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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

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
          <ActivityIndicator color={BRAND} />
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
        <View style={ms.profileCard}>
          <View style={ms.profileRow}>
            {/* 아바타 */}
            {profile?.profileImageUrl ? (
              <Image
                source={{ uri: profile.profileImageUrl }}
                style={ms.avatar}
              />
            ) : (
              <View style={[ms.avatar, { backgroundColor: ICON_BG, alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person" size={32} color={TEXT_S} />
              </View>
            )}
            {/* 이름 + 소개 */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={ms.profileName}>{profile?.name || profile?.nickname || "사용자"} 님</Text>
                <TouchableOpacity hitSlop={8} style={{ marginLeft: 6 }} onPress={() => navigation.navigate("ProfileEdit")}>
                  <Feather name="edit-2" size={14} color={TEXT_S} />
                </TouchableOpacity>
              </View>
              <Text style={ms.profileBio}>{profile?.email || ""}</Text>
              {profile?.phone && (
                <Text style={ms.profileBio}>{profile.phone}</Text>
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
          <View style={ms.statDivider} />
          <StatItem
            label="작성한 후기"
            value={stats?.reviewCount?.toString() || "0"}
            onPress={() => navigation.navigate("MyReviews")}
            isLast
          />
        </View>

        {/* ── 섹션 타이틀 ── */}
        <Text style={ms.sectionTitle}>나의 활동</Text>

        {/* ── 활동 카드 ── */}
        <View style={ms.grid}>
          <ActivityCard icon="notifications-outline" label="알림" onPress={() => navigation.navigate("Notifications")} />
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
              style={ms.menuItem}
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
                (item === "로그아웃" || item === "회원탈퇴") && { color: "#EF4444" }
              ]}>
                {item}
              </Text>
              {item !== "로그아웃" && item !== "회원탈퇴" && (
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