import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";

export const ONBOARDING_SEEN_KEY = "onboardingSeen";

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner} />
          <View style={styles.logoCore} />
        </View>

        <Text style={styles.title}>장인과 하루</Text>
        <Text style={styles.subtitle}>TRADITION EXPERIENCED DAILY</Text>

        <Text style={styles.desc}>
          {`K-콘텐츠 속 전통문화를 AI가 해설해주고,\n국가 인증 장인의 체험 예약까지\n한 번에 이어드려요.`}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85} onPress={handleStart}>
          <Text style={styles.startBtnText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F4F0" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EACCA5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#3B2B26",
    justifyContent: "center",
    alignItems: "center",
  },
  logoCore: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#3B2B26",
    position: "absolute",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#3B2B26", marginBottom: 8 },
  subtitle: { fontSize: 11, color: "#8A8077", letterSpacing: 1, fontWeight: "600", marginBottom: 28 },
  desc: { fontSize: 14, color: "#6E665F", textAlign: "center", lineHeight: 22 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  startBtn: {
    backgroundColor: "#3B2B26",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
