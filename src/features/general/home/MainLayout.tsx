import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CustomDrawer } from "@/features/general/home/CustomDrawer";
import { LogoMark } from "@/components/Logo";
import { useTheme } from "@/theme/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
}

export function MainLayout({ children, activeItem }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* 공통 상단바 (Top Bar) */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <LogoMark size={26} />
          <Text style={[styles.logoText, { color: colors.text }]}>손끝</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* 메인 콘텐츠 영역 (각 화면의 알맹이) */}
      <View style={styles.content}>
        {children}
      </View>

      {/* 공통 드로어 메뉴 */}
      <CustomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} activeItem={activeItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  content: { flex: 1 },
});