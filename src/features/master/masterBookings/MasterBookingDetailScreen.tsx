import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useMasterBookingDetail } from "./useMasterBookingDetail";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

export function MasterBookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "MasterBookingDetail">>();
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
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약 상세 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={BRAND} />
        </View>
      ) : booking ? (
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── 상세 정보 카드 ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.statusLabel}>
              {booking.status === "pending" ? "승인 대기" : booking.status === "confirmed" ? "예약 확정" : booking.status === "completed" ? "완료됨" : "취소됨"}
            </Text>
          </View>
          <Text style={styles.title}>{booking.title}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>예약자</Text>
            <Text style={styles.value}>{booking.bookerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>연락처</Text>
            <Text style={styles.value}>{booking.bookerPhone ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>예약 인원</Text>
            <Text style={styles.value}>{booking.guests}명</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>예약 일시</Text>
            <Text style={styles.value}>{booking.date} {booking.time}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>결제 금액</Text>
            <Text style={styles.value}>{booking.price.toLocaleString()}원</Text>
          </View>
          {booking.requestMessage ? (
            <View style={styles.row}>
              <Text style={styles.label}>요청 사항</Text>
              <Text style={styles.value}>{booking.requestMessage}</Text>
            </View>
          ) : null}
          {booking.rejectionReason || booking.cancellationReason ? (
            <View style={styles.row}>
              <Text style={styles.label}>처리 사유</Text>
              <Text style={styles.value}>
                {booking.rejectionReason ?? booking.cancellationReason}
              </Text>
            </View>
          ) : null}
          
          {/* ── 연락처 버튼 영역 ── */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.smsBtn]} activeOpacity={0.8} onPress={handleSms}>
              <Ionicons name="chatbubble-ellipses" size={16} color={BRAND} />
              <Text style={styles.smsBtnText}>문자 보내기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} activeOpacity={0.8} onPress={handleCall}>
              <Ionicons name="call" size={16} color="#FFF" />
              <Text style={styles.callBtnText}>전화 연결</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.label}>예약 정보를 불러오지 못했습니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 17, fontWeight: "700", color: BRAND },
  
  content: { padding: 20 },
  card: { backgroundColor: CARD, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statusLabel: { fontSize: 13, fontWeight: "700", color: "#D97706" },
  title: { fontSize: 18, fontWeight: "700", color: BRAND, marginBottom: 16 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { fontSize: 14, color: GRAY },
  value: { fontSize: 14, fontWeight: "600", color: BRAND },

  actionBtnRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 6 },
  smsBtn: { backgroundColor: "#FAF9F6", borderWidth: 1, borderColor: BORDER },
  smsBtnText: { fontSize: 14, fontWeight: "700", color: BRAND },
  callBtn: { backgroundColor: BRAND },
  callBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});
