import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { LogoMark } from "@/components/Logo";
import { useTheme } from "@/theme/ThemeContext";

export const ONBOARDING_SEEN_KEY = "onboardingSeen";

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <LogoMark size={72} radius={36} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>손끝</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>TRADITION EXPERIENCED DAILY</Text>

        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {`K-콘텐츠 속 전통문화를 AI가 해설해주고,\n국가 인증 장인의 체험 예약까지\n한 번에 이어드려요.`}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.text }]}
          activeOpacity={0.85}
          onPress={handleStart}
        >
          <Text style={[styles.startBtnText, { color: colors.bg }]}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 11, letterSpacing: 1, fontWeight: "600", marginBottom: 28 },
  desc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  startBtn: {
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  startBtnText: { fontSize: 16, fontWeight: "bold" },
});
