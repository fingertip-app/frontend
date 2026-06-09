import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList, MainTabParamList } from "@/navigation/RootNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemPress?: (item: string) => void;
}

type DrawerNavigationProp = NavigationProp<RootStackParamList & MainTabParamList>;

const MAIN_MENU = [
  { key: "홈",       label: "홈",       icon: "home",            lib: "Ionicons", route: "Home" },
  { key: "탐색",     label: "탐색",     icon: "search",          lib: "Ionicons", route: "Explore" },
  { key: "예약내역", label: "예약 내역", icon: "calendar-outline", lib: "Ionicons", route: "Bookings" },
  { key: "찜한체험", label: "찜한 체험", icon: "bookmark-outline", lib: "Ionicons", route: "Wishlist" },
  { key: "AI추천",   label: "AI 추천",  icon: "sparkles",        lib: "Ionicons", route: "AIRecommend" },
];

const CATEGORY_MENU = ["도예", "목공", "염색", "전통음식"];

const BOTTOM_MENU = [
  { key: "설정",   label: "설정",   icon: "settings-outline",     lib: "Ionicons", route: "Settings" },
  { key: "고객센터", label: "고객센터", icon: "headset-outline", lib: "Ionicons" },
];

function MenuIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return <Ionicons name={name as any} size={size} color={color} />;
}

export function CustomDrawer({
  isOpen,
  onClose,
  activeItem = "홈",
  onItemPress,
}: CustomDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp>();

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, isModalVisible]);

  const handlePress = (key: string, route?: string) => {
    onItemPress?.(key);
    onClose();
    if (route) {
      navigation.navigate(route as any);
    }
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
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* ── 헤더 ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.appTitle}>장인과 하루</Text>
                <Text style={styles.appSubtitle}>Heritage Experience</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ── 메인 메뉴 ── */}
              {MAIN_MENU.map((item) => {
                const isActive = activeItem === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handlePress(item.key, item.route)}
                    activeOpacity={0.7}
                  >
                    <MenuIcon
                      name={item.icon}
                      size={18}
                      color={isActive ? "#FAF9F6" : "#5C4033"}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* ── 체험 분야 섹션 ── */}
              <Text style={styles.sectionTitle}>체험 분야</Text>
              {CATEGORY_MENU.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryItem}
                  onPress={() => handlePress(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryLabel}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── 하단 고정 영역 ── */}
            <View style={styles.bottomSection}>
              <View style={styles.divider} />
              {BOTTOM_MENU.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.bottomItem}
                  onPress={() => handlePress(item.key, item.route)}
                  activeOpacity={0.7}
                >
                  <MenuIcon name={item.icon} size={18} color="#5C4033" />
                  <Text style={styles.bottomLabel}>{item.label}</Text>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#F5F3EF",
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
    color: "#2C1A14",
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 11,
    color: "#9C7E6A",
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
  menuItemActive: {
    backgroundColor: "#2C1A14",
  },
  menuLabel: {
    fontSize: 14,
    color: "#3B2B26",
    fontWeight: "500",
  },
  menuLabelActive: {
    color: "#FAF9F6",
    fontWeight: "600",
  },

  /* 체험 분야 섹션 */
  sectionTitle: {
    fontSize: 11,
    color: "#9C7E6A",
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
    color: "#3B2B26",
    fontWeight: "400",
  },

  /* 하단 고정 */
  bottomSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#DDD7CE",
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
    color: "#3B2B26",
    fontWeight: "400",
  },
});