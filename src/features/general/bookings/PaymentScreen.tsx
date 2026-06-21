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

const BRAND = "#3D1F0D";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";

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
  const { exp, dateLabel, time, headcount, totalPrice } = route.params;

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    if (!agreed) {
      Alert.alert("안내", "결제 진행을 위해 약관에 동의해주세요.");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
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
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── 예약 정보 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예약 정보</Text>
          <View style={styles.card}>
            <Text style={styles.expTitle} numberOfLines={1}>
              {exp?.title ?? "이천 도자기 물레 체험"}
            </Text>
            <Text style={styles.expSub} numberOfLines={1}>
              {exp?.location ?? "경기 이천시"} · {exp?.artisan ?? "김도예 장인"}
            </Text>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>날짜</Text>
              <Text style={styles.infoValue}>{dateLabel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>시간</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>인원</Text>
              <Text style={styles.infoValue}>{headcount}명</Text>
            </View>
          </View>
        </View>

        {/* ── 결제 수단 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <View style={styles.card}>
            {PAY_METHODS.map((method, i) => {
              const active = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodRow,
                    i !== PAY_METHODS.length - 1 && styles.methodRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={styles.methodLeft}>
                    <Ionicons name={method.icon} size={20} color={BRAND} />
                    <Text style={styles.methodLabel}>{method.label}</Text>
                  </View>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={active ? BRAND : "#D4CDC4"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 결제 금액 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>체험 금액</Text>
              <Text style={styles.infoValue}>{totalPrice.toLocaleString()}원</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: 15, fontWeight: "600", color: "#1C1107" }]}>
                총 결제 금액
              </Text>
              <Text style={styles.totalText}>{totalPrice.toLocaleString()}원</Text>
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
            color={agreed ? BRAND : "#D4CDC4"}
          />
          <Text style={styles.agreeText}>결제 진행 및 취소・환불 규정에 동의합니다.</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 고정 결제 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, processing && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handlePay}
          disabled={processing}
        >
          <Text style={styles.payBtnText}>
            {processing ? "결제 처리 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
          </Text>
        </TouchableOpacity>
      </View>
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

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 10 },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  expTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107" },
  expSub: { fontSize: 12, color: GRAY, marginTop: 3 },

  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: GRAY },
  infoValue: { fontSize: 13, color: "#1C1107", fontWeight: "600" },

  totalText: { fontSize: 18, fontWeight: "800", color: "#1C1107", letterSpacing: -0.3 },

  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  methodRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  methodLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  methodLabel: { fontSize: 14, fontWeight: "500", color: "#1C1107" },

  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  agreeText: { fontSize: 13, color: GRAY, flex: 1 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  payBtn: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  payBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
