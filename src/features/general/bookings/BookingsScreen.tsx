import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MainLayout } from "@/features/general/home/MainLayout";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getArtisan } from "@/features/artisans/api/artisanApi";
import type { Reservation, ReservationStatus } from "@/types/api";

// ─── 타입 ───────────────────────────────────────────────────────────────────────

type TabType = "upcoming" | "pending" | "past" | "cancelled";

export interface Booking {
  id: string;
  reservationId?: number;
  experienceId?: number;
  status: TabType;
  title: string;
  artisan: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  imageUri?: string;
  orderNo?: string;
  paidAt?: string;
  payMethod?: string;
  totalPrice?: number;
  // 장인 승인은 끝났지만 아직 결제 전인 예약 (결제는 승인 후에만 가능)
  paymentRequired?: boolean;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "upcoming", label: "예정된 체험" },
  { id: "pending", label: "승인 대기" },
  { id: "past", label: "지난 체험" },
  { id: "cancelled", label: "취소 내역" },
];

// 백엔드 ReservationStatus → 화면 탭(TabType) 매핑
function toTabType(status: ReservationStatus): TabType {
  switch (status) {
    case "PENDING":
      return "pending";
    case "APPROVED":
    case "PAID":
    case "CONFIRMED":
      return "upcoming";
    case "COMPLETED":
      return "past";
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

async function toBooking(reservation: Reservation): Promise<Booking> {
  const experience = await getExperience(reservation.experienceId).catch(() => null);
  const artisan = experience
    ? await getArtisan(experience.artisanId).catch(() => null)
    : null;

  return {
    id: String(reservation.id),
    reservationId: reservation.id,
    experienceId: reservation.experienceId,
    status: toTabType(reservation.status),
    title: experience?.title ?? "체험",
    artisan: artisan?.name ?? "장인",
    date: formatDate(reservation.reservedDateTime),
    time: formatTime(reservation.reservedDateTime),
    guests: reservation.numberOfParticipants,
    location: experience?.locationAddress ?? "-",
    totalPrice: reservation.totalPrice,
    paymentRequired: reservation.status === "APPROVED",
  };
}

// 예약 상태 배지 (탭 상태 + 결제 여부를 합쳐 하나의 배지로 표시)
function getStatusBadge(item: Booking): { label: string; bg: string; color: string } {
  if (item.status === "upcoming") {
    return item.paymentRequired
      ? { label: "결제 필요", bg: "#FFF3E0", color: "#E65100" }
      : { label: "결제 완료", bg: "#E8F5E9", color: "#2E7D32" };
  }
  if (item.status === "pending") {
    return { label: "승인 대기", bg: "#FFF3E0", color: "#E65100" };
  }
  if (item.status === "cancelled") {
    return { label: "취소", bg: "#FFEBEE", color: "#C62828" };
  }
  return { label: "지난 체험", bg: "#EAE6E1", color: "#6E665F" };
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setBookings([]);
        return;
      }
      const reservations = await getMyReservations(profile.id);
      const mapped = await Promise.all(reservations.map(toBooking));
      setBookings(mapped);
    } catch {
      Alert.alert("알림", "예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // 현재 탭에 맞는 예약 내역 필터링
  const filteredBookings = bookings.filter(
    (booking) => booking.status === activeTab
  );

  // 예약 카드 렌더링 함수
  const renderBookingCard = ({ item }: { item: Booking }) => {
    const badge = getStatusBadge(item);
    return (
    <View style={styles.card}>
      {/* 상단 (상태 배지 + 날짜, 시간) */}
      <View style={styles.cardHeader}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#3B2B26" />
          <Text style={styles.dateText}>
            {item.date} · {item.time}
          </Text>
        </View>
      </View>

      {/* 본문 (정보) */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText}>장인 : {item.artisan}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText}>예약 인원 : {item.guests}명</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.detailButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("BookingDetail", { booking: item })}
        >
          <Text style={styles.detailButtonText}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <MainLayout>
      {/* 탭 네비게이션 (가로 스크롤) */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 예약 목록 */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#3B2B26" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={loadBookings}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#D4CDC4" />
              <Text style={styles.emptyText}>해당하는 예약 내역이 없습니다.</Text>
            </View>
          }
        />
      )}
    </MainLayout>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // 탭
  tabContainer: { borderBottomWidth: 1, borderBottomColor: "#EAE6E1", paddingBottom: 12 },
  tabScrollContent: { paddingHorizontal: 20, gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#EAE6E1" },
  activeTabButton: { backgroundColor: "#3B2B26" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8A8077" },
  activeTabText: { color: "#FFFFFF" },

  // 리스트
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: "#8A8077" },

  // 예약 카드
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE6E1",
    // 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F5F4F0" },
  statusRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 14, fontWeight: "700", color: "#3B2B26", marginLeft: 6 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },

  cardBody: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#3B2B26", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#6E665F", marginLeft: 8, flex: 1 },

  cardFooter: { marginTop: 4 },
  detailButton: {
    width: "100%", backgroundColor: "#FAF9F6", paddingVertical: 12, borderRadius: 10,
    alignItems: "center", borderWidth: 1, borderColor: "#D4CDC4",
  },
  detailButtonText: { fontSize: 14, fontWeight: "600", color: "#3B2B26" },
});
