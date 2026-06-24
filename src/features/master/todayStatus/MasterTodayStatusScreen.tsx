import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useMasterHome } from "@/features/master/masterHome/useMasterHome";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

const TODAY_LABEL = (() => {
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];
  return `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 (${weekday})`;
})();

export function MasterTodayStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, error, reload } = useMasterHome();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 상단 뒤로가기 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 현황 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={BRAND} />
        </View>
      ) : error ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={reload} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── 요약 카드 ── */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{TODAY_LABEL}</Text>
            <Text style={styles.summarySubtitle}>오늘도 힘찬 하루 되세요 장인님! 💪</Text>
          </View>

          {/* ── 이번 달 수익 현황 ── */}
          <Text style={styles.sectionTitle}>이번 달 수익 현황</Text>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>이번 달 수익</Text>
              <Text style={styles.statValueMain}>
                {(data?.stats.monthlyRevenue ?? 0).toLocaleString("ko-KR")} 원
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>오늘 예약</Text>
              <Text style={styles.statValue}>{data?.stats.todayReservationCount ?? 0} 건</Text>
            </View>
          </View>

          {/* ── 오늘의 예약 타임라인 ── */}
          <Text style={styles.sectionTitle}>오늘의 예약 타임라인</Text>
          {!data?.todaySchedules.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>오늘 예정된 예약이 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.timelineCard}>
              {data.todaySchedules.map((schedule, index) => (
                <TouchableOpacity
                  key={schedule.id}
                  style={[
                    styles.timelineItem,
                    index === data.todaySchedules.length - 1 && { borderLeftColor: "transparent" },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("MasterBookings")}
                >
                  <Text style={styles.timeText}>{schedule.time}</Text>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{schedule.title}</Text>
                    <Text style={styles.timelineDesc}>예약자 {schedule.guests} · {schedule.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 17, fontWeight: "700", color: BRAND },

  centerFill: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  errorText: { fontSize: 14, color: GRAY, marginBottom: 16, textAlign: "center" },
  retryButton: { backgroundColor: BRAND, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { color: "#FFF", fontWeight: "600" },

  content: { padding: 20 },

  summaryCard: { backgroundColor: BRAND, borderRadius: 16, padding: 20, marginBottom: 28 },
  summaryTitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 6, fontWeight: "600" },
  summarySubtitle: { fontSize: 18, color: "#FFF", fontWeight: "700" },

  sectionTitle: { fontSize: 17, fontWeight: "700", color: BRAND, marginBottom: 12 },

  statCard: { backgroundColor: CARD, borderRadius: 16, padding: 18, marginBottom: 28, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  statLabel: { fontSize: 14, color: GRAY, fontWeight: "500" },
  statValueMain: { fontSize: 20, fontWeight: "800", color: BRAND },
  statValue: { fontSize: 15, fontWeight: "700", color: "#4B3D33" },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 8 },

  emptyCard: { backgroundColor: CARD, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: BORDER, alignItems: "center" },
  emptyText: { fontSize: 14, color: GRAY },

  timelineCard: { backgroundColor: CARD, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  timelineItem: { flexDirection: "row", borderLeftWidth: 2, borderLeftColor: BORDER, paddingBottom: 24, paddingLeft: 16, position: "relative" },
  timeText: { width: 44, fontSize: 14, fontWeight: "700", color: BRAND, marginTop: -2 },
  timelineContent: { flex: 1, paddingLeft: 12 },
  timelineTitle: { fontSize: 15, fontWeight: "600", color: "#1C1107", marginBottom: 4, marginTop: -2 },
  timelineDesc: { fontSize: 13, color: GRAY },
});
