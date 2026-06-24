import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  TextInput,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { createReservation } from "@/features/reservations/api/reservationsApi";
import { ApiError } from "@/services/api";
import type { ExperienceSchedule } from "@/types/api";

const BRAND = "#3D1F0D";
const BRAND_LIGHT = "#F5F0EB";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getScheduleDate(schedule: ExperienceSchedule) {
  const date = new Date(schedule.scheduledAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatScheduleTime(schedule: ExperienceSchedule) {
  const date = new Date(schedule.scheduledAt);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function groupSchedulesByDate(schedules: ExperienceSchedule[]) {
  // 예약 마감 시간 버퍼 (30분 전까지만 예약 가능)
  const bufferMinutes = 30;
  const now = new Date();
  now.setMinutes(now.getMinutes() + bufferMinutes);

  console.log('[날짜선택] 전체 스케줄 수:', schedules.length);
  console.log('[날짜선택] 기준 시간 (30분 버퍼):', now.toLocaleString());

  const result = schedules.reduce<Record<string, ExperienceSchedule[]>>((acc, schedule) => {
    const scheduleDate = new Date(schedule.scheduledAt);

    // 디버깅 로그
    const isActive = schedule.isActive;
    const hasSlots = schedule.remainingSlots > 0;
    const isFuture = scheduleDate >= now;
    const filtered = !isActive || !hasSlots || !isFuture;

    if (filtered) {
      console.log('[날짜선택] 필터됨:', {
        date: scheduleDate.toLocaleString(),
        isActive,
        remainingSlots: schedule.remainingSlots,
        isFuture,
        reason: !isActive ? '비활성' : !hasSlots ? '좌석없음' : '과거날짜'
      });
    }

    // 과거 날짜, 비활성, 남은 좌석 없음 필터링
    if (filtered) return acc;

    const dateKey = getScheduleDate(schedule);
    acc[dateKey] = [...(acc[dateKey] ?? []), schedule].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    return acc;
  }, {});

  console.log('[날짜선택] 예약 가능한 날짜:', Object.keys(result).sort());
  return result;
}

export function BookingCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookingCreate">>();
  const { exp, experience } = route.params;

  const schedulesByDate = useMemo(
    () => groupSchedulesByDate(experience.schedules ?? []),
    [experience.schedules]
  );
  const availableDateKeys = useMemo(
    () => Object.keys(schedulesByDate).sort(),
    [schedulesByDate]
  );
  const firstAvailableDate = availableDateKeys[0] ?? null;
  const firstAvailableDateValue = firstAvailableDate
    ? new Date(`${firstAvailableDate}T00:00:00`)
    : new Date();

  const firstSchedule = firstAvailableDate ? schedulesByDate[firstAvailableDate]?.[0] : null;
  const initialHeadcount = Math.min(2, Math.max(1, firstSchedule?.remainingSlots ?? 2));

  const [viewYear, setViewYear] = useState(firstAvailableDateValue.getFullYear());
  const [viewMonth, setViewMonth] = useState(firstAvailableDateValue.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(firstAvailableDate);
  const [selectedSchedule, setSelectedSchedule] = useState<ExperienceSchedule | null>(firstSchedule);
  const [headcount, setHeadcount] = useState(initialHeadcount);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDateKey && firstAvailableDate) {
      setSelectedDateKey(firstAvailableDate);
      setSelectedSchedule(schedulesByDate[firstAvailableDate]?.[0] ?? null);
    }
  }, [firstAvailableDate, schedulesByDate, selectedDateKey]);

  useEffect(() => {
    if (!selectedSchedule) return;
    setHeadcount((current) => Math.min(current, Math.max(1, selectedSchedule.remainingSlots)));
  }, [selectedSchedule]);

  const pricePerPerson = experience.price;
  const total = pricePerPerson * headcount;
  const selectedDateSchedules = selectedDateKey ? schedulesByDate[selectedDateKey] ?? [] : [];
  const maxHeadcount = Math.max(1, selectedSchedule?.remainingSlots ?? experience.maxParticipants);

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
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
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

  const handleSelectDate = (day: number) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const schedules = schedulesByDate[dateKey] ?? [];
    if (schedules.length === 0) return;

    setSelectedDateKey(dateKey);
    setSelectedSchedule(schedules[0]);
    setHeadcount((current) => Math.min(current, Math.max(1, schedules[0].remainingSlots)));
  };

  const handleSelectSchedule = (schedule: ExperienceSchedule) => {
    setSelectedSchedule(schedule);
    setHeadcount((current) => Math.min(current, Math.max(1, schedule.remainingSlots)));
  };

  const handleBook = async () => {
    console.log("🔔 [예약] 예약 버튼 클릭됨");

    if (!selectedSchedule || !selectedDateKey) {
      console.log("🔴 [예약] 날짜/시간 미선택");
      Alert.alert("알림", "예약할 날짜와 시간을 선택해주세요.");
      return;
    }

    console.log("🔔 [예약] 선택된 스케줄:", {
      experienceId: experience.id,
      scheduleId: selectedSchedule.id,
      numberOfParticipants: headcount,
      requestMessage: requestMessage.trim() || undefined,
    });

    setIsSubmitting(true);
    try {
      console.log("🔔 [예약] 프로필 조회 시작");
      const profile = await getCurrentProfile();
      console.log("🔔 [예약] 프로필 조회 결과:", profile);

      if (!profile) {
        console.log("🔴 [예약] 로그인 필요");
        Alert.alert("로그인 필요", "예약하려면 로그인이 필요합니다.");
        navigation.navigate("Login");
        return;
      }

      console.log("🔔 [예약] createReservation API 호출 시작");
      const reservation = await createReservation({
        experienceId: experience.id,
        scheduleId: selectedSchedule.id,
        numberOfParticipants: headcount,
        requestMessage: requestMessage.trim() || undefined,
      });

      console.log("✅ [예약] 예약 생성 성공:", reservation);

      navigation.navigate("BookingRequestComplete", {
        reservationId: reservation.id,
        exp,
        dateLabel: formatDateLabel(selectedDateKey),
        time: formatScheduleTime(selectedSchedule),
        headcount,
        totalPrice: reservation.totalPrice ?? total,
        requestMessage,
      });
    } catch (error) {
      console.log("🔴 [예약] 예약 생성 실패:", error);
      let errorMsg = "예약 신청에 실패했습니다.";

      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMsg = "로그인이 필요합니다. 다시 로그인해주세요.";
        } else if (error.status === 409 || error.message?.includes("Duplicate active reservation")) {
          errorMsg = "이미 예약된 일정입니다. 다른 시간을 선택해주세요.";
        } else if (error.message?.includes("Booking slot is unavailable")) {
          errorMsg = "정원이 모두 찼습니다. 다른 시간을 선택해주세요.";
        } else if (error.status === 400) {
          errorMsg = error.message || "요청 정보가 올바르지 않습니다.";
        } else {
          errorMsg = error.message;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      Alert.alert("예약 실패", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {pricePerPerson.toLocaleString()}<Text style={{ fontSize: 13, fontWeight: "500" }}>원~</Text>
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
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                const isAvailable = cell.type === "cur" && !!schedulesByDate[dateKey]?.length;
                const isSelected = cell.type === "cur" && dateKey === selectedDateKey;
                const isSun = ci === 0;
                const isSat = ci === 6;
                const isOther = cell.type !== "cur";
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[
                      styles.dayCell,
                      isAvailable && styles.dayCellAvailable,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => isAvailable && handleSelectDate(cell.day)}
                    activeOpacity={isAvailable ? 0.7 : 1}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        (isOther || !isAvailable) && { color: "#C8BDB4" },
                        !isOther && isAvailable && isSun && { color: "#D97B6C" },
                        !isOther && isAvailable && isSat && { color: "#6B9BD2" },
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
            {selectedDateSchedules.length === 0 ? (
              <Text style={styles.emptyText}>예약 가능한 날짜를 선택해주세요.</Text>
            ) : selectedDateSchedules.map((schedule) => {
              const active = selectedSchedule?.id === schedule.id;
              return (
                <TouchableOpacity
                  key={schedule.id}
                  style={[
                    styles.timeChip,
                    active && styles.timeChipActive,
                  ]}
                  onPress={() => handleSelectSchedule(schedule)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.timeText,
                      active && { color: "#FFFFFF", fontWeight: "700" },
                    ]}
                  >
                    {formatScheduleTime(schedule)}
                  </Text>
                  <Text style={[styles.remainingText, active && { color: "#F5F0EB" }]}>
                    {schedule.remainingSlots}자리
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
            <Text style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>최대 {maxHeadcount}명</Text>
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
              onPress={() => setHeadcount(h => Math.min(maxHeadcount, h + 1))}
              disabled={headcount >= maxHeadcount}
            >
              <Ionicons name="add" size={18} color="#1C1107" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── 요청 메시지 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청 메시지</Text>
          <Text style={{ fontSize: 12, color: GRAY, marginTop: -10, marginBottom: 14 }}>
            장인에게 전달할 내용이 있다면 입력해주세요. (선택)
          </Text>
          <TextInput
            style={styles.messageInput}
            placeholder="예: 알레르기가 있어요, 초보자입니다 등"
            placeholderTextColor="#C8BDB4"
            value={requestMessage}
            onChangeText={setRequestMessage}
            multiline
            maxLength={300}
          />
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
        <TouchableOpacity
          style={[
            styles.bookBtn,
            (!selectedSchedule || isSubmitting) && styles.bookBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleBook}
          disabled={!selectedSchedule || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookBtnText}>예약하기</Text>
          )}
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
  dayCellAvailable: { backgroundColor: "#F5F0EB" },
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
  remainingText: { fontSize: 11, color: GRAY, marginTop: 2, textAlign: "center" },
  emptyText: { fontSize: 13, color: GRAY },

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

  // 요청 메시지
  messageInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
    fontSize: 14,
    color: "#1C1107",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
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
  bookBtnDisabled: { backgroundColor: "#C8BDB4" },
  bookBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
