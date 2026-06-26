import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useMasterHome } from "@/features/master/masterHome/useMasterHome";
import { useTheme } from "@/theme/ThemeContext";

const TODAY_LABEL = (() => {
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];
  return `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 (${weekday})`;
})();

export function MasterTodayStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { data, isLoading, error, reload } = useMasterHome();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 상단 뒤로가기 헤더 ── */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>오늘의 현황 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerFill}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.text }]} onPress={reload} activeOpacity={0.8}>
            <Text style={[styles.retryButtonText, { color: colors.bg }]}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── 요약 카드 ── */}
          <View style={[styles.summaryCard, { backgroundColor: colors.text }]}>
            <Text style={[styles.summaryTitle, { color: colors.bg, opacity: 0.8 }]}>{TODAY_LABEL}</Text>
            <Text style={[styles.summarySubtitle, { color: colors.bg }]}>오늘도 힘찬 하루 되세요 장인님! 💪</Text>
          </View>

          {/* ── 이번 달 수익 현황 ── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>이번 달 수익 현황</Text>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>이번 달 수익</Text>
              <Text style={[styles.statValueMain, { color: colors.text }]}>
                {(data?.stats.monthlyRevenue ?? 0).toLocaleString("ko-KR")} 원
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>오늘 예약</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data?.stats.todayReservationCount ?? 0} 건</Text>
            </View>
          </View>

          {/* ── 오늘의 예약 타임라인 ── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘의 예약 타임라인</Text>
          {!data?.todaySchedules.length ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>오늘 예정된 예약이 없습니다.</Text>
            </View>
          ) : (
            <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {data.todaySchedules.map((schedule, index) => (
                <TouchableOpacity
                  key={schedule.id}
                  style={[
                    styles.timelineItem,
                    { borderLeftColor: colors.border },
                    index === data.todaySchedules.length - 1 && { borderLeftColor: "transparent" },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("MasterBookings")}
                >
                  <Text style={[styles.timeText, { color: colors.text }]}>{schedule.time}</Text>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: colors.text }]}>{schedule.title}</Text>
                    <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>예약자 {schedule.guests} · {schedule.location}</Text>
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
  safeArea: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  centerFill: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  errorText: { fontSize: 14, marginBottom: 16, textAlign: "center" },
  retryButton: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontWeight: "600" },

  content: { padding: 20 },

  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 28 },
  summaryTitle: { fontSize: 14, marginBottom: 6, fontWeight: "600" },
  summarySubtitle: { fontSize: 18, fontWeight: "700" },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },

  statCard: { borderRadius: 16, padding: 18, marginBottom: 28, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  statLabel: { fontSize: 14, fontWeight: "500" },
  statValueMain: { fontSize: 20, fontWeight: "800" },
  statValue: { fontSize: 15, fontWeight: "700" },
  divider: { height: 1, marginVertical: 8 },

  emptyCard: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 14 },

  timelineCard: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  timelineItem: { flexDirection: "row", borderLeftWidth: 2, paddingBottom: 24, paddingLeft: 16, position: "relative" },
  timeText: { width: 44, fontSize: 14, fontWeight: "700", marginTop: -2 },
  timelineContent: { flex: 1, paddingLeft: 12 },
  timelineTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4, marginTop: -2 },
  timelineDesc: { fontSize: 13 },
});
