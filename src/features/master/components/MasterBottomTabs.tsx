import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";

const BOTTOM_TABS = [
  { key: "홈", icon: "home", label: "홈", route: "MasterHome" },
  { key: "체험관리", icon: "color-palette-outline", label: "체험관리", route: "MasterExperience" },
  { key: "예약관리", icon: "calendar-outline", label: "예약관리", route: "MasterBookings" },
  { key: "후기", icon: "star-outline", label: "후기", route: "MasterReviews" },
  { key: "프로필", icon: "person-outline", label: "프로필", route: "MasterMyPage" },
];

interface MasterBottomTabsProps {
  activeTab?: string;
  onTabPress?: (key: string) => void;
}

export function MasterBottomTabs({ activeTab = "홈", onTabPress }: MasterBottomTabsProps) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const handlePress = (tab: typeof BOTTOM_TABS[0]) => {
    onTabPress?.(tab.key);
    if (tab.route) {
      navigation.navigate(tab.route);
    }
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {BOTTOM_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} activeOpacity={0.7} onPress={() => handlePress(tab)}>
            <Ionicons
              name={isActive ? tab.icon.replace("-outline", "") as any : tab.icon as any}
              size={22}
              color={isActive ? colors.text : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, { color: isActive ? colors.text : colors.textSecondary, fontWeight: isActive ? "700" : "500" }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabLabel: { fontSize: 10 },
});