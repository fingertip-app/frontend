import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { getMyArtisan } from "@/features/artisans/api/artisanApi";
import { getArtisanExperiences } from "@/features/experiences/api/experiencesApi";
import {
  approveReservation,
  getExperienceReservations,
  rejectReservation,
} from "@/features/reservations/api/reservationsApi";
import { getUser } from "@/features/users/api/usersApi";
import type { Reservation, ReservationStatus } from "@/types/api";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

// ─── 화면 표시용 예약 타입 ───────────────────────────────────────────────────────
type DisplayStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface DisplayBooking {
  id: number;
  status: DisplayStatus;
  title: string;
  date: string;
  time: string;
  bookerName: string;
  guests: number;
  price: number;
}

const STATUS_TABS: { id: "all" | DisplayStatus; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pending", label: "승인 대기" },
  { id: "confirmed", label: "예약 확정" },
  { id: "completed", label: "완료됨" },
];

// 백엔드 ReservationStatus → 화면 표시용 상태 매핑
function toDisplayStatus(status: ReservationStatus): DisplayStatus {
  switch (status) {
    case "PENDING":
      return "pending";
    case "APPROVED":
    case "PAID":
    case "CONFIRMED":
      return "confirmed";
    case "COMPLETED":
      return "completed";
    default:
      return "cancelled";
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${weekday})`;
}

function formatTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MasterBookingsScreen() {
  const [activeTab, setActiveTab] = useState<"all" | DisplayStatus>("all");
  const [bookings, setBookings] = useState<DisplayBooking[]>([]);
  const [reservationsById, setReservationsById] = useState<Record<number, Reservation>>({});
  const [artisanId, setArtisanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const artisan = await getMyArtisan();
      setArtisanId(artisan.id);

      const experiences = await getArtisanExperiences(artisan.id);
      const experienceById = new Map(experiences.map((exp) => [exp.id, exp]));

      const reservationLists = await Promise.all(
        experiences.map((exp) => getExperienceReservations(exp.id))
      );
      const reservations = reservationLists.flat();

      const userIds = [...new Set(reservations.map((r) => r.userId))];
      const users = await Promise.all(userIds.map((id) => getUser(id).catch(() => null)));
      const nicknameByUserId = new Map(
        users.map((user, idx) => [userIds[idx], user?.nickname ?? "알 수 없음"])
      );

      setReservationsById(
        Object.fromEntries(reservations.map((r) => [r.id, r]))
      );
      setBookings(
        reservations.map((r) => ({
          id: r.id,
          status: toDisplayStatus(r.status),
          title: experienceById.get(r.experienceId)?.title ?? "체험",
          date: formatDate(r.reservedDateTime),
          time: formatTime(r.reservedDateTime),
          bookerName: nicknameByUserId.get(r.userId) ?? "알 수 없음",
          guests: r.numberOfParticipants,
          price: r.totalPrice,
        }))
      );
    } catch {
      Alert.alert("알림", "예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter((b) =>
    activeTab === "all" ? true : b.status === activeTab
  );

  // 상태 뱃지 렌더링 헬퍼
  const renderStatusBadge = (status: DisplayStatus) => {
    let bgColor = "#F3F4F6";
    let textColor = "#4B5563";
    let label = "";

    switch (status) {
      case "pending":
        bgColor = "#FEF3C7";
        textColor = "#92400E";
        label = "승인 대기";
        break;
      case "confirmed":
        bgColor = "#E0E7FF";
        textColor = "#1D4ED8";
        label = "예약 확정";
        break;
      case "completed":
        bgColor = "#E9F5EC";
        textColor = "#166534";
        label = "완료됨";
        break;
      case "cancelled":
        bgColor = "#FEE2E2";
        textColor = "#B91C1C";
        label = "취소됨";
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  // 승인 버튼 핸들러
  const handleApprove = (id: number) => {
    Alert.alert("예약 승인", "이 예약을 승인하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "승인",
        onPress: async () => {
          try {
            const updated = await approveReservation(id, artisanId ?? undefined);
            setBookings((prev) =>
              prev.map((b) => (b.id === id ? { ...b, status: toDisplayStatus(updated.status) } : b))
            );
          } catch {
            Alert.alert("알림", "예약 승인에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 거절 버튼 핸들러
  const handleReject = (id: number) => {
    Alert.alert("예약 거절", "이 예약을 거절하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "거절",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await rejectReservation(
              id,
              "장인의 사정으로 예약을 거절했습니다.",
              artisanId ?? undefined
            );
            setBookings((prev) =>
              prev.map((b) => (b.id === id ? { ...b, status: toDisplayStatus(updated.status) } : b))
            );
          } catch {
            Alert.alert("알림", "예약 거절에 실패했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader
        activeItem="예약관리"
        rightComponent={
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="search" size={24} color={BRAND} />
          </TouchableOpacity>
        }
      />

      {/* ── 필터 탭 ── */}
      <View style={styles.tabContainer}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── 예약 리스트 ── */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={BRAND} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filteredBookings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={loadBookings}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={48} color="#D4CDC4" />
              <Text style={styles.emptyText}>해당하는 예약 내역이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("MasterBookingDetail", {
                  booking: {
                    id: String(item.id),
                    status: item.status,
                    title: item.title,
                    date: item.date,
                    time: item.time,
                    bookerName: item.bookerName,
                    guests: item.guests,
                    price: item.price,
                  },
                })
              }
            >
              <View style={styles.cardHeader}>
                {renderStatusBadge(item.status)}
                <Text style={styles.cardDate}>{item.date} {item.time}</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>예약자</Text>
                <Text style={styles.cardInfoValue}>{item.bookerName} (총 {item.guests}명)</Text>
              </View>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>결제금액</Text>
                <Text style={styles.cardInfoValue}>{item.price.toLocaleString()}원</Text>
              </View>

              {/* 액션 버튼 (상태에 따라 다르게 노출) */}
              {item.status === "pending" ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.rejectBtnText}>거절</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(item.id)}
                  >
                    <Text style={styles.approveBtnText}>승인하기</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.detailBtn}>
                  <Text style={styles.detailBtnText}>상세 보기</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="예약관리" />
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  tabContainer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#EAE6E1" },
  tabButtonActive: { backgroundColor: BRAND },
  tabText: { fontSize: 14, fontWeight: "600", color: GRAY },
  tabTextActive: { color: "#FFF" },

  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: GRAY },

  card: { backgroundColor: CARD, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardDate: { fontSize: 13, color: GRAY, fontWeight: "500" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: BRAND, marginBottom: 14 },
  cardInfoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardInfoLabel: { fontSize: 13, color: GRAY },
  cardInfoValue: { fontSize: 13, fontWeight: "600", color: BRAND },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rejectBtn: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  rejectBtnText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  approveBtn: { backgroundColor: BRAND },
  approveBtnText: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  detailBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: "#FAF9F6", alignItems: "center", borderWidth: 1, borderColor: BORDER },
  detailBtnText: { fontSize: 14, fontWeight: "600", color: BRAND },
});
