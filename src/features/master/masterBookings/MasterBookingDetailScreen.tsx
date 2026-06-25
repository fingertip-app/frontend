import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useMasterBookingDetail } from "./useMasterBookingDetail";
import type { MasterBookingStatus } from "./types";
import { useTheme } from "@/theme/ThemeContext";

const STATUS_LABELS: Record<MasterBookingStatus, string> = {
  pending: "승인 대기",
  approved: "승인 완료",
  paid: "결제 완료",
  confirmed: "예약 확정",
  completed: "완료됨",
  rejected: "예약 거절",
  cancelled: "예약 취소",
};

export function MasterBookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "MasterBookingDetail">>();
  const { colors } = useTheme();
  const { booking, isLoading, error } = useMasterBookingDetail(route.params.reservationId);

  React.useEffect(() => {
    if (error) Alert.alert("알림", error.message);
  }, [error]);

  const phoneNumber = booking?.bookerPhone;

  // 전화 걸기 핸들러
  const handleCall = () => {
    if (!phoneNumber) {
      Alert.alert("알림", "예약자의 연락처 정보가 없습니다.");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("알림", "전화 앱을 실행할 수 없는 기기입니다.");
    });
  };

  // 문자 보내기 핸들러
  const handleSms = () => {
    if (!phoneNumber) {
      Alert.alert("알림", "예약자의 연락처 정보가 없습니다.");
      return;
    }
    Linking.openURL(`sms:${phoneNumber}`).catch(() => {
      Alert.alert("알림", "메시지 앱을 실행할 수 없는 기기입니다.");
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 헤더 ── */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>예약 상세 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : booking ? (
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── 상세 정보 카드 ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.statusLabel}>
              {STATUS_LABELS[booking.status]}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{booking.title}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>예약자</Text>
            <Text style={[styles.value, { color: colors.text }]}>{booking.bookerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>연락처</Text>
            <Text style={[styles.value, { color: colors.text }]}>{booking.bookerPhone ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>예약 인원</Text>
            <Text style={[styles.value, { color: colors.text }]}>{booking.guests}명</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>예약 일시</Text>
            <Text style={[styles.value, { color: colors.text }]}>{booking.date} {booking.time}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>결제 금액</Text>
            <Text style={[styles.value, { color: colors.text }]}>{booking.price.toLocaleString()}원</Text>
          </View>
          {booking.requestMessage ? (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>요청 사항</Text>
              <Text style={[styles.value, { color: colors.text }]}>{booking.requestMessage}</Text>
            </View>
          ) : null}
          {booking.rejectionReason || booking.cancellationReason ? (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>처리 사유</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {booking.rejectionReason ?? booking.cancellationReason}
              </Text>
            </View>
          ) : null}

          {/* ── 연락처 버튼 영역 ── */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]} activeOpacity={0.8} onPress={handleSms}>
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.text} />
              <Text style={[styles.smsBtnText, { color: colors.text }]}>문자 보내기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.text }]} activeOpacity={0.8} onPress={handleCall}>
              <Ionicons name="call" size={16} color={colors.bg} />
              <Text style={[styles.callBtnText, { color: colors.bg }]}>전화 연결</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>예약 정보를 불러오지 못했습니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  content: { padding: 20 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statusLabel: { fontSize: 13, fontWeight: "700", color: "#D97706" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  divider: { height: 1, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600" },

  actionBtnRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 6 },
  smsBtnText: { fontSize: 14, fontWeight: "700" },
  callBtnText: { fontSize: 14, fontWeight: "700" },
});
