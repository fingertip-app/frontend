import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDrawer } from "@/features/general/home/CustomDrawer";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme/ThemeContext";
import { LogoMark } from "@/components/Logo";
import { useUnreadNotificationCount } from "@/features/notifications/useUnreadNotificationCount";

interface MasterHeaderProps {
  title?: string;
  activeItem?: string;
  rightComponent?: React.ReactNode;
}

export function MasterHeader({ title = "손끝", activeItem = "홈", rightComponent }: MasterHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const unreadCount = useUnreadNotificationCount();

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} hitSlop={12}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <LogoMark size={26} />
          <Text style={[styles.navTitle, { color: colors.text }]}>{title}</Text>
        </View>
        {rightComponent ? (
          rightComponent
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")} hitSlop={12}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadCount > 0 && <View style={[styles.notiBadge, { borderColor: colors.bg }]} />}
            </View>
          </TouchableOpacity>
        )}
      </View>

      <CustomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} isMaster activeItem={activeItem} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "transparent",
    paddingTop: Platform.OS === "ios" ? 6 : 14,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  navTitle: { fontSize: 17, fontWeight: "700" },
  notiBadge: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E04848", borderWidth: 1 },
});
