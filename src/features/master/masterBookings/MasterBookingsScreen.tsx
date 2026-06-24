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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { useMasterBookings } from "./useMasterBookings";
import type { MasterBookingStatus } from "./types";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

// ─── 화면 표시용 예약 타입 ───────────────────────────────────────────────────────
const STATUS_TABS: { id: "all" | MasterBookingStatus; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pending", label: "승인 대기" },
  { id: "confirmed", label: "예약 확정" },
  { id: "completed", label: "완료됨" },
];

function confirmAction(title: string, message: string, confirmText: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "취소", style: "cancel", onPress: () => resolve(false) },
      { text: confirmText, onPress: () => resolve(true) },
    ]);
  });
}

export function MasterBookingsScreen() {
  const [activeTab, setActiveTab] = useState<"all" | MasterBookingStatus>("all");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, error, reload, approve, reject } = useMasterBookings();
  const bookings = data?.bookings ?? [];

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  useEffect(() => {
    if (error) Alert.alert("알림", error.message);
  }, [error]);

  const filteredBookings = bookings.filter((b) =>
    activeTab === "all" ? true : b.status === activeTab
  );

  // 상태 뱃지 렌더링 헬퍼
  const renderStatusBadge = (status: MasterBookingStatus) => {
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
  const handleApprove = async (id: number) => {
    if (!(await confirmAction("예약 승인", "이 예약을 승인하시겠습니까?", "승인"))) return;
    try {
      await approve(id);
    } catch (approveError) {
      Alert.alert(
        "알림",
        approveError instanceof Error ? approveError.message : "예약 승인에 실패했습니다.",
      );
    }
  };

  // 거절 버튼 핸들러
  const handleReject = async (id: number) => {
    if (!(await confirmAction("예약 거절", "이 예약을 거절하시겠습니까?", "거절"))) return;
    try {
      await reject(id, "장인의 사정으로 예약을 거절했습니다.");
    } catch (rejectError) {
      Alert.alert(
        "알림",
        rejectError instanceof Error ? rejectError.message : "예약 거절에 실패했습니다.",
      );
    }
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
      {isLoading ? (
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
          onRefresh={() => void reload()}
          refreshing={isLoading}
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
                  reservationId: item.id,
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
