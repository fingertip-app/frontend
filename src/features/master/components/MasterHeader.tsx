import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDrawer } from "@/features/general/home/CustomDrawer";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";

const BRAND = "#3B2B26";
const BG = "transparent"; // 부모 SafeAreaView의 배경색을 따름

interface MasterHeaderProps {
  title?: string;
  activeItem?: string;
  hasNotification?: boolean;
  rightComponent?: React.ReactNode;
}

export function MasterHeader({ title = "손끝", activeItem = "홈", hasNotification = true, rightComponent }: MasterHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} hitSlop={12}>
          <Ionicons name="menu" size={28} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{title}</Text>
        {rightComponent ? (
          rightComponent
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")} hitSlop={12}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={BRAND} />
              {hasNotification && <View style={styles.notiBadge} />}
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
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG,
    paddingTop: Platform.OS === "ios" ? 6 : 14,
  },
  navTitle: { fontSize: 17, fontWeight: "700", color: BRAND },
  notiBadge: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E04848", borderWidth: 1, borderColor: "#F5F4F0" },
});