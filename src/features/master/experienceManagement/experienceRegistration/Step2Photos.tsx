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

// ─── 팔레트 (Step1과 동일) ─────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#A89F96";
const BORDER = "#E8E3DC";
const PLACEHOLDER = "#C4BCB4";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

const MAX_MAIN = 1;
const MAX_DETAIL = 10;

export function Step2Photos() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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
    <SafeAreaView style={styles.safeArea}>
      {/* ── 상단 헤더 바 ── */}
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
          <Text style={styles.sectionTitle}>체험의 매력을{"\n"}사진으로 보여주세요</Text>
          <Text style={styles.sectionSubtitle}>
            정갈하고 선명한 사진은 장인의 손길을 더욱 돋보이게 합니다.
          </Text>
        </View>

        {/* ── 대표 사진 ── */}
        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>대표 사진 (최대 1장)</Text>
            <Text style={styles.badge}>필수 항목</Text>
          </View>

          {mainPhoto ? (
            <View style={styles.mainPhotoBox}>
              <Image source={{ uri: mainPhoto.uri }} style={styles.mainPhotoPlaceholder} />
              <View style={styles.mainPhotoOverlay}>
                <Text style={styles.mainPhotoLabel}>현재 대표 사진으로 설정됨</Text>
              </View>
              <TouchableOpacity style={styles.mainDeleteBtn} onPress={handleRemoveMain}>
                <Ionicons name="trash-outline" size={16} color={CARD} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.mainPhotoEmpty}
              activeOpacity={0.7}
              onPress={handleAddMain}
            >
              <Ionicons name="camera-outline" size={32} color={PLACEHOLDER} />
              <Text style={styles.photoAddText}>사진 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 상세 사진 ── */}
        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>상세 사진 (최대 {MAX_DETAIL}장)</Text>
            <Text style={styles.countText}>
              {detailPhotos.length} / {MAX_DETAIL}
            </Text>
          </View>

          <View style={styles.detailGrid}>
            {/* 등록된 사진들 */}
            {detailPhotos.map((photo, i) => (
              <View key={`${photo.uri}-${i}`} style={styles.detailCell}>
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
                style={[styles.detailCell, styles.detailAddCell]}
                activeOpacity={0.7}
                onPress={handleAddDetail}
              >
                <Ionicons name="camera-outline" size={24} color={PLACEHOLDER} />
                <Text style={styles.photoAddText}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 사진 등록 가이드 ── */}
        <View style={styles.guideBox}>
          <View style={styles.guideRow}>
            <Text style={styles.guideDot}>ℹ</Text>
            <Text style={styles.guideTitle}>사진 등록 가이드</Text>
          </View>
          {[
            "밝고 선명한 사진일수록 예약률이 2.5배 높습니다.",
            "장인의 작업 모습, 완성된 결과물, 공방 풍경을 골고루 담아보세요.",
            "텍스트나 로고가 포함된 사진은 승인이 거절될 수 있습니다.",
            "권장 사이즈: 1200 x 900px 이상 (4:3 비율)",
          ].map((line, i) => (
            <Text key={i} style={styles.guideLine}>
              · {line}
            </Text>
          ))}
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
          style={[styles.nextBtn, !mainPhoto && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!mainPhoto}
          onPress={() =>
            navigation.navigate("Step3Schedule", { ...route.params, mainPhoto, detailPhotos })
          }
        >
          <Text style={styles.nextBtnText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const DETAIL_CELL = 100;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

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
  closeBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  closeBtnText: { fontSize: 16, color: BRAND },
  headerTitle: { fontSize: 16, fontWeight: "600", color: BRAND },
  tempSaveText: { fontSize: 13, color: GRAY },

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
    backgroundColor: BORDER, justifyContent: "center", alignItems: "center",
  },
  activeStepCircle: { backgroundColor: BRAND },
  stepNum: { fontSize: 12, color: GRAY, fontWeight: "700" },
  activeStepNum: { color: "#FFF" },
  stepLabel: { fontSize: 10, color: GRAY, marginTop: 2, textAlign: "center" },
  activeStepLabel: { color: BRAND, fontWeight: "600" },
  stepLine: { width: 20, height: 1.5, backgroundColor: BORDER, marginHorizontal: 4, marginBottom: 14 },
  activeStepLine: { backgroundColor: BRAND },

  // 섹션 헤더
  sectionHeader: { marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: BRAND, lineHeight: 30, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, color: GRAY, lineHeight: 20 },

  // 공통 블록
  block: { marginBottom: 28 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND },
  badge: {
    marginLeft: "auto",
    fontSize: 11, color: BRAND,
    backgroundColor: "#EDE8E3",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, fontWeight: "600",
  },
  countText: { marginLeft: "auto", fontSize: 12, color: GRAY },

  // 대표 사진
  mainPhotoBox: {
    width: "100%", height: 200,
    borderRadius: 12, overflow: "hidden",
    backgroundColor: BORDER,
    position: "relative",
  },
  mainPhotoPlaceholder: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#E8E3DC",
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
    borderWidth: 1.5, borderColor: PLACEHOLDER, borderStyle: "dashed",
    backgroundColor: CARD,
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  photoAddText: { fontSize: 12, color: GRAY, marginTop: 4 },

  // 상세 사진 그리드
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailCell: {
    width: DETAIL_CELL, height: DETAIL_CELL,
    borderRadius: 10, overflow: "hidden",
    backgroundColor: "#E8E3DC",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  detailAddCell: {
    backgroundColor: CARD,
    borderWidth: 1.5, borderColor: PLACEHOLDER, borderStyle: "dashed",
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
    backgroundColor: "#EDE8E3",
    borderRadius: 12, padding: 16,
    marginBottom: 8,
  },
  guideRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 },
  guideDot: { fontSize: 14, color: BRAND },
  guideTitle: { fontSize: 13, fontWeight: "700", color: BRAND },
  guideLine: { fontSize: 12, color: GRAY, lineHeight: 20, marginBottom: 2 },

  // 하단 푸터
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  prevBtn: {
    flex: 1,
    borderWidth: 1.5, borderColor: BRAND,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  prevBtnText: { color: BRAND, fontSize: 16, fontWeight: "700" },
  nextBtn: {
    flex: 2,
    backgroundColor: BRAND,
    borderRadius: 50, paddingVertical: 17, alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
