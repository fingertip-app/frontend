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
  Switch,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

export function Step4Pricing() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const currentStep = 4;

  const [price, setPrice] = useState("0");
  const [minGuests, setMinGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(4);
  const [groupEnabled, setGroupEnabled] = useState(false);

  const adjustGuests = (
    type: "min" | "max",
    direction: "up" | "down"
  ) => {
    if (type === "min") {
      setMinGuests((prev) => {
        const next = direction === "up" ? prev + 1 : prev - 1;
        if (next < 1) return 1;
        if (next > maxGuests) return maxGuests;
        return next;
      });
    } else {
      setMaxGuests((prev) => {
        const next = direction === "up" ? prev + 1 : prev - 1;
        if (next < minGuests) return minGuests;
        return next;
      });
    }
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>체험의 가치를{"\n"}설정해주세요</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            정확한 가격과 인원 설정은 원활한 체험 운영의 시작입니다.
          </Text>
        </View>

        {/* ── 1인당 체험 금액 ── */}
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>1인당 체험 금액</Text>
          <View style={[styles.priceInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.priceInput, { color: colors.text }]}
              value={price}
              onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>원</Text>
          </View>
          <Text style={[styles.priceHint, { color: colors.textSecondary }]}>부가세 포함 가격을 입력해주세요.</Text>
        </View>

        {/* ── 예약 인원 범위 ── */}
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>예약 인원 범위</Text>

          <View style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.guestRow}>
              <View>
                <Text style={[styles.guestSubLabel, { color: colors.textSecondary }]}>최소 인원</Text>
                <Text style={[styles.guestValue, { color: colors.text }]}>{minGuests}명</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg, borderColor: colors.border }, minGuests <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => adjustGuests("min", "down")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => adjustGuests("min", "up")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.guestDivider, { backgroundColor: colors.border }]} />

            <View style={styles.guestRow}>
              <View>
                <Text style={[styles.guestSubLabel, { color: colors.textSecondary }]}>최대 인원</Text>
                <Text style={[styles.guestValue, { color: colors.text }]}>{maxGuests}명</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg, borderColor: colors.border }, maxGuests <= minGuests && styles.stepperBtnDisabled]}
                  onPress={() => adjustGuests("max", "down")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => adjustGuests("max", "up")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── 단체 예약 활성화 ── */}
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.groupCardLeft}>
            <Ionicons name="people-outline" size={18} color={colors.text} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.groupCardTitle, { color: colors.text }]}>단체 예약 활성화</Text>
              <Text style={[styles.groupCardDesc, { color: colors.textSecondary }]}>
                10인 이상의 단체 고객 예약을 허용합니다.
              </Text>
            </View>
          </View>
          <Switch
            value={groupEnabled}
            onValueChange={setGroupEnabled}
            trackColor={{ false: colors.border, true: colors.text }}
            thumbColor={colors.card}
            ios_backgroundColor={colors.border}
          />
        </View>
      </ScrollView>

      {/* ── 하단 버튼 ── */}
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.prevBtn, { borderColor: colors.text }]}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.prevBtnText, { color: colors.text }]}>이전 단계로</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.text }, !price && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!price}
          onPress={() =>
            navigation.navigate("Step5Location", { ...route.params, price, minGuests, maxGuests })
          }
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
  sectionTitle: { fontSize: 22, fontWeight: "700", lineHeight: 30, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 10 },

  // 가격 입력
  priceInputBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 4,
  },
  priceInput: {
    flex: 1, fontSize: 28, fontWeight: "700",
    paddingVertical: 10,
  },
  priceUnit: { fontSize: 15, fontWeight: "600", marginLeft: 6 },
  priceHint: { fontSize: 12, marginTop: 6 },

  // 인원 스텝퍼 카드
  guestCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  guestRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 18,
  },
  guestDivider: { height: 1, marginHorizontal: 20 },
  guestSubLabel: { fontSize: 12, marginBottom: 4 },
  guestValue: { fontSize: 20, fontWeight: "700" },
  stepper: { flexDirection: "row", gap: 10 },
  stepperBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  stepperBtnDisabled: { opacity: 0.35 },
  stepperBtnText: { fontSize: 20, lineHeight: 22, fontWeight: "400" },

  // 단체 예약 카드
  groupCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 16,
    gap: 12,
  },
  groupCardLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  groupCardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 3 },
  groupCardDesc: { fontSize: 12, lineHeight: 18 },

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
  prevBtnText: { fontSize: 14, fontWeight: "700" },
  nextBtn: {
    flex: 2,
    borderRadius: 50, paddingVertical: 17,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { fontSize: 14, fontWeight: "700" },
});