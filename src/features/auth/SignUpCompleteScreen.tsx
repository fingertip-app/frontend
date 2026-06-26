import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

export function SignUpCompleteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const handleStart = () => {
    // 가입 완료 후, 뒤로 가기로 다시 가입 화면에 가지 못하도록 내비게이션 스택을 리셋하고 메인 탭으로 이동합니다.
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: colors.card }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.accent} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>가입 및 인증 완료!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            환영합니다! 모든 절차가 완료되었습니다.{"\n"}
            손끝에서 특별한 전통 체험을 시작해보세요.
          </Text>

          {/* 안내 박스 */}
          <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              장인 파트너의 경우, 입력하신 정보를 바탕으로{"\n"}
              빠른 시일 내에 매니저가 승인 안내를 드릴 예정입니다.
            </Text>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.text }]} activeOpacity={0.8} onPress={handleStart}>
            <Text style={[styles.startButtonText, { color: colors.bg }]}>홈으로 이동</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 20 : 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  iconWrapper: { marginBottom: 32 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  infoBox: {
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 12, borderWidth: 1,
  },
  infoText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  bottomContainer: { justifyContent: "flex-end" },
  startButton: {
    borderRadius: 26, height: 54,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});