import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { verifyQrCode, QrVerifyResponse } from "@/features/qr/api/qrApi";
import { useTheme } from "@/theme/ThemeContext";

export function QrScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const resetScanner = () => setIsProcessing(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const response: QrVerifyResponse = await verifyQrCode(data);

      // response 받은 것 자체가 성공 (valid 필드 체크 불필요)
      Alert.alert(
        "입장 확인 완료",
        `예약자: ${response.userName}\n체험: ${response.experienceTitle}\n인원: ${response.participants}명`,
        [{ text: "확인", onPress: resetScanner }]
      );
    } catch (error: any) {
      Alert.alert(
        "QR 코드 오류",
        error?.message || "유효하지 않은 QR 코드입니다.",
        [{ text: "다시 스캔", onPress: resetScanner }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>QR 스캔</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
          <Text style={{ color: colors.textSecondary }}>카메라 권한 확인 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>QR 스캔</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
          <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>카메라 권한이 필요합니다</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>설정에서 카메라 권한을 허용해주세요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>QR 스캔</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instructionText}>
            {isProcessing ? "검증 중..." : "QR 코드를 카메라에 비춰주세요"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 카메라 화면은 다크/라이트 무관하게 항상 검정 배경 유지
  safeArea: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 17, fontWeight: "700", marginTop: 16 },
  errorDesc: { fontSize: 13, textAlign: "center", marginTop: 8 },

  scannerContainer: { flex: 1 },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  instructionText: {
    marginTop: 32,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
