import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { getArtisan } from "@/features/artisans/api/artisanApi";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { MainLayout } from "@/features/general/home/MainLayout";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme/ThemeContext";
import type { Experience, Reservation, ReservationStatus } from "@/types/api";

type TabType = "upcoming" | "pending" | "past" | "cancelled";

export interface Booking {
  id: string;
  reservationId?: number;
  experienceId?: number;
  status: TabType;
  reservationStatus?: ReservationStatus;
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
  paymentRequired?: boolean;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "upcoming", label: "예정" },
  { id: "pending", label: "승인 대기" },
  { id: "past", label: "지난 체험" },
  { id: "cancelled", label: "취소" },
];

const PAID_STATUSES: ReservationStatus[] = ["PAID", "CONFIRMED", "COMPLETED"];

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
  const date = new Date(iso);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${weekday})`;
}

function formatTime(iso: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatPaidAt(iso: string | null) {
  if (!iso) return undefined;
  const date = new Date(iso);
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${displayHour}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getMainImageUri(experience: Experience | null): string | undefined {
  if (!experience?.images?.length) return undefined;
  return [...experience.images].sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl;
}

async function toBooking(reservation: Reservation): Promise<Booking> {
  const experience = await getExperience(reservation.experienceId).catch(() => null);
  const artisan = experience ? await getArtisan(experience.artisanId).catch(() => null) : null;

  return {
    id: String(reservation.id),
    reservationId: reservation.id,
    experienceId: reservation.experienceId,
    status: toTabType(reservation.status),
    reservationStatus: reservation.status,
    title: experience?.title ?? "체험",
    artisan: artisan?.name ?? "장인",
    date: formatDate(reservation.reservedDateTime),
    time: formatTime(reservation.reservedDateTime),
    guests: reservation.numberOfParticipants,
    location: experience?.locationAddress ?? "-",
    imageUri: getMainImageUri(experience),
    totalPrice: reservation.totalPrice,
    paymentRequired: reservation.status === "APPROVED",
    rejectionReason: reservation.rejectionReason,
    cancellationReason: reservation.cancellationReason,
    orderNo: reservation.paymentOrderId ?? undefined,
    paidAt: PAID_STATUSES.includes(reservation.status) ? formatPaidAt(reservation.updatedAt) : undefined,
  };
}

function getStatusBadge(item: Booking): { label: string; tone: "accent" | "gold" | "muted" | "danger" } {
  if (item.status === "pending") return { label: "승인 대기", tone: "gold" };
  if (item.status === "cancelled") return { label: "취소", tone: "danger" };
  if (item.status === "past") return { label: "완료", tone: "muted" };
  return item.paymentRequired
    ? { label: "결제 필요", tone: "gold" }
    : { label: "예약 확정", tone: "accent" };
}

export function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setBookings([]);
        return;
      }
      const reservations = await getMyReservations();
      const mapped = await Promise.all(reservations.map(toBooking));
      setBookings(mapped);
    } catch {
      Alert.alert("알림", "예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  const filteredBookings = bookings.filter((booking) => booking.status === activeTab);

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const badge = getStatusBadge(item);
    const badgeColor =
      badge.tone === "accent"
        ? colors.accent
        : badge.tone === "gold"
          ? colors.gold
          : badge.tone === "danger"
            ? "#C24438"
            : colors.textSecondary;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.86}
        onPress={() => navigation.navigate("BookingDetail", { booking: item })}
      >
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badge.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.datePanel}>
          <View style={[styles.dateIcon, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={17} color={colors.accent} />
          </View>
          <View style={styles.dateTextBlock}>
            <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.artisan}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.guests}명</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout activeItem="예약내역">
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, { color: isActive ? colors.bg : colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.accent} />
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
              <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={34} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>예약 내역이 없습니다</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                선택한 상태에 해당하는 예약이 없어요.
              </Text>
            </View>
          }
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  tabContainer: { borderBottomWidth: 1, paddingBottom: 12 },
  tabScrollContent: { paddingHorizontal: 20, gap: 8 },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "800" },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 84 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { marginTop: 16, fontSize: 17, fontWeight: "800" },
  emptyDesc: { marginTop: 8, fontSize: 14 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 13,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 12, fontWeight: "800" },
  cardTitle: { fontSize: 17, fontWeight: "900", marginBottom: 14 },
  datePanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 14,
  },
  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateTextBlock: { flex: 1 },
  dateText: { fontSize: 14, fontWeight: "800" },
  timeText: { fontSize: 12, marginTop: 2 },
  infoGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
  infoItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { flex: 1, fontSize: 13 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { flex: 1, fontSize: 13 },
});
