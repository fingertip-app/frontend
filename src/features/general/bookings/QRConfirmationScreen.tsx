import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const BRAND = "#3D1F0D";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";

export function QRConfirmationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "QRConfirmation">>();
  const { booking } = route.params;

  // 결제가 끝나지 않은 예약은 확인서를 발급할 수 없음 (조회 실패 상태)
  const isQrAvailable = booking.status === "upcoming" && !booking.paymentRequired;
  const qrValue = `JANGINHAROU-RESERVATION:${booking.orderNo ?? booking.id}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR 확인서</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isQrAvailable ? (
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={56} color="#C62828" />
          <Text style={styles.errorTitle}>QR 확인서를 불러올 수 없어요</Text>
          <Text style={styles.errorDesc}>
            {"결제가 완료된 예약만 QR 확인서를 발급받을 수 있어요.\n예약 상태를 다시 확인해주세요."}
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.qrCard}>
            <QRCode value={qrValue} size={200} color={BRAND} backgroundColor="#FFFFFF" />
            <Text style={styles.orderNo}>{booking.orderNo ?? `예약번호 ${booking.id}`}</Text>
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
