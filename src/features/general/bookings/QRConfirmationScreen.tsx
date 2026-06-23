import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { getQrCodeByReservation } from "@/features/qr/api/qrApi";
import { ApiError } from "@/services/api";

const BRAND = "#3D1F0D";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";

export function QRConfirmationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "QRConfirmation">>();
  const { booking } = route.params;

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<'none' | 'network' | 'notPaid' | 'missing'>('none');

  useEffect(() => {
    const loadQrCode = async () => {
      if (!booking.reservationId) {
        setErrorType('missing');
        setIsLoading(false);
        return;
      }

      try {
        const token = await getQrCodeByReservation(booking.reservationId);
        setQrToken(token);
        setErrorType('none');
      } catch (error) {
        console.error("Failed to load QR code:", error);

        if (error instanceof ApiError) {
          if (error.status === 400 && error.message?.includes('Payment')) {
            setErrorType('notPaid');
          } else if (error.status >= 500) {
            setErrorType('network');
          } else {
            setErrorType('missing');
          }
        } else {
          setErrorType('network');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // PAID 상태일 때만 QR 로드
    if (booking.status === "upcoming" && !booking.paymentRequired) {
      loadQrCode();
    } else {
      setIsLoading(false);
    }
  }, [booking.reservationId]);

  const isQrAvailable = errorType === 'none' && qrToken;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR 확인서</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.loadingText}>QR 코드를 불러오는 중...</Text>
        </View>
      ) : errorType === 'network' ? (
        <View style={styles.errorContent}>
          <Ionicons name="cloud-offline-outline" size={56} color="#F57C00" />
          <Text style={styles.errorTitle}>네트워크 오류</Text>
          <Text style={styles.errorDesc}>
            QR 코드를 불러올 수 없습니다.{'\n'}잠시 후 다시 시도해주세요.
          </Text>
        </View>
      ) : errorType === 'notPaid' ? (
        <View style={styles.errorContent}>
          <Ionicons name="card-outline" size={56} color="#F57C00" />
          <Text style={styles.errorTitle}>결제를 완료해주세요</Text>
          <Text style={styles.errorDesc}>
            예약이 승인되었습니다.{'\n'}결제 완료 후 QR 입장권이 발급됩니다.
          </Text>
        </View>
      ) : errorType === 'missing' ? (
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={56} color="#C62828" />
          <Text style={styles.errorTitle}>QR 확인서를 불러올 수 없어요</Text>
          <Text style={styles.errorDesc}>
            {"예약 정보를 확인할 수 없습니다.\n고객센터에 문의해주세요. (예약 ID: " + booking.id + ")"}
          </Text>
        </View>
      ) : !isQrAvailable ? (
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={56} color="#C62828" />
          <Text style={styles.errorTitle}>QR 확인서를 불러올 수 없어요</Text>
          <Text style={styles.errorDesc}>
            {"예약 상태를 다시 확인해주세요."}
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.qrCard}>
            <QRCode value={qrToken} size={200} color={BRAND} backgroundColor="#FFFFFF" />
            <Text style={styles.orderNo}>예약번호 {booking.id}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.expTitle} numberOfLines={1}>{booking.title}</Text>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={GRAY} />
              <Text style={styles.infoText}>{booking.date} · {booking.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={GRAY} />
              <Text style={styles.infoText}>{booking.guests}명</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={GRAY} />
              <Text style={styles.infoText} numberOfLines={2}>{booking.location}</Text>
            </View>
          </View>

          <Text style={styles.guideText}>체험 현장에서 이 QR을 장인에게 보여주세요.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 16, fontSize: 14, color: GRAY },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: "center" },
  qrCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
  },
  orderNo: { marginTop: 16, fontSize: 13, color: GRAY, fontWeight: "600" },

  infoCard: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  expTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 12 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoText: { fontSize: 13, color: "#1C1107", flex: 1 },

  guideText: { fontSize: 13, color: GRAY, textAlign: "center" },

  errorContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  errorTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107", marginTop: 16, marginBottom: 8 },
  errorDesc: { fontSize: 13, color: GRAY, textAlign: "center", lineHeight: 20 },
});
