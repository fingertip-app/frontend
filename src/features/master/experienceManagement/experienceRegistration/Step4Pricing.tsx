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

// ─── 팔레트 (Step1/2/3과 동일) ────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#A89F96";
const BORDER = "#E8E3DC";
const PLACEHOLDER = "#C4BCB4";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

export function Step4Pricing() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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
          <Text style={styles.sectionTitle}>체험의 가치를{"\n"}설정해주세요</Text>
          <Text style={styles.sectionSubtitle}>
            정확한 가격과 인원 설정은 원활한 체험 운영의 시작입니다.
          </Text>
        </View>

        {/* ── 1인당 체험 금액 ── */}
        <View style={styles.block}>
          <Text style={styles.label}>1인당 체험 금액</Text>
          <View style={styles.priceInputBox}>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              placeholderTextColor={PLACEHOLDER}
            />
            <Text style={styles.priceUnit}>원</Text>
          </View>
          <Text style={styles.priceHint}>부가세 포함 가격을 입력해주세요.</Text>
        </View>

        {/* ── 예약 인원 범위 ── */}
        <View style={styles.block}>
          <Text style={styles.label}>예약 인원 범위</Text>

          <View style={styles.guestCard}>
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestSubLabel}>최소 인원</Text>
                <Text style={styles.guestValue}>{minGuests}명</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, minGuests <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => adjustGuests("min", "down")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustGuests("min", "up")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.guestDivider} />

            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestSubLabel}>최대 인원</Text>
                <Text style={styles.guestValue}>{maxGuests}명</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, maxGuests <= minGuests && styles.stepperBtnDisabled]}
                  onPress={() => adjustGuests("max", "down")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustGuests("max", "up")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── 단체 예약 활성화 ── */}
        <View style={styles.groupCard}>
          <View style={styles.groupCardLeft}>
            <Ionicons name="people-outline" size={18} color={BRAND} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.groupCardTitle}>단체 예약 활성화</Text>
              <Text style={styles.groupCardDesc}>
                10인 이상의 단체 고객 예약을 허용합니다.
              </Text>
            </View>
          </View>
          <Switch
            value={groupEnabled}
            onValueChange={setGroupEnabled}
            trackColor={{ false: BORDER, true: BRAND }}
            thumbColor={CARD}
            ios_backgroundColor={BORDER}
          />
        </View>
      </ScrollView>

      {/* ── 하단 버튼 ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.prevBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.prevBtnText}>이전 단계로</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !price && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!price}
          onPress={() =>
            navigation.navigate("Step5Location", { ...route.params, price, minGuests, maxGuests })
          }
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
  sectionTitle: { fontSize: 22, fontWeight: "700", color: BRAND, lineHeight: 30, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, color: GRAY, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND, marginBottom: 10 },

  // 가격 입력
  priceInputBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 4,
  },
  priceInput: {
    flex: 1, fontSize: 28, fontWeight: "700",
    color: BRAND, paddingVertical: 10,
  },
  priceUnit: { fontSize: 15, fontWeight: "600", color: GRAY, marginLeft: 6 },
  priceHint: { fontSize: 12, color: PLACEHOLDER, marginTop: 6 },

  // 인원 스텝퍼 카드
  guestCard: {
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    overflow: "hidden",
  },
  guestRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 18,
  },
  guestDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 20 },
  guestSubLabel: { fontSize: 12, color: GRAY, marginBottom: 4 },
  guestValue: { fontSize: 20, fontWeight: "700", color: BRAND },
  stepper: { flexDirection: "row", gap: 10 },
  stepperBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: BORDER,
    justifyContent: "center", alignItems: "center",
    backgroundColor: BG,
  },
  stepperBtnDisabled: { opacity: 0.35 },
  stepperBtnText: { fontSize: 20, color: BRAND, lineHeight: 22, fontWeight: "400" },

  // 단체 예약 카드
  groupCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 16,
    gap: 12,
  },
  groupCardLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  groupCardTitle: { fontSize: 14, fontWeight: "600", color: BRAND, marginBottom: 3 },
  groupCardDesc: { fontSize: 12, color: GRAY, lineHeight: 18 },

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
  prevBtnText: { color: BRAND, fontSize: 14, fontWeight: "700" },
  nextBtn: {
    flex: 2, backgroundColor: BRAND,
    borderRadius: 50, paddingVertical: 17,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});