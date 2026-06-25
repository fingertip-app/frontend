import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { payReservation } from "@/features/reservations/api/reservationsApi";
import { ApiError } from "@/services/api";
import { useTheme } from "@/theme/ThemeContext";

type PayMethod = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap };

const PAY_METHODS: PayMethod[] = [
  { id: "card", label: "신용・체크카드", icon: "card-outline" },
  { id: "kakaopay", label: "카카오페이", icon: "chatbubble-outline" },
  { id: "naverpay", label: "네이버페이", icon: "logo-google" },
  { id: "transfer", label: "계좌이체", icon: "swap-horizontal-outline" },
];

export function PaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Payment">>();
  const { colors } = useTheme();
  const { exp, dateLabel, time, headcount, totalPrice, reservationId } = route.params;

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!agreed) {
      Alert.alert("안내", "결제 진행을 위해 약관에 동의해주세요.");
      return;
    }
    if (!reservationId) {
      Alert.alert("오류", "예약 정보를 찾을 수 없습니다.");
      return;
    }

    setProcessing(true);
    try {
      // TODO: 토스페이먼츠 SDK 연동 후 실제 paymentKey로 교체
      const paymentKey = `mock-${selectedMethod}-${Date.now()}`;
      await payReservation(reservationId, paymentKey);

      Alert.alert("결제 완료", "결제가 완료됐어요. 예약이 확정됐습니다.", [
        {
          text: "확인",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs", params: { screen: "Bookings" } }],
            }),
        },
      ]);
    } catch (error) {
      let errorMsg = "결제에 실패했습니다.";
      if (error instanceof ApiError) {
        errorMsg =
          error.status === 400
            ? "장인의 승인이 완료된 예약만 결제할 수 있습니다."
            : error.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      Alert.alert("결제 실패", errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>결제하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── 예약 정보 ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>예약 정보</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.expTitle, { color: colors.text }]} numberOfLines={1}>
              {exp?.title ?? "이천 도자기 물레 체험"}
            </Text>
            <Text style={[styles.expSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {exp?.location ?? "경기 이천시"} · {exp?.artisan ?? "김도예 장인"}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>날짜</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{dateLabel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>시간</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>인원</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{headcount}명</Text>
            </View>
          </View>
        </View>

        {/* ── 결제 수단 ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>결제 수단</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {PAY_METHODS.map((method, i) => {
              const active = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodRow,
                    i !== PAY_METHODS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedMethod(method.id)}
                  >
                  <View style={styles.methodLeft}>
                    <Ionicons name={method.icon} size={20} color={colors.accent} />
                    <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                  </View>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={active ? colors.accent : colors.border}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 결제 금액 ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>결제 금액</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>체험 금액</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{totalPrice.toLocaleString()}원</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: 15, fontWeight: "600", color: colors.text }]}>
                총 결제 금액
              </Text>
              <Text style={[styles.totalText, { color: colors.text }]}>{totalPrice.toLocaleString()}원</Text>
            </View>
          </View>
        </View>

        {/* ── 약관 동의 ── */}
        <TouchableOpacity
          style={styles.agreeRow}
          activeOpacity={0.7}
          onPress={() => setAgreed((a) => !a)}
        >
          <Ionicons
            name={agreed ? "checkbox" : "square-outline"}
            size={20}
            color={agreed ? colors.accent : colors.border}
          />
          <Text style={[styles.agreeText, { color: colors.textSecondary }]}>결제 진행 및 취소・환불 규정에 동의합니다.</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 고정 결제 버튼 */}
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: colors.accent }, processing && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handlePay}
          disabled={processing}
        >
          <Text style={[styles.payBtnText, { color: colors.bg }]}>
            {processing ? "결제 처리 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },

  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },

  expTitle: { fontSize: 15, fontWeight: "700" },
  expSub: { fontSize: 12, marginTop: 3 },

  divider: { height: 1, marginVertical: 12 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600" },

  totalText: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },

  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  methodLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  methodLabel: { fontSize: 14, fontWeight: "500" },

  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  agreeText: { fontSize: 13, flex: 1 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
  },
  payBtn: {
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  payBtnText: { fontSize: 16, fontWeight: "700" },
});
