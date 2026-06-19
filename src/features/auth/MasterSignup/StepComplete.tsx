import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";

export function StepCompleteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleStart = () => {
    // 가입 완료 후, 뒤로 가기로 다시 가입 화면에 가지 못하도록 내비게이션 스택을 리셋하고 메인 탭으로 이동합니다.
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>✨</Text>
            </View>
          </View>
          
          <Text style={styles.title}>가입 및 인증 완료!</Text>
          <Text style={styles.subtitle}>
            환영합니다! 모든 절차가 완료되었습니다.{"\n"}
            장인과 하루에서 특별한 전통 체험을 시작해보세요.
          </Text>

          {/* 안내 박스 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              장인 파트너의 경우, 입력하신 정보를 바탕으로{"\n"}
              빠른 시일 내에 매니저가 승인 안내를 드릴 예정입니다.
            </Text>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStart}>
            <Text style={styles.startButtonText}>홈으로 이동</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F4F0" },
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
    width: 100, height: 100, borderRadius: 50, backgroundColor: "#EACCA5",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5,
  },
  icon: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: "bold", color: "#3B2B26", marginBottom: 16 },
  subtitle: { fontSize: 15, color: "#6E665F", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  infoBox: {
    backgroundColor: "#FAF9F6",
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 12, borderWidth: 1, borderColor: "#D4CDC4",
  },
  infoText: { fontSize: 13, color: "#8A8077", textAlign: "center", lineHeight: 20 },
  bottomContainer: { justifyContent: "flex-end" },
  startButton: {
    backgroundColor: "#3B2B26",
    borderRadius: 26, height: 54,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});