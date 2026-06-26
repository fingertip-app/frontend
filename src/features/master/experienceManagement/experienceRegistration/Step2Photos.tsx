import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { ExperiencePhoto } from "../types";
import { useTheme } from "@/theme/ThemeContext";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

const MAX_MAIN = 1;
const MAX_DETAIL = 10;

export function Step2Photos() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const currentStep = 2;

  // 대표 사진: 1장
  const [mainPhoto, setMainPhoto] = useState<ExperiencePhoto | null>(null);
  // 상세 사진: 최대 10장
  const [detailPhotos, setDetailPhotos] = useState<ExperiencePhoto[]>([]);

  const requestPhotoPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "체험 사진을 선택하려면 사진 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const toPhoto = (asset: ImagePicker.ImagePickerAsset): ExperiencePhoto => ({
    uri: asset.uri,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
  });

  const handleAddMain = async () => {
    if (!(await requestPhotoPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) setMainPhoto(toPhoto(result.assets[0]));
  };

  const handleRemoveMain = () => {
    Alert.alert("사진 삭제", "대표 사진을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => setMainPhoto(null) },
    ]);
  };

  const handleAddDetail = async () => {
    if (detailPhotos.length >= MAX_DETAIL) {
      Alert.alert("알림", `상세 사진은 최대 ${MAX_DETAIL}장까지 첨부할 수 있습니다.`);
      return;
    }
    if (!(await requestPhotoPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_DETAIL - detailPhotos.length,
      quality: 0.9,
    });
    if (!result.canceled) {
      setDetailPhotos((current) => [
        ...current,
        ...result.assets.map(toPhoto).slice(0, MAX_DETAIL - current.length),
      ]);
    }
  };

  const handleRemoveDetail = (idx: number) => {
    setDetailPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 상단 헤더 바 ── */}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>체험의 매력을{"\n"}사진으로 보여주세요</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            정갈하고 선명한 사진은 장인의 손길을 더욱 돋보이게 합니다.
          </Text>
        </View>

        {/* ── 대표 사진 ── */}
        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>대표 사진 (최대 1장)</Text>
            <Text style={[styles.badge, { color: colors.text }]}>필수 항목</Text>
          </View>

          {mainPhoto ? (
            <View style={[styles.mainPhotoBox, { backgroundColor: colors.border }]}>
              <Image source={{ uri: mainPhoto.uri }} style={styles.mainPhotoPlaceholder} />
              <View style={styles.mainPhotoOverlay}>
                <Text style={styles.mainPhotoLabel}>현재 대표 사진으로 설정됨</Text>
              </View>
              <TouchableOpacity style={styles.mainDeleteBtn} onPress={handleRemoveMain}>
                <Ionicons name="trash-outline" size={16} color={colors.card} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.mainPhotoEmpty, { backgroundColor: colors.card, borderColor: colors.textSecondary }]}
              activeOpacity={0.7}
              onPress={handleAddMain}
            >
              <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.photoAddText, { color: colors.textSecondary }]}>사진 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 상세 사진 ── */}
        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>상세 사진 (최대 {MAX_DETAIL}장)</Text>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {detailPhotos.length} / {MAX_DETAIL}
            </Text>
          </View>

          <View style={styles.detailGrid}>
            {/* 등록된 사진들 */}
            {detailPhotos.map((photo, i) => (
              <View key={`${photo.uri}-${i}`} style={[styles.detailCell, { backgroundColor: colors.border }]}>
                <Image source={{ uri: photo.uri }} style={styles.detailPlaceholder} />
                <TouchableOpacity
                  style={styles.detailRemoveBtn}
                  onPress={() => handleRemoveDetail(i)}
                  hitSlop={8}
                >
                  <Text style={styles.detailRemoveBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* 추가 버튼 */}
            {detailPhotos.length < MAX_DETAIL && (
              <TouchableOpacity
                style={[styles.detailCell, { backgroundColor: colors.card, borderColor: colors.textSecondary, borderWidth: 1.5, borderStyle: "dashed" }]}
                activeOpacity={0.7}
                onPress={handleAddDetail}
              >
                <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                <Text style={[styles.photoAddText, { color: colors.textSecondary }]}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 사진 등록 가이드 ── */}
        <View style={[styles.guideBox, { backgroundColor: colors.border }]}>
          <View style={styles.guideRow}>
            <Text style={[styles.guideDot, { color: colors.text }]}>ℹ</Text>
            <Text style={[styles.guideTitle, { color: colors.text }]}>사진 등록 가이드</Text>
          </View>
          {[
            "밝고 선명한 사진일수록 예약률이 2.5배 높습니다.",
            "장인의 작업 모습, 완성된 결과물, 공방 풍경을 골고루 담아보세요.",
            "텍스트나 로고가 포함된 사진은 승인이 거절될 수 있습니다.",
            "권장 사이즈: 1200 x 900px 이상 (4:3 비율)",
          ].map((line, i) => (
            <Text key={i} style={[styles.guideLine, { color: colors.textSecondary }]}>
              · {line}
            </Text>
          ))}
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
          style={[styles.nextBtn, { backgroundColor: colors.text }, !mainPhoto && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!mainPhoto}
          onPress={() =>
            navigation.navigate("Step3Schedule", { ...route.params, mainPhoto, detailPhotos })
          }
        >
          <Text style={[styles.nextBtnText, { color: colors.bg }]}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const DETAIL_CELL = 100;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // 헤더 바
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  stepWrapper: { flexDirection: "row", alignItems: "center" },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "700" },
  stepLabel: { fontSize: 10, marginTop: 2, textAlign: "center" },
  stepLine: { width: 20, height: 1.5, marginHorizontal: 4, marginBottom: 14 },

  // 섹션 헤더
  sectionHeader: { marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: "700", lineHeight: 30, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 28 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600" },
  badge: {
    marginLeft: "auto",
    fontSize: 11,
    backgroundColor: "#EDE8E3",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, fontWeight: "600",
  },
  countText: { marginLeft: "auto", fontSize: 12 },

  // 대표 사진
  mainPhotoBox: {
    width: "100%", height: 200,
    borderRadius: 12, overflow: "hidden",
    position: "relative",
  },
  mainPhotoPlaceholder: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  mainPhotoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 10, alignItems: "center",
  },
  mainPhotoLabel: { fontSize: 13, color: "#FFF", fontWeight: "500" },
  mainDeleteBtn: {
    position: "absolute", top: 10, right: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center",
  },
  mainPhotoEmpty: {
    width: "100%", height: 160,
    borderRadius: 12,
    borderWidth: 1.5, borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  photoAddText: { fontSize: 12, marginTop: 4 },

  // 상세 사진 그리드
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailCell: {
    width: DETAIL_CELL, height: DETAIL_CELL,
    borderRadius: 10, overflow: "hidden",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  detailPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  detailRemoveBtn: {
    position: "absolute", top: 5, right: 5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  detailRemoveBtnText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // 가이드 박스
  guideBox: {
    borderRadius: 12, padding: 16,
    marginBottom: 8,
  },
  guideRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 },
  guideDot: { fontSize: 14 },
  guideTitle: { fontSize: 13, fontWeight: "700" },
  guideLine: { fontSize: 12, lineHeight: 20, marginBottom: 2 },

  // 하단 푸터
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
  },
  prevBtn: {
    flex: 1,
    borderWidth: 1.5,
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
