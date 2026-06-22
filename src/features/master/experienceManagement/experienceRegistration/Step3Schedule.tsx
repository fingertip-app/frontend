import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ─── 팔레트 (Step1/2와 동일) ──────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#A89F96";
const BORDER = "#E8E3DC";
const PLACEHOLDER = "#C4BCB4";

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
  const currentStep = 3;

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 바 ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>체험 등록</Text>
        <TouchableOpacity>
          <Text style={styles.tempSaveText}>임시 저장</Text>
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
                  <View style={[styles.stepCircle, isActive && styles.activeStepCircle]}>
                    <Text style={[styles.stepNum, isActive && styles.activeStepNum]}>
                      {step}
                    </Text>
                  </View>
                  <Text style={[styles.stepLabel, isCurrent && styles.activeStepLabel]}>
                    {label}
                  </Text>
                </View>
                {step < 5 && (
                  <View style={[styles.stepLine, currentStep > step && styles.activeStepLine]} />
                )}
              </View>
            );
          })}
        </View>

        {/* ── 섹션 헤더 ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>체험 일정을 설정해주세요</Text>
          <Text style={styles.sectionSubtitle}>
            장인님의 소중한 시간이 헛되지 않도록,{"\n"}
            가능한 요일과 시간대를 명확히 설정해주세요.
          </Text>
        </View>

        {/* ── 운영 요일 선택 ── */}
        <View style={styles.block}>
          <View style={styles.blockTitleRow}>
            <Ionicons name="calendar-outline" size={15} color={BRAND} />
            <Text style={styles.blockTitle}>운영 요일 선택 (중복 선택 가능)</Text>
          </View>

          <View style={styles.dayGrid}>
            {DAYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, active && styles.dayBtnActive]}
                  activeOpacity={0.75}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayBtnText, active && styles.dayBtnTextActive]}>
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
            <Ionicons name="time-outline" size={15} color={BRAND} />
            <Text style={styles.blockTitle}>운영 시간대 (타임)</Text>
            <TouchableOpacity style={styles.addSlotBtn} onPress={handleAddSlot}>
              <Ionicons name="add" size={14} color={BRAND} />
              <Text style={styles.addSlotBtnText}>타임 추가</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.slotList}>
            {timeSlots.map((slot, idx) => (
              <View key={slot.id} style={styles.slotCard}>
                {/* 카드 헤더 */}
                <View style={styles.slotCardHeader}>
                  <Text style={styles.slotCardTitle}>{idx + 1}타임</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSlot(slot.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={17} color={GRAY} />
                  </TouchableOpacity>
                </View>

                {/* 시간 입력 */}
                <View style={styles.slotTimeRow}>
                  <View style={styles.slotTimeCol}>
                    <Text style={styles.slotTimeLabel}>시작 시간</Text>
                    <TextInput
                      style={styles.slotTimeInput}
                      value={slot.startTime}
                      onChangeText={(v) => handleUpdateSlot(slot.id, "startTime", v)}
                      placeholder="00:00 AM"
                      placeholderTextColor={PLACEHOLDER}
                    />
                  </View>
                  <View style={styles.slotTimeDivider} />
                  <View style={styles.slotTimeCol}>
                    <Text style={styles.slotTimeLabel}>종료 시간</Text>
                    <TextInput
                      style={styles.slotTimeInput}
                      value={slot.endTime}
                      onChangeText={(v) => handleUpdateSlot(slot.id, "endTime", v)}
                      placeholder="00:00 PM"
                      placeholderTextColor={PLACEHOLDER}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── 일정 설정 팁 ── */}
        <View style={styles.tipBox}>
          <View style={styles.tipTitleRow}>
            <Ionicons name="location-outline" size={14} color={BRAND} />
            <Text style={styles.tipTitle}>일정 설정 팁</Text>
          </View>
          <Text style={styles.tipText}>
            평균적으로 전통 체험은 2시간 내외가 가장 선호됩니다. 타임 사이의 30분~1시간 정도의 정비 시간을 두시는 것을 권장합니다.
          </Text>
        </View>
      </ScrollView>

      {/* ── 하단 버튼 ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.prevBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.prevBtnText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, timeSlots.length === 0 && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={timeSlots.length === 0}
          onPress={() => navigation.navigate("Step4Pricing", { ...route.params, selectedDays, timeSlots })}
        >
          <Text style={styles.nextBtnText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  // 헤더 바
  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  closeBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 16, color: BRAND },
  headerTitle: { fontSize: 16, fontWeight: "600", color: BRAND },
  tempSaveText: { fontSize: 13, color: GRAY },

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
    backgroundColor: BORDER, justifyContent: "center", alignItems: "center",
  },
  activeStepCircle: { backgroundColor: BRAND },
  stepNum: { fontSize: 12, color: GRAY, fontWeight: "700" },
  activeStepNum: { color: "#FFF" },
  stepLabel: { fontSize: 10, color: GRAY, marginTop: 2, textAlign: "center" },
  activeStepLabel: { color: BRAND, fontWeight: "600" },
  stepLine: {
    width: 20, height: 1.5,
    backgroundColor: BORDER, marginHorizontal: 4, marginBottom: 14,
  },
  activeStepLine: { backgroundColor: BRAND },

  // 섹션 헤더
  sectionHeader: { marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: BRAND, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, color: GRAY, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 28 },
  blockTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  blockTitle: { fontSize: 14, fontWeight: "600", color: BRAND, flex: 1 },

  // 요일 버튼
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dayBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    justifyContent: "center", alignItems: "center",
  },
  dayBtnActive: { backgroundColor: BRAND, borderColor: BRAND },
  dayBtnText: { fontSize: 14, fontWeight: "600", color: GRAY },
  dayBtnTextActive: { color: "#FFF" },

  // 타임 추가 버튼
  addSlotBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    backgroundColor: CARD,
  },
  addSlotBtnText: { fontSize: 12, fontWeight: "600", color: BRAND },

  // 타임 슬롯 카드
  slotList: { gap: 12 },
  slotCard: {
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  slotCardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14,
  },
  slotCardTitle: { fontSize: 14, fontWeight: "700", color: BRAND },
  slotTimeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  slotTimeCol: { flex: 1 },
  slotTimeDivider: { width: 1, height: 36, backgroundColor: BORDER },
  slotTimeLabel: { fontSize: 11, color: GRAY, marginBottom: 6 },
  slotTimeInput: {
    backgroundColor: BG, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, fontWeight: "600", color: BRAND,
  },

  // 팁 박스
  tipBox: {
    backgroundColor: "#EDE8E3", borderRadius: 12,
    padding: 16, marginBottom: 8,
  },
  tipTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  tipTitle: { fontSize: 13, fontWeight: "700", color: BRAND },
  tipText: { fontSize: 12, color: GRAY, lineHeight: 20 },

  // 하단 푸터
  footer: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER,
  },
  prevBtn: {
    flex: 1, borderWidth: 1.5, borderColor: BRAND,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  prevBtnText: { color: BRAND, fontSize: 16, fontWeight: "700" },
  nextBtn: {
    flex: 2, backgroundColor: BRAND,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});