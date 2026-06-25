import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  buildRecurringSchedules,
  formatLocalDate,
  parseLocalDate,
  parseTimeLabel,
} from "@/features/experiences/utils/scheduleBuilder";
import { useTheme } from "@/theme/ThemeContext";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export function Step3Schedule() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const currentStep = 3;
  const initialStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatLocalDate(date);
  }, []);
  const initialEndDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return formatLocalDate(date);
  }, []);

  const [operationStartDate, setOperationStartDate] = useState(initialStartDate);
  const [operationEndDate, setOperationEndDate] = useState(initialEndDate);
  const [selectedDays, setSelectedDays] = useState<string[]>(["월", "화", "수", "목", "금"]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: "slot_1", startTime: "10:00 AM", endTime: "12:00 PM" },
    { id: "slot_2", startTime: "02:00 PM", endTime: "04:00 PM" },
  ]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      startTime: "",
      endTime: "",
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSlot = (
    id: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const scheduleCount = buildRecurringSchedules(
    operationStartDate,
    operationEndDate,
    selectedDays,
    timeSlots,
    1,
  ).length;

  const handleNext = () => {
    const startDate = parseLocalDate(operationStartDate);
    const endDate = parseLocalDate(operationEndDate);
    if (!startDate || !endDate || endDate < startDate) {
      Alert.alert("운영 기간 확인", "시작일과 종료일을 YYYY-MM-DD 형식으로 확인해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("운영 요일 확인", "운영할 요일을 하나 이상 선택해주세요.");
      return;
    }
    if (
      timeSlots.length === 0 ||
      timeSlots.some((slot) => !parseTimeLabel(slot.startTime) || !parseTimeLabel(slot.endTime))
    ) {
      Alert.alert("운영 시간 확인", "모든 시간대를 HH:mm 또는 HH:mm AM/PM 형식으로 입력해주세요.");
      return;
    }
    if (
      timeSlots.some((slot) => {
        const start = parseTimeLabel(slot.startTime)!;
        const end = parseTimeLabel(slot.endTime)!;
        return end.hour * 60 + end.minute <= start.hour * 60 + start.minute;
      })
    ) {
      Alert.alert("운영 시간 확인", "종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }
    if (scheduleCount === 0) {
      Alert.alert("일정 확인", "선택한 기간 안에 생성되는 일정이 없습니다.");
      return;
    }

    navigation.navigate("Step4Pricing", {
      ...route.params,
      operationStartDate,
      operationEndDate,
      selectedDays,
      timeSlots,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 헤더 바 ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>체험 등록</Text>
        <TouchableOpacity>
          <Text style={[styles.tempSaveText, { color: colors.textSecondary }]}>임시 저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 스텝 인디케이터 ── */}
        <View style={styles.stepContainer}>
          {STEP_LABELS.map((label, idx) => {
            const step = idx + 1;
            const isActive = currentStep >= step;
            const isCurrent = currentStep === step;
            return (
              <View key={step} style={styles.stepWrapper}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, { backgroundColor: colors.border }, isActive && { backgroundColor: colors.text }]}>
                    <Text style={[styles.stepNum, { color: isActive ? colors.bg : colors.textSecondary }]}>
                      {step}
                    </Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: colors.textSecondary }, isCurrent && { color: colors.text, fontWeight: "600" }]}>
                    {label}
                  </Text>
                </View>
                {step < 5 && (
                  <View style={[styles.stepLine, { backgroundColor: colors.border }, currentStep > step && { backgroundColor: colors.text }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* ── 섹션 헤더 ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>체험 일정을 설정해주세요</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            장인님의 소중한 시간이 헛되지 않도록,{"\n"}
            가능한 요일과 시간대를 명확히 설정해주세요.
          </Text>
        </View>

        {/* ── 운영 기간 ── */}
        <View style={styles.block}>
          <View style={styles.blockTitleRow}>
            <Ionicons name="calendar-number-outline" size={15} color={colors.text} />
            <Text style={[styles.blockTitle, { color: colors.text }]}>운영 기간</Text>
          </View>
          <View style={styles.dateRangeRow}>
            <View style={styles.dateInputCol}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>시작일</Text>
              <TextInput
                style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={operationStartDate}
                onChangeText={setOperationStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <Text style={[styles.dateSeparator, { color: colors.textSecondary }]}>~</Text>
            <View style={styles.dateInputCol}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>종료일</Text>
              <TextInput
                style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={operationEndDate}
                onChangeText={setOperationEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* ── 운영 요일 선택 ── */}
        <View style={styles.block}>
          <View style={styles.blockTitleRow}>
            <Ionicons name="calendar-outline" size={15} color={colors.text} />
            <Text style={[styles.blockTitle, { color: colors.text }]}>운영 요일 선택 (중복 선택 가능)</Text>
          </View>

          <View style={styles.dayGrid}>
            {DAYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayBtn,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    active && { backgroundColor: colors.text, borderColor: colors.text },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayBtnText, { color: active ? colors.bg : colors.textSecondary }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 운영 시간대 ── */}
        <View style={styles.block}>
          <View style={styles.blockTitleRow}>
            <Ionicons name="time-outline" size={15} color={colors.text} />
            <Text style={[styles.blockTitle, { color: colors.text }]}>운영 시간대 (타임)</Text>
            <TouchableOpacity style={[styles.addSlotBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleAddSlot}>
              <Ionicons name="add" size={14} color={colors.text} />
              <Text style={[styles.addSlotBtnText, { color: colors.text }]}>타임 추가</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.slotList}>
            {timeSlots.map((slot, idx) => (
              <View key={slot.id} style={[styles.slotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* 카드 헤더 */}
                <View style={styles.slotCardHeader}>
                  <Text style={[styles.slotCardTitle, { color: colors.text }]}>{idx + 1}타임</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSlot(slot.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* 시간 입력 */}
                <View style={styles.slotTimeRow}>
                  <View style={styles.slotTimeCol}>
                    <Text style={[styles.slotTimeLabel, { color: colors.textSecondary }]}>시작 시간</Text>
                    <TextInput
                      style={[styles.slotTimeInput, { backgroundColor: colors.bg, color: colors.text }]}
                      value={slot.startTime}
                      onChangeText={(v) => handleUpdateSlot(slot.id, "startTime", v)}
                      placeholder="00:00 AM"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.slotTimeDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.slotTimeCol}>
                    <Text style={[styles.slotTimeLabel, { color: colors.textSecondary }]}>종료 시간</Text>
                    <TextInput
                      style={[styles.slotTimeInput, { backgroundColor: colors.bg, color: colors.text }]}
                      value={slot.endTime}
                      onChangeText={(v) => handleUpdateSlot(slot.id, "endTime", v)}
                      placeholder="00:00 PM"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── 일정 설정 팁 ── */}
        <View style={[styles.tipBox, { backgroundColor: colors.border }]}>
          <View style={styles.tipTitleRow}>
            <Ionicons name="location-outline" size={14} color={colors.text} />
            <Text style={[styles.tipTitle, { color: colors.text }]}>일정 설정 팁</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            선택한 운영 기간 동안 요일과 시간대가 조합되어 총 {scheduleCount}개의 예약 회차가 생성됩니다.
          </Text>
        </View>
      </ScrollView>

      {/* ── 하단 버튼 ── */}
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.prevBtn, { borderColor: colors.text }]}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.prevBtnText, { color: colors.text }]}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.text }, timeSlots.length === 0 && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={timeSlots.length === 0}
          onPress={handleNext}
        >
          <Text style={[styles.nextBtnText, { color: colors.bg }]}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // 헤더 바
  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 16 },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  tempSaveText: { fontSize: 13 },

  // 스크롤
  content: { padding: 20, paddingBottom: 40 },

  // 스텝 인디케이터
  stepContainer: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "center", marginBottom: 32, marginTop: 4,
  },
  stepWrapper: { flexDirection: "row", alignItems: "center" },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "700" },
  stepLabel: { fontSize: 10, marginTop: 2, textAlign: "center" },
  stepLine: {
    width: 20, height: 1.5,
    marginHorizontal: 4, marginBottom: 14,
  },

  // 섹션 헤더
  sectionHeader: { marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 28 },
  blockTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  blockTitle: { fontSize: 14, fontWeight: "600", flex: 1 },

  // 운영 기간
  dateRangeRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  dateInputCol: { flex: 1 },
  dateLabel: { fontSize: 11, marginBottom: 6 },
  dateInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14,
  },
  dateSeparator: { paddingBottom: 12 },

  // 요일 버튼
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dayBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center", alignItems: "center",
  },
  dayBtnText: { fontSize: 14, fontWeight: "600" },

  // 타임 추가 버튼
  addSlotBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  addSlotBtnText: { fontSize: 12, fontWeight: "600" },

  // 타임 슬롯 카드
  slotList: { gap: 12 },
  slotCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  slotCardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14,
  },
  slotCardTitle: { fontSize: 14, fontWeight: "700" },
  slotTimeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  slotTimeCol: { flex: 1 },
  slotTimeDivider: { width: 1, height: 36 },
  slotTimeLabel: { fontSize: 11, marginBottom: 6 },
  slotTimeInput: {
    borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, fontWeight: "600",
  },

  // 팁 박스
  tipBox: {
    borderRadius: 12,
    padding: 16, marginBottom: 8,
  },
  tipTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  tipTitle: { fontSize: 13, fontWeight: "700" },
  tipText: { fontSize: 12, lineHeight: 20 },

  // 하단 푸터
  footer: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
  },
  prevBtn: {
    flex: 1, borderWidth: 1.5,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  prevBtnText: { fontSize: 16, fontWeight: "700" },
  nextBtn: {
    flex: 2,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { fontSize: 16, fontWeight: "700" },
});
