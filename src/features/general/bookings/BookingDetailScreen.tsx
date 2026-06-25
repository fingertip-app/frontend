import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { cancelReservation } from "@/features/reservations/api/reservationsApi";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { getUserReviews } from "@/features/reviews/api/reviewsApi";
import type { Review } from "@/types/api";
import { useTheme } from "@/theme/ThemeContext";

export function BookingDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookingDetail">>();
  const { colors } = useTheme();
  const { booking } = route.params;
  const [isCancelling, setIsCancelling] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (booking.status !== "past") return;
    let isCurrent = true;
    (async () => {
      const profile = await getCurrentProfile().catch(() => null);
      if (!profile) return;
      const reviews = await getUserReviews(profile.id).catch(() => []);
      const mine = reviews.find((r) => r.reservationId === booking.reservationId) ?? null;
      if (isCurrent) setExistingReview(mine);
    })();
    return () => {
      isCurrent = false;
    };
  }, [booking.status, booking.reservationId]);

  console.log("📋 [BookingDetailScreen] 렌더링됨", {
    status: booking.status,
    paymentRequired: booking.paymentRequired,
    artisan: booking.artisan,
    reservationId: booking.reservationId,
  });

  const handleCancelReservation = async () => {
    console.log("🔴 [예약 취소] 버튼 클릭됨", { reservationId: booking.reservationId });

    if (!booking.reservationId) {
      console.log("🔴 [예약 취소] 예약 ID 없음");
      Alert.alert("오류", "예약 정보를 찾을 수 없습니다.");
      return;
    }

    Alert.alert(
      "예약 취소",
      "정말 이 예약을 취소하시겠습니까?",
      [
        { text: "아니오", style: "cancel" },
        {
          text: "예, 취소합니다",
          style: "destructive",
          onPress: async () => {
            console.log("🔴 [예약 취소] 확인 버튼 클릭 - API 호출 시작", booking.reservationId);
            setIsCancelling(true);
            try {
              const result = await cancelReservation(booking.reservationId!, "사용자 요청으로 취소");
              console.log("✅ [예약 취소] API 성공:", result);
              Alert.alert("취소 완료", "예약이 취소되었습니다.", [
                {
                  text: "확인",
                  onPress: () => navigation.navigate("MainTabs", { screen: "Bookings" }),
                },
              ]);
            } catch (error) {
              console.error("❌ [예약 취소] API 실패:", error);
              Alert.alert("취소 실패", error instanceof Error ? error.message : "예약 취소에 실패했습니다.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    if (status === "upcoming") {
      switch (booking.reservationStatus) {
        case "APPROVED":  return "승인완료 (결제 필요)";
        case "PAID":      return "결제완료";
        case "CONFIRMED": return "예약확정";
        default:          return "승인완료";
      }
    }
    switch (status) {
      case "pending":  return "승인 대기";
      case "past":     return "지난 체험";
      case "cancelled":return booking.reservationStatus === "REJECTED" ? "거절됨" : "취소 내역";
      default:         return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "upcoming": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "pending":  return { bg: "#FFF3E0", text: "#E65100" };
      case "cancelled":return { bg: "#FFEBEE", text: "#C62828" };
      default:         return { bg: colors.card, text: colors.text };
    }
  };

  const sc = statusColor(booking.status);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>예약 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── 체험 정보 카드 ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* 상태 뱃지 */}
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>

          {/* 제목 */}
          <Text style={[styles.expTitle, { color: colors.text }]}>{booking.title}</Text>

          {/* 썸네일 이미지 */}
          <Image
            source={{ uri: booking.imageUri }}
            style={styles.expImage}
            resizeMode="cover"
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 일시 */}
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>일시</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{booking.date}</Text>
              <Text style={[styles.infoSub, { color: colors.textSecondary }]}>{booking.time}</Text>
            </View>
          </View>

          {/* 인원 */}
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
              <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>인원</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{booking.guests}명</Text>
            </View>
          </View>

          {/* 장소 */}
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>장소</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{booking.location}</Text>
              <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.bg }]} activeOpacity={0.75}>
                <Text style={[styles.mapBtnText, { color: colors.accent }]}>지도보기</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* QR 확인서 (upcoming 상태이고 결제 완료 시에만) */}
          {booking.status === "upcoming" && !booking.paymentRequired && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={[styles.qrBtn, { backgroundColor: colors.bg }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("QRConfirmation", { booking })}
              >
                <Ionicons name="qr-code-outline" size={20} color={colors.accent} />
                <Text style={[styles.qrBtnText, { color: colors.accent }]}>QR 확인서 보기</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── 거절/취소 사유 카드 ── */}
        {booking.status === "cancelled" && (booking.rejectionReason || booking.cancellationReason) && (
          <View style={[styles.card, { borderColor: "#C62828", backgroundColor: colors.card }]}>
            <View style={styles.noticeHeader}>
              <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
              <Text style={[styles.sectionTitle, { color: "#C62828" }]}>
                {booking.reservationStatus === "REJECTED" ? "거절 사유" : "취소 사유"}
              </Text>
            </View>
            <Text style={[styles.noticeText, { color: "#B71C1C" }]}>
              {booking.rejectionReason || booking.cancellationReason}
            </Text>
          </View>
        )}

        {/* ── 결제 정보 카드 (실제 결제 완료된 예약만 노출) ── */}
        {!!booking.paidAt && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>결제 정보</Text>

            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { color: colors.textSecondary }]}>주문 번호</Text>
              <Text style={[styles.payValue, { color: colors.text }]}>{booking.orderNo ?? "정보 없음"}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { color: colors.textSecondary }]}>결제 일시</Text>
              <Text style={[styles.payValue, { color: colors.text }]}>{booking.paidAt}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { color: colors.textSecondary }]}>결제 수단</Text>
              <Text style={[styles.payValue, { color: colors.text }]}>{booking.payMethod ?? "정보 없음"}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.payRow}>
              <Text style={[styles.payLabel, { fontSize: 15, fontWeight: "600", color: colors.text }]}>
                총 결제 금액
              </Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>
                {booking.totalPrice ? `${Number(booking.totalPrice).toLocaleString()}원` : "-"}
              </Text>
            </View>
          </View>
        )}

        {/* ── 준비물 및 유의사항 카드 ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>준비물 및 유의사항</Text>
          </View>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {`앞치마는 공방에 구비되어 있습니다.\n손톱이 길다면 짧게 잘라오시길 권장합니다.\n완성품은 가마 소성 후 약 4주 뒤 배송됩니다.`}
          </Text>
        </View>

        {/* ── 취소 및 환불 규정 카드 ── */}
        <View style={[styles.card, { borderColor: "#C62828", backgroundColor: colors.card }]}>
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
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        {(() => {
          console.log("🎯 [Footer 렌더링] 조건 체크", {
            status: booking.status,
            paymentRequired: booking.paymentRequired,
            condition: `upcoming && paymentRequired = ${booking.status === "upcoming" && booking.paymentRequired}`,
          });
          return null;
        })()}
        {booking.status === "upcoming" && booking.paymentRequired ? (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={handleCancelReservation}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>예약 취소</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chatBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("Payment", {
                  exp: {
                    id: booking.id,
                    title: booking.title,
                    category: "",
                    location: booking.location,
                    artisan: booking.artisan,
                    rating: 0,
                    reviewCount: 0,
                    duration: "",
                    price: booking.totalPrice ?? 0,
                    tags: [],
                    imageUri: booking.imageUri ?? "",
                    difficulty: "초급",
                  },
                  dateLabel: booking.date,
                  time: booking.time,
                  headcount: booking.guests,
                  totalPrice: booking.totalPrice ?? 0,
                  reservationId: booking.reservationId,
                })
              }
            >
              <Ionicons name="card-outline" size={17} color={colors.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.chatBtnText, { color: colors.bg }]}>결제하기</Text>
            </TouchableOpacity>
          </View>
        ) : booking.status === "upcoming" && !booking.paymentRequired ? (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={handleCancelReservation}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>예약 취소</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chatBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              onPress={() => {
                console.log("💬 [장인에게 메시지] 버튼 클릭됨", { artisan: booking.artisan });
                if (!booking.artisan) {
                  console.log("💬 [장인에게 메시지] 장인 정보 없음");
                  Alert.alert("알림", "장인 정보를 찾을 수 없습니다.");
                  return;
                }
                // TODO: 채팅 화면 구현 후 연결
                console.log("💬 [장인에게 메시지] Alert 표시");
                Alert.alert(
                  "준비 중",
                  `${booking.artisan}님에게 메시지를 보낼 수 있는 기능을 준비 중입니다.`
                );
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.chatBtnText, { color: colors.bg }]}>장인에게 메시지 보내기</Text>
            </TouchableOpacity>
          </View>
        ) : booking.status === "pending" ? (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={handleCancelReservation}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>예약 취소</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chatBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              onPress={() => {
                console.log("💬 [장인에게 메시지] 버튼 클릭됨", { artisan: booking.artisan });
                if (!booking.artisan) {
                  console.log("💬 [장인에게 메시지] 장인 정보 없음");
                  Alert.alert("알림", "장인 정보를 찾을 수 없습니다.");
                  return;
                }
                // TODO: 채팅 화면 구현 후 연결
                console.log("💬 [장인에게 메시지] Alert 표시");
                Alert.alert(
                  "준비 중",
                  `${booking.artisan}님에게 메시지를 보낼 수 있는 기능을 준비 중입니다.`
                );
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.chatBtnText, { color: colors.bg }]}>장인에게 메시지 보내기</Text>
            </TouchableOpacity>
          </View>
        ) : booking.status === "past" ? (
          <View style={styles.footerRow}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>문의하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chatBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("Review", {
                  booking,
                  existingReview: existingReview ?? undefined,
                })
              }
            >
              <Ionicons name="pencil-outline" size={17} color={colors.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.chatBtnText, { color: colors.bg }]}>{existingReview ? "리뷰 수정" : "리뷰 쓰기"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.chatBtnFull, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
            onPress={() => {
              if (!booking.artisan) {
                Alert.alert("알림", "장인 정보를 찾을 수 없습니다.");
                return;
              }
              // TODO: 채팅 화면 구현 후 연결
              Alert.alert(
                "준비 중",
                `${booking.artisan}님에게 메시지를 보낼 수 있는 기능을 준비 중입니다.`
              );
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.bg} style={{ marginRight: 6 }} />
            <Text style={[styles.chatBtnText, { color: colors.bg }]}>장인에게 메시지 보내기</Text>
          </TouchableOpacity>
        )}
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

  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
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
    marginBottom: 14,
    lineHeight: 25,
  },
  expImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
  },

  divider: { height: 1, marginBottom: 16 },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },
  infoLabel: { fontSize: 12, marginBottom: 3 },
  infoValue: { fontSize: 15, fontWeight: "600" },
  infoSub: { fontSize: 13, marginTop: 2 },

  mapBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  mapBtnText: { fontSize: 13, fontWeight: "600" },

  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  qrBtnText: { fontSize: 14, fontWeight: "700" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },

  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  payLabel: { fontSize: 13 },
  payValue: { fontSize: 13, fontWeight: "500", flex: 1, textAlign: "right", marginLeft: 16 },
  totalAmount: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },

  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  noticeText: { fontSize: 13, lineHeight: 21 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
  },
  footerRow: { flexDirection: "row", gap: 10 },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "700" },

  chatBtn: {
    flex: 2,
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtnFull: {
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtnText: { fontSize: 15, fontWeight: "700" },
});
