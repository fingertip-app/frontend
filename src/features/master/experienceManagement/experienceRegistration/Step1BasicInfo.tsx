import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#A89F96";
const BORDER = "#E8E3DC";
const PLACEHOLDER = "#C4BCB4";

// ─── 스텝 레이블 ───────────────────────────────────────────────────────────────
const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

export function Step1BasicInfo() {
  const navigation = useNavigation<any>();
  const currentStep = 1;

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [detail, setDetail] = useState("");

  const SHORT_MAX = 30;
  const DETAIL_MAX = 1000;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 상단 헤더 바 ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>체험 등록</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── 5단계 스텝 인디케이터 ── */}
        <View style={styles.stepContainer}>
          {STEP_LABELS.map((label, idx) => {
            const step = idx + 1;
            const isActive = currentStep >= step;
            const isCurrent = currentStep === step;
            return (
              <View key={step} style={styles.stepWrapper}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isActive && styles.activeStepCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        isActive && styles.activeStepNum,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.activeStepLabel,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {step < 5 && (
                  <View
                    style={[
                      styles.stepLine,
                      currentStep > step && styles.activeStepLine,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* ── 체험 제목 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>체험 제목</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="예) 나만의 도자기 찻잔 만들기"
            placeholderTextColor={PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* ── 한 줄 소개 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>한 줄 소개</Text>
            <Text style={styles.required}>*</Text>
            <Text style={styles.counter}>
              {shortDesc.length} / {SHORT_MAX}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="체험을 한 줄로 소개해 주세요."
            placeholderTextColor={PLACEHOLDER}
            value={shortDesc}
            onChangeText={(t) =>
              setShortDesc(t.length <= SHORT_MAX ? t : t.slice(0, SHORT_MAX))
            }
            maxLength={SHORT_MAX}
          />
        </View>

        {/* ── 상세 설명 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>상세 설명</Text>
            <Text style={styles.required}>*</Text>
            <Text style={styles.counter}>
              {detail.length} / {DETAIL_MAX}
            </Text>
          </View>
          <View style={styles.detailBox}>
            {/* 간단한 텍스트 서식 툴바 (장식용 — 실제 포맷팅은 추후 연결 가능) */}
            <View style={styles.toolbar}>
              <View style={styles.toolbarLeft}>
                {["B", "I", "≡"].map((icon) => (
                  <TouchableOpacity key={icon} style={styles.toolBtn}>
                    <Text style={styles.toolBtnText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.toolDivider} />
                {["≡L", "≡C", "≡R"].map((icon) => (
                  <TouchableOpacity key={icon} style={styles.toolBtn}>
                    <Text style={styles.toolBtnText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.toolbarRight}>
                <TouchableOpacity style={styles.toolBtn}>
                  <Text style={styles.toolBtnText}>⊟</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn}>
                  <Text style={styles.toolBtnText}>⊠</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 실제 텍스트 입력 */}
            <TextInput
              style={styles.detailInput}
              placeholder="체험에 대해 자세히 설명해 주세요."
              placeholderTextColor={PLACEHOLDER}
              value={detail}
              onChangeText={(t) =>
                setDetail(t.length <= DETAIL_MAX ? t : t.slice(0, DETAIL_MAX))
              }
              multiline
              textAlignVertical="top"
              maxLength={DETAIL_MAX}
            />
          </View>
        </View>
      </ScrollView>

      {/* ── 하단 다음 버튼 ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !(title && shortDesc && detail) && styles.nextBtnDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!(title && shortDesc && detail)}
          onPress={() => navigation.navigate("Step2Photos", { title, shortDesc, detail })}
        >
          <Text style={styles.nextBtnText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  // 헤더 바
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: BRAND,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND,
  },

  // 스크롤 컨텐츠
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // 스텝 인디케이터
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  activeStepCircle: {
    backgroundColor: BRAND,
  },
  stepNum: {
    fontSize: 12,
    color: GRAY,
    fontWeight: "700",
  },
  activeStepNum: {
    color: "#FFF",
  },
  stepLabel: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
    textAlign: "center",
  },
  activeStepLabel: {
    color: BRAND,
    fontWeight: "600",
  },
  stepLine: {
    width: 20,
    height: 1.5,
    backgroundColor: BORDER,
    marginHorizontal: 4,
    marginBottom: 14, // 레이블 공간 만큼 올림
  },
  activeStepLine: {
    backgroundColor: BRAND,
  },

  // 입력 그룹
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND,
  },
  required: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C0392B",
    marginLeft: 2,
  },
  counter: {
    fontSize: 12,
    color: GRAY,
    marginLeft: "auto",
  },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1C1107",
  },

  // 상세 설명 박스
  detailBox: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "#FAF8F5",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  toolBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  toolBtnText: {
    fontSize: 13,
    color: BRAND,
    fontWeight: "600",
  },
  toolDivider: {
    width: 1,
    height: 14,
    backgroundColor: BORDER,
    marginHorizontal: 6,
  },
  detailInput: {
    minHeight: 160,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1C1107",
    lineHeight: 22,
  },

  // 하단 푸터
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  nextBtn: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  nextBtnDisabled: {
    opacity: 0.45,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});