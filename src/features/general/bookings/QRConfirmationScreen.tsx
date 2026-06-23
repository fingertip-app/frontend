import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
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
const ERROR = "#C62828";
const WARNING = "#F57C00";

type ErrorType = 'none' | 'network' | 'notPaid' | 'missing' | 'unknown';
type ReservationStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

interface BookingData {
  id: string;
  reservationId: number;
  status: ReservationStatus;
  title: string;
  date: string;
  time: string;
  guests: number;
  location: string;
}

const isQrEligibleStatus = (status: ReservationStatus): boolean => {
  return status === "PAID" || status === "CONFIRMED";
};

const formatDateTime = (dateStr: string, timeStr: string): string => {
  // ISO 8601이면 포맷, 아니면 그대로 반환
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const formatted = date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
      return `${formatted} · ${timeStr}`;
    }
  } catch {
    // 포맷팅 실패하면 원본 그대로
  }
  return `${dateStr} · ${timeStr}`;
};

export function QRConfirmationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "QRConfirmation">>();
  const { booking } = route.params as { booking: BookingData };

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [errorCode, setErrorCode] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const isQrEligible = isQrEligibleStatus(booking.status);
  const isQrAvailable = errorType === 'none' && qrToken;

  const mapErrorCode = (code: string): ErrorType => {
    switch (code) {
      case 'QR_NOT_PAID':
      case 'RESERVATION_PENDING':
      case 'RESERVATION_APPROVED':
        return 'notPaid';
      case 'RESERVATION_NOT_FOUND':
      case 'QR_NOT_GENERATED':
        return 'missing';
      case 'QR_EXPIRED':
      case 'QR_NOT_VALID_YET':
      case 'QR_INVALID':
        return 'unknown';
      default:
        return 'unknown';
    }
  };

  const loadQrCode = async () => {
    if (!booking.reservationId) {
      setErrorType('missing');
      setErrorCode('NO_RESERVATION_ID');
      setIsLoading(false);
      return;
    }

    if (!isQrEligible) {
      setIsLoading(false);
      return;
    }

    setIsRetrying(true);
    try {
      const token = await getQrCodeByReservation(booking.reservationId);
      setQrToken(token);
      setErrorType('none');
      setErrorCode('');
    } catch (error) {
      console.error("Failed to load QR code:", error);

      if (error instanceof ApiError) {
        const code = error.code || 'UNKNOWN_ERROR';
        setErrorCode(code);
        setErrorType(mapErrorCode(code));
      } else {
        setErrorType('network');
        setErrorCode('NETWORK_ERROR');
      }
    } finally {
      setIsRetrying(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQrCode();
  }, [booking.reservationId]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadQrCode();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR 확인서</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BRAND} />
            <Text style={styles.loadingText}>QR 코드를 불러오는 중...</Text>
          </View>
        ) : !isQrEligible ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={56} color={WARNING} />
            <Text style={styles.errorTitle}>아직 QR 확인서를 발급받을 수 없어요</Text>
            <Text style={styles.errorDesc}>
              {booking.status === 'PENDING'
                ? '장인의 승인을 기다리는 중입니다.'
                : booking.status === 'APPROVED'
                ? '결제 완료 후 QR 입장권이 발급됩니다.'
                : '예약 상태를 다시 확인해주세요.'}
            </Text>
          </View>
        ) : errorType === 'network' ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cloud-offline-outline" size={56} color={WARNING} />
            <Text style={styles.errorTitle}>네트워크 오류</Text>
            <Text style={styles.errorDesc}>
              QR 코드를 불러올 수 없습니다.{'\n'}잠시 후 다시 시도해주세요.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : errorType === 'notPaid' ? (
          <View style={styles.centerContainer}>
            <Ionicons name="card-outline" size={56} color={WARNING} />
            <Text style={styles.errorTitle}>결제를 완료해주세요</Text>
            <Text style={styles.errorDesc}>
              예약이 승인되었습니다.{'\n'}결제 완료 후 QR 입장권이 발급됩니다.
            </Text>
          </View>
        ) : errorType === 'missing' ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={56} color={ERROR} />
            <Text style={styles.errorTitle}>QR 확인서를 불러올 수 없어요</Text>
            <Text style={styles.errorDesc}>
              예약 정보를 확인할 수 없습니다.{'\n'}
              고객센터에 문의해주세요.{'\n'}
              (예약 ID: {booking.reservationId})
            </Text>
          </View>
        ) : isQrAvailable ? (
          <View style={styles.content}>
            <View style={styles.qrCard}>
              <QRCode
                value={qrToken}
                size={200}
                color={BRAND}
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.orderNo}>예약번호 {booking.id}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.expTitle} numberOfLines={1}>
                {booking.title}
              </Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={GRAY} />
                <Text style={styles.infoText}>
                  {formatDateTime(booking.date, booking.time)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={16} color={GRAY} />
                <Text style={styles.infoText}>{booking.guests}명</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={GRAY} />
                <Text style={styles.infoText} numberOfLines={2}>
                  {booking.location}
                </Text>
              </View>
            </View>

            <View style={styles.guidanceBox}>
              <Ionicons name="information-circle-outline" size={18} color={BRAND} />
              <Text style={styles.guidanceText}>
                체험 현장에서 이 QR을 장인에게 보여주세요.{'\n'}
                체험 시작 10분 전부터 스캔 가능합니다.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={56} color={ERROR} />
            <Text style={styles.errorTitle}>QR 확인서를 불러올 수 없어요</Text>
            <Text style={styles.errorDesc}>
              예약 상태를 다시 확인해주세요.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1107"
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: GRAY
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center"
  },
  qrCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNo: {
    marginTop: 16,
    fontSize: 13,
    color: GRAY,
    fontWeight: "600"
  },

  infoCard: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  expTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1107",
    marginBottom: 12
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  infoText: {
    fontSize: 13,
    color: "#1C1107",
    flex: 1
  },

  guidanceBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  guidanceText: {
    fontSize: 12,
    color: "#1C1107",
    flex: 1,
    lineHeight: 18,
  },

  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1107",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorDesc: {
    fontSize: 13,
    color: GRAY,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  retryButton: {
    flexDirection: "row",
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
