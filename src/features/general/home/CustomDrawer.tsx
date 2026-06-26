import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList, MainTabParamList } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme/ThemeContext";
import { useUnreadNotificationCount } from "@/features/notifications/useUnreadNotificationCount";

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemPress?: (item: string) => void;
  isMaster?: boolean;
}

type DrawerNavigationProp = NavigationProp<RootStackParamList & MainTabParamList>;

const MAIN_MENU = [
  { key: "홈",         label: "홈",         icon: "home",          route: "Home" },
  { key: "탐색",       label: "탐색",       icon: "compass",       route: "Explore" },
  { key: "예약내역",   label: "예약 내역",   icon: "calendar",      route: "Bookings" },
  { key: "찜한체험",   label: "찜한 체험",   icon: "bookmark",      route: "Wishlist" },
  { key: "AI추천",     label: "AI 추천",    icon: "sparkles",      route: "AIRecommend" },
  { key: "카드뉴스",   label: "한물결 카드뉴스", icon: "newspaper", route: "CardNewsList" },
  { key: "알림",       label: "알림",       icon: "notifications", route: "Notifications" },
  { key: "마이페이지", label: "마이페이지", icon: "person",        route: "MyPage" },
];

// 실제 체험 데이터에 존재하는 분야 중 자주 찾는 항목만 빠른 진입용으로 노출
const CATEGORY_MENU = ["도자기", "한지공예", "모시짜기", "전통주"];

const MASTER_MENU = [
  { key: "홈",       label: "장인 홈",   icon: "home",          route: "MasterHome" },
  { key: "체험관리", label: "클래스 관리", icon: "color-palette", route: "MasterExperience" },
  { key: "예약관리", label: "예약 관리",   icon: "calendar",      route: "MasterBookings" },
  { key: "후기",     label: "후기 관리",   icon: "star",          route: "MasterReviews" },
  { key: "프로필",   label: "마이페이지",   icon: "person",        route: "MasterMyPage" },
];

const BOTTOM_MENU = [
  { key: "설정",   label: "설정",   icon: "settings", route: "Settings" },
];

function MenuIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return <Ionicons name={name as any} size={size} color={color} />;
}

export function CustomDrawer({
  isOpen,
  onClose,
  activeItem = "홈",
  onItemPress,
  isMaster = false,
}: CustomDrawerProps) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  // 피드백 반영: 화면의 80%, 최대 320px 제한
  const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);
  const { colors } = useTheme();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp>();
  const unreadCount = useUnreadNotificationCount();

  // 브라우저 리사이즈 시 닫혀있는 메뉴의 오프셋을 동적으로 보정
  useEffect(() => {
    if (!isOpen) {
      slideAnim.setValue(-DRAWER_WIDTH);
    }
  }, [DRAWER_WIDTH, isOpen, slideAnim]);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    }
  }, [isOpen, DRAWER_WIDTH, slideAnim]);

  const handlePress = (key: string, route?: string) => {
    onItemPress?.(key);
    onClose();
    if (route) {
      navigation.navigate(route as any);
    }
  };

  const handleCategoryPress = (category: string) => {
    onItemPress?.(category);
    onClose();
    navigation.navigate("Explore", { category });
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawer,
            { width: DRAWER_WIDTH, backgroundColor: colors.bg, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* ── 헤더 ── */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.appTitle, { color: colors.text }]}>손끝</Text>
                <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Heritage Experience</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ── 메인 메뉴 ── */}
              {(isMaster ? MASTER_MENU : MAIN_MENU).map((item) => {
                const isActive = activeItem === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.menuItem,
                      isActive && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => handlePress(item.key, item.route)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <MenuIcon
                        name={isActive ? (item.icon as any) : `${item.icon}-outline`}
                        size={18}
                        color={isActive ? colors.bg : colors.textSecondary}
                      />
                      {item.key === "알림" && unreadCount > 0 && (
                        <View style={[styles.menuBadge, { borderColor: colors.bg }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: isActive ? colors.bg : colors.text, fontWeight: isActive ? "600" : "500" },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* ── 체험 분야 섹션 ── */}
              {!isMaster && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>체험 분야</Text>
                  {CATEGORY_MENU.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryItem}
                      onPress={() => handleCategoryPress(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.categoryLabel, { color: colors.text }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>

            {/* ── 하단 고정 영역 ── */}
            <View style={styles.bottomSection}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {BOTTOM_MENU.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.bottomItem}
                  onPress={() => handlePress(item.key, item.route)}
                  activeOpacity={0.7}
                >
                  <MenuIcon name={item.icon as any} size={18} color={colors.textSecondary} />
                  <Text style={[styles.bottomLabel, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: "100%",
    height: "100%",
  },
  drawer: {
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },

  /* 헤더 */
  header: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },

  /* 스크롤 영역 */
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  /* 메인 메뉴 아이템 */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuLabel: {
    fontSize: 14,
  },
  menuBadge: {
    position: "absolute", top: -2, right: -2,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#E04848", borderWidth: 1,
  },

  /* 체험 분야 섹션 */
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  categoryItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "400",
  },

  /* 하단 고정 */
  bottomSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  bottomLabel: {
    fontSize: 13,
    fontWeight: "400",
  },
});