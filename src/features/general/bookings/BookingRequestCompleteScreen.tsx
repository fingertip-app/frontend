import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#3D1F0D";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";

export function BookingRequestCompleteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookingRequestComplete">>();
  const { reservationId, exp, dateLabel, time, headcount, totalPrice, requestMessage } = route.params;

  const goToBookings = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Bookings" } }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={BRAND} />
        </View>
        <Text style={styles.title}>예약 신청이 완료됐어요</Text>
        <Text style={styles.desc}>
          {"장인의 승인을 기다리고 있어요.\n승인되면 알려드리고, 결제는 승인 후에 진행돼요."}
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>예약 번호</Text>
            <Text style={styles.infoValue}>#{reservationId}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.expTitle} numberOfLines={1}>
            {exp?.title ?? "체험"}
          </Text>
          {!!dateLabel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>날짜</Text>
              <Text style={styles.infoValue}>{dateLabel}</Text>
            </View>
          )}
          {!!time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>시간</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </View>
          )}
          {headcount !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>인원</Text>
              <Text style={styles.infoValue}>{headcount}명</Text>
            </View>
          )}
          {!!requestMessage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>요청 메시지</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: "right" }]} numberOfLines={3}>
                {requestMessage}
              </Text>
            </View>
          )}
          {totalPrice !== undefined && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { fontWeight: "600", color: "#1C1107" }]}>예상 결제 금액</Text>
                <Text style={styles.totalText}>{totalPrice.toLocaleString()}원</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={goToBookings}>
          <Text style={styles.primaryBtnText}>예약 내역 보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: "center" },
  iconWrap: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#1C1107", marginBottom: 10 },
  desc: { fontSize: 14, color: GRAY, textAlign: "center", lineHeight: 21, marginBottom: 32 },

  card: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  expTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 12 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: GRAY },
  infoValue: { fontSize: 13, color: "#1C1107", fontWeight: "600" },
  totalText: { fontSize: 18, fontWeight: "800", color: "#1C1107", letterSpacing: -0.3 },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
