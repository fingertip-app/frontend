import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "@/theme/ThemeContext";

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
  const { colors } = useTheme();
  const { booking } = route.params;

  // 데모/시연용: 실제 발급 API 대신 예약 정보로 QR을 즉시 생성해 항상 보여준다.
  const qrValue = `FINGERTIP-RESERVATION-${booking.reservationId ?? booking.id}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>QR 확인서</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <QRCode
              value={qrValue}
              size={200}
              color={colors.text}
              backgroundColor="#FFFFFF"
            />
            <Text style={[styles.orderNo, { color: colors.textSecondary }]}>예약번호 {booking.id}</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.expTitle, { color: colors.text }]} numberOfLines={1}>
              {booking.title}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatDateTime(booking.date, booking.time)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{booking.guests}명</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={2}>
                {booking.location}
              </Text>
            </View>
          </View>

          <View style={[styles.guidanceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={[styles.guidanceText, { color: colors.text }]}>
              체험 현장에서 이 QR을 장인에게 보여주세요.{'\n'}
              체험 시작 10분 전부터 스캔 가능합니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center"
  },
  qrCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
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
    fontWeight: "600"
  },

  infoCard: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  expTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12
  },
  divider: {
    height: 1,
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
    flex: 1
  },

  guidanceBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  guidanceText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
