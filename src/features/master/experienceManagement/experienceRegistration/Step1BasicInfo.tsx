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
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";

// ─── 스텝 레이블 ───────────────────────────────────────────────────────────────
const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

// 탐색 탭(SearchScreen)의 카테고리 칩과 동일한 분야 목록 — 필터링이 정상 동작하려면 이 중 하나로 등록되어야 함
const CATEGORY_OPTIONS = [
  "도자기", "한지공예", "목공", "염색", "전통음식",
  "모시짜기", "갓일", "자수", "매듭공예", "한복", "탈제작", "국악", "전통주",
];

export function Step1BasicInfo() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const currentStep = 1;

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const SHORT_MAX = 30;
  const DETAIL_MAX = 1000;
  const TAG_MAX = 10;

  const handleAddTag = () => {
    const value = tagInput.trim().replace(/^#/, "");
    if (!value) return;
    if (tags.length >= TAG_MAX) {
      Alert.alert("알림", `태그는 최대 ${TAG_MAX}개까지 추가할 수 있습니다.`);
      return;
    }
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags((current) => [...current, value]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((current) => current.filter((t) => t !== tag));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 상단 헤더 바 ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>체험 등록</Text>
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
                      { backgroundColor: colors.border },
                      isActive && { backgroundColor: colors.text },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        { color: isActive ? colors.bg : colors.textSecondary },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: colors.textSecondary },
                      isCurrent && { color: colors.text, fontWeight: "600" },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {step < 5 && (
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: colors.border },
                      currentStep > step && { backgroundColor: colors.text },
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
            <Text style={[styles.label, { color: colors.text }]}>체험 제목</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="예) 나만의 도자기 찻잔 만들기"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* ── 한 줄 소개 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>한 줄 소개</Text>
            <Text style={styles.required}>*</Text>
            <Text style={[styles.counter, { color: colors.textSecondary }]}>
              {shortDesc.length} / {SHORT_MAX}
            </Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="체험을 한 줄로 소개해 주세요."
            placeholderTextColor={colors.textSecondary}
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
            <Text style={[styles.label, { color: colors.text }]}>상세 설명</Text>
            <Text style={styles.required}>*</Text>
            <Text style={[styles.counter, { color: colors.textSecondary }]}>
              {detail.length} / {DETAIL_MAX}
            </Text>
          </View>
          <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* 간단한 텍스트 서식 툴바 (장식용 — 실제 포맷팅은 추후 연결 가능) */}
            <View style={[styles.toolbar, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
              <View style={styles.toolbarLeft}>
                {["B", "I", "≡"].map((icon) => (
                  <TouchableOpacity key={icon} style={styles.toolBtn}>
                    <Text style={[styles.toolBtnText, { color: colors.text }]}>{icon}</Text>
                  </TouchableOpacity>
                ))}
                <View style={[styles.toolDivider, { backgroundColor: colors.border }]} />
                {["≡L", "≡C", "≡R"].map((icon) => (
                  <TouchableOpacity key={icon} style={styles.toolBtn}>
                    <Text style={[styles.toolBtnText, { color: colors.text }]}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.toolbarRight}>
                <TouchableOpacity style={styles.toolBtn}>
                  <Text style={[styles.toolBtnText, { color: colors.text }]}>⊟</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn}>
                  <Text style={[styles.toolBtnText, { color: colors.text }]}>⊠</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 실제 텍스트 입력 */}
            <TextInput
              style={[styles.detailInput, { color: colors.text }]}
              placeholder="체험에 대해 자세히 설명해 주세요."
              placeholderTextColor={colors.textSecondary}
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

        {/* ── 체험 분야 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>체험 분야</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.tagList}>
            {CATEGORY_OPTIONS.map((option) => {
              const isSelected = category === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { backgroundColor: colors.text, borderColor: colors.text },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(option)}
                >
                  <Text
                    style={[styles.categoryChipText, { color: isSelected ? colors.bg : colors.text }]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 스타일 태그 ── */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>스타일 태그</Text>
            <Text style={[styles.counter, { color: colors.textSecondary }]}>
              {tags.length} / {TAG_MAX}
            </Text>
          </View>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="예) 전통섬유, 여름공예"
              placeholderTextColor={colors.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={[styles.tagAddBtn, { backgroundColor: colors.text }]} activeOpacity={0.8} onPress={handleAddTag}>
              <Text style={[styles.tagAddBtnText, { color: colors.bg }]}>추가</Text>
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagList}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={[styles.tagChipText, { color: colors.text }]}>#{tag}</Text>
                  <Text style={[styles.tagChipRemove, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── 하단 다음 버튼 ── */}
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: colors.text },
            !(title && shortDesc && detail && category) && styles.nextBtnDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!(title && shortDesc && detail && category)}
          onPress={() =>
            navigation.navigate("Step2Photos", { title, shortDesc, detail, category, tags })
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
  safeArea: {
    flex: 1,
  },

  // 헤더 바
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    justifyContent: "center",
    alignItems: "center",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  stepLine: {
    width: 20,
    height: 1.5,
    marginHorizontal: 4,
    marginBottom: 14, // 레이블 공간 만큼 올림
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
  },
  required: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C0392B",
    marginLeft: 2,
  },
  counter: {
    fontSize: 12,
    marginLeft: "auto",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },

  // 스타일 태그
  tagInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagAddBtn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  tagAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tagChipRemove: {
    fontSize: 11,
  },

  // 체험 분야 칩
  categoryChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // 상세 설명 박스
  detailBox: {
    borderWidth: 1,
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
    fontWeight: "600",
  },
  toolDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 6,
  },
  detailInput: {
    minHeight: 160,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    lineHeight: 22,
  },

  // 하단 푸터
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
  },
  nextBtn: {
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  nextBtnDisabled: {
    opacity: 0.45,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});