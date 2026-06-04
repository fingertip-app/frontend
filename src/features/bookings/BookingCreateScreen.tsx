import React, { useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#3D1F0D";
const BRAND_LIGHT = "#F5F0EB";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const TIME_SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function BookingCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const exp = route.params?.exp;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(29);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [headcount, setHeadcount] = useState(2);

  const pricePerPerson = 35000;
  const total = pricePerPerson * headcount;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  // 이전 달 마지막 날들
  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  };

  // 셀 배열 생성 (이전달 / 현재달 / 다음달)
  type DayCell = { day: number; type: "prev" | "cur" | "next" };
  const cells: DayCell[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: prevMonthDays - firstDow + 1 + i, type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: "cur" });
  }
  const remaining = 7 - (cells.length % 7 === 0 ? 7 : cells.length % 7);
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: "next" });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const isUnavailable = (slot: string) => slot === "13:00";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 체험 요약 카드 */}
        <View style={styles.expCard}>
          <Image
            source={{ uri: exp?.imageUri }}
            style={styles.expThumb}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.expTitle} numberOfLines={1}>
              {exp?.title ?? "이천 도자기 물레 체험"}
            </Text>
            <Text style={styles.expSub} numberOfLines={1}>
              {exp?.location ?? "경기 이천시"} · {exp?.artisan ?? "김도예 장인"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={styles.expPrice}>
                35,000<Text style={{ fontSize: 13, fontWeight: "500" }}>원~</Text>
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="time-outline" size={13} color={GRAY} />
                <Text style={{ fontSize: 13, color: GRAY }}>2시간</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── 날짜 선택 ── */}
        <View style={styles.section}>
          {/* 섹션 헤더 */}
          <View style={styles.calHeader}>
            <Text style={styles.sectionTitle}>날짜 선택</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity onPress={prevMonth} hitSlop={8}>
                <Ionicons name="chevron-back" size={18} color="#1C1107" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {viewYear}년 {viewMonth + 1}월
              </Text>
              <TouchableOpacity onPress={nextMonth} hitSlop={8}>
                <Ionicons name="chevron-forward" size={18} color="#1C1107" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={w}
                style={[
                  styles.weekdayLabel,
                  i === 0 && { color: "#D97B6C" },
                  i === 6 && { color: "#6B9BD2" },
                ]}
              >
                {w}
              </Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, ci) => {
                const isSelected = cell.type === "cur" && cell.day === selectedDate;
                const isSun = ci === 0;
                const isSat = ci === 6;
                const isOther = cell.type !== "cur";
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => !isOther && setSelectedDate(cell.day)}
                    activeOpacity={isOther ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isOther && { color: "#C8BDB4" },
                        !isOther && isSun && { color: "#D97B6C" },
                        !isOther && isSat && { color: "#6B9BD2" },
                        isSelected && { color: "#FFFFFF", fontWeight: "700" },
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* ── 시간 선택 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간 선택</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const unavail = isUnavailable(slot);
              const active = selectedTime === slot && !unavail;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeChip,
                    active && styles.timeChipActive,
                    unavail && styles.timeChipUnavail,
                  ]}
                  onPress={() => !unavail && setSelectedTime(slot)}
                  activeOpacity={unavail ? 1 : 0.75}
                >
                  <Text
                    style={[
                      styles.timeText,
                      active && { color: "#FFFFFF", fontWeight: "700" },
                      unavail && { color: "#C8BDB4" },
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── 인원 선택 ── */}
        <View style={[styles.section, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
          <View>
            <Text style={styles.sectionTitle}>인원 선택</Text>
            <Text style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>최대 6명</Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setHeadcount(h => Math.max(1, h - 1))}
            >
              <Ionicons name="remove" size={18} color="#1C1107" />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{headcount}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setHeadcount(h => Math.min(6, h + 1))}
            >
              <Ionicons name="add" size={18} color="#1C1107" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── 요약 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요약</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>체험 금액</Text>
            <Text style={styles.summaryMid}>
              {pricePerPerson.toLocaleString()}원 × {headcount}명
            </Text>
            <Text style={styles.summaryVal}>
              {(pricePerPerson * headcount).toLocaleString()}원
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER }]}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#1C1107" }}>
              총 결제 금액
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.totalText}>
              {total.toLocaleString()}원
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 예약 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>예약하기</Text>
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

  expCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginVertical: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  expThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#E8E2D9",
  },
  expTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107" },
  expSub: { fontSize: 12, color: GRAY, marginTop: 3 },
  expPrice: { fontSize: 16, fontWeight: "800", color: "#1C1107" },

  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 0 },

  section: { paddingHorizontal: 20, paddingVertical: 20 },

  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107", marginBottom: 16 },

  // Calendar
  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthLabel: { fontSize: 15, fontWeight: "600", color: "#1C1107", minWidth: 80, textAlign: "center" },
  weekdayRow: { flexDirection: "row", marginBottom: 6 },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: GRAY,
    paddingVertical: 4,
  },
  weekRow: { flexDirection: "row", marginBottom: 2 },
  dayCell: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  dayCellSelected: { backgroundColor: BRAND },
  dayText: { fontSize: 14, color: "#1C1107" },

  // Time
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  timeChipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  timeChipUnavail: {
    backgroundColor: "#F3F0EC",
    borderColor: BORDER,
  },
  timeText: { fontSize: 14, color: "#1C1107", fontWeight: "500" },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 4,
    gap: 2,
  },
  stepBtn: { padding: 10 },
  stepValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1107",
    minWidth: 28,
    textAlign: "center",
  },

  // Summary
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryLabel: { fontSize: 14, color: GRAY, flex: 1 },
  summaryMid: { fontSize: 13, color: GRAY, marginRight: 12 },
  summaryVal: { fontSize: 14, color: "#1C1107", fontWeight: "600" },
  totalText: { fontSize: 20, fontWeight: "800", color: "#1C1107", letterSpacing: -0.5 },

  // Footer
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
  bookBtn: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});