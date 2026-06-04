import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";

const BRAND = "#3D1F0D";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";

export function BookingDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookingDetail">>();
  const { booking } = route.params;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return "승인완료";
      case "pending":  return "승인 대기";
      case "past":     return "지난 체험";
      case "cancelled":return "취소 내역";
      default:         return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "upcoming": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "pending":  return { bg: "#FFF3E0", text: "#E65100" };
      case "cancelled":return { bg: "#FFEBEE", text: "#C62828" };
      default:         return { bg: "#EAE6E1", text: BRAND };
    }
  };

  const sc = statusColor(booking.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── 체험 정보 카드 ── */}
        <View style={styles.card}>
          {/* 상태 뱃지 */}
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>

          {/* 제목 */}
          <Text style={styles.expTitle}>{booking.title}</Text>

          {/* 썸네일 이미지 */}
          <Image
            source={{ uri: booking.imageUri }}
            style={styles.expImage}
            resizeMode="cover"
          />

          <View style={styles.divider} />

          {/* 일시 */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={18} color={GRAY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>일시</Text>
              <Text style={styles.infoValue}>{booking.date}</Text>
              <Text style={styles.infoSub}>{booking.time}</Text>
            </View>
          </View>

          {/* 인원 */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="people-outline" size={18} color={GRAY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>인원</Text>
              <Text style={styles.infoValue}>{booking.guests}명</Text>
            </View>
          </View>

          {/* 장소 */}
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <View style={styles.iconBox}>
              <Ionicons name="location-outline" size={18} color={GRAY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>장소</Text>
              <Text style={styles.infoValue}>{booking.location}</Text>
              <TouchableOpacity style={styles.mapBtn} activeOpacity={0.75}>
                <Text style={styles.mapBtnText}>지도보기</Text>
                <Ionicons name="chevron-forward" size={12} color={BRAND} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 결제 정보 카드 ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>결제 정보</Text>

          <View style={styles.payRow}>
            <Text style={styles.payLabel}>주문 번호</Text>
            <Text style={styles.payValue}>{booking.orderNo ?? "R20240615-9921"}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>결제 일시</Text>
            <Text style={styles.payValue}>{booking.paidAt ?? "2024년 5월 20일 오후 3:45"}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>결제 수단</Text>
            <Text style={styles.payValue}>{booking.payMethod ?? "신용카드 (현대 4402)"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { fontSize: 15, fontWeight: "600", color: "#1C1107" }]}>
              총 결제 금액
            </Text>
            <Text style={styles.totalAmount}>
              {booking.totalPrice
                ? `${Number(booking.totalPrice).toLocaleString()}원`
                : "70,000원"}
            </Text>
          </View>
        </View>

        {/* ── 준비물 및 유의사항 카드 ── */}
        <View style={styles.card}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle-outline" size={18} color={BRAND} />
            <Text style={styles.sectionTitle}>준비물 및 유의사항</Text>
          </View>
          <Text style={styles.noticeText}>
            {`앞치마는 공방에 구비되어 있습니다.\n손톱이 길다면 짧게 잘라오시길 권장합니다.\n완성품은 가마 소성 후 약 4주 뒤 배송됩니다.`}
          </Text>
        </View>

        {/* ── 취소 및 환불 규정 카드 ── */}
        <View style={[styles.card, { borderColor: "#FFDAD6", backgroundColor: "#FFFAFA" }]}>
          <View style={styles.noticeHeader}>
            <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
            <Text style={[styles.sectionTitle, { color: "#C62828" }]}>취소 및 환불 규정</Text>
          </View>
          <Text style={[styles.noticeText, { color: "#B71C1C" }]}>
            {`체험 2일 전까지 100% 환불 가능합니다.\n이후 취소 시 위약금이 발생할 수 있습니다.`}
          </Text>
        </View>
      </ScrollView>

      {/* ── 하단 버튼 영역 ── */}
      <View style={styles.footer}>
        {(booking.status === "upcoming" || booking.status === "pending") ? (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>예약 취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.chatBtnText}>장인에게 메시지 보내기</Text>
            </TouchableOpacity>
          </View>
        ) : booking.status === "past" ? (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>문의하기</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.chatBtn} 
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Review", { booking })}
            >
              <Ionicons name="pencil-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.chatBtnText}>리뷰 쓰기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.chatBtnFull} activeOpacity={0.85}>
            <Ionicons name="chatbubble-ellipses-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.chatBtnText}>장인에게 메시지 보내기</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  expTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1107",
    marginBottom: 14,
    lineHeight: 25,
  },
  expImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#E8E2D9",
    marginBottom: 20,
  },

  divider: { height: 1, backgroundColor: BG, marginBottom: 16 },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },
  infoLabel: { fontSize: 12, color: GRAY, marginBottom: 3 },
  infoValue: { fontSize: 15, color: "#1C1107", fontWeight: "600" },
  infoSub: { fontSize: 13, color: GRAY, marginTop: 2 },

  mapBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F5F0EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  mapBtnText: { fontSize: 13, color: BRAND, fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1C1107", marginBottom: 14 },

  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  payLabel: { fontSize: 13, color: GRAY },
  payValue: { fontSize: 13, color: "#1C1107", fontWeight: "500", flex: 1, textAlign: "right", marginLeft: 16 },
  totalAmount: { fontSize: 18, fontWeight: "800", color: "#1C1107", letterSpacing: -0.3 },

  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  noticeText: { fontSize: 13, color: "#4B3D33", lineHeight: 21 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerRow: { flexDirection: "row", gap: 10 },

  cancelBtn: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "700", color: "#1C1107" },

  chatBtn: {
    flex: 2,
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtnFull: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});