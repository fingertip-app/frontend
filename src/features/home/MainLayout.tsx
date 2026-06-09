import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDrawer } from "@/features/home/CustomDrawer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 공통 상단바 (Top Bar) */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name="menu" size={28} color="#3B2B26" />
        </TouchableOpacity>
      </View>

      {/* 메인 콘텐츠 영역 (각 화면의 알맹이) */}
      <View style={styles.content}>
        {children}
      </View>

      {/* 공통 드로어 메뉴 */}
      <CustomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F4F0" },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: { flex: 1 },
});