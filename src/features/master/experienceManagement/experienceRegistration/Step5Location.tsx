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
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { createRegisteredExperience } from "../experienceManagementApi";
import type { ExperienceRegistrationParams } from "../types";

// ─── 팔레트 (Step1~4와 동일) ──────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#A89F96";
const BORDER = "#E8E3DC";
const PLACEHOLDER = "#C4BCB4";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

export function Step5Location() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params ?? {}) as Partial<ExperienceRegistrationParams>;
  const currentStep = 5;

  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [pinLabel, setPinLabel] = useState("주소를 입력하거나 현재 위치를 사용해주세요");

  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert("알림", "주소를 입력해주세요.");
      return;
    }
    try {
      const results = await Location.geocodeAsync(address.trim());
      if (!results.length) {
        Alert.alert("알림", "입력하신 주소를 찾을 수 없어요. 다시 확인해주세요.");
        return;
      }
      setPinLabel(address.trim());
    } catch {
      Alert.alert("알림", "주소 확인 중 오류가 발생했어요.");
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "현재 위치를 사용하려면 위치 권한이 필요합니다.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (!place) {
        Alert.alert("알림", "현재 위치의 주소를 확인할 수 없어요.");
        return;
      }
      const formatted = [place.region, place.city, place.district, place.street, place.name]
        .filter(Boolean)
        .join(" ");
      setAddress(formatted || "");
      setPinLabel(formatted || "현재 위치");
    } catch {
      Alert.alert("알림", "현재 위치를 가져오지 못했어요.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (
        !params.title ||
        !params.shortDesc ||
        !params.detail ||
        !params.category ||
        !params.mainPhoto ||
        !params.selectedDays ||
        !params.timeSlots ||
        params.price === undefined ||
        params.minGuests === undefined ||
        params.maxGuests === undefined
      ) {
        throw new Error("체험 등록 정보가 누락되었습니다. 첫 단계부터 다시 진행해주세요.");
      }
      await createRegisteredExperience(
        params as ExperienceRegistrationParams,
        addressDetail ? `${address} ${addressDetail}` : address,
      );
      Alert.alert("등록 완료", "체험 클래스가 성공적으로 등록되었습니다!", [
        {
          text: "확인",
          onPress: () => navigation.navigate("MasterExperience"),
        },
      ]);
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "체험 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 바 ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={BRAND} />
          <Text style={styles.backBtnText}>장인 홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={20} color={BRAND} />
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
          <Text style={styles.sectionTitle}>체험 장소를 등록해 주세요</Text>
          <Text style={styles.sectionSubtitle}>
            참가자들이 찾아오기 쉽도록 정확한 위치를 입력해 주세요.
          </Text>
        </View>

        {/* ── 주소 검색 ── */}
        <View style={styles.block}>
          <Text style={styles.label}>주소 검색</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInputBox}>
              <Ionicons name="search-outline" size={16} color={GRAY} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="서울시 종로구 북촌로 11길"
                placeholderTextColor={PLACEHOLDER}
                value={address}
                onChangeText={setAddress}
              />
            </View>
            <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 상세 주소 ── */}
        <View style={styles.block}>
          <Text style={styles.label}>상세 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="나머지 상세 주소 입력 (예: 2층, 201호)"
            placeholderTextColor={PLACEHOLDER}
            value={addressDetail}
            onChangeText={setAddressDetail}
          />
        </View>

        {/* ── 지도 영역 ── */}
        <View style={styles.mapBox}>
          {/* 지도 배경 (플레이스홀더) */}
          <View style={styles.mapBg}>
            {/* 지도 일러스트 느낌의 패턴 */}
            <View style={styles.mapPattern}>
              <View style={styles.mapRoad1} />
              <View style={styles.mapRoad2} />
              <View style={styles.mapBuilding1} />
              <View style={styles.mapBuilding2} />
              <View style={styles.mapBuilding3} />
            </View>

            {/* 핀 */}
            <View style={styles.pinWrapper}>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText} numberOfLines={1}>{pinLabel}</Text>
              </View>
              <View style={styles.pin}>
                <View style={styles.pinDot} />
              </View>
              <View style={styles.pinShadow} />
            </View>
          </View>

          {/* 현재 위치 버튼 */}
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleUseCurrentLocation}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            <Ionicons name="locate-outline" size={18} color={BRAND} />
          </TouchableOpacity>
        </View>

        {/* ── 안내 박스 ── */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={BRAND} style={{ marginTop: 1 }} />
          <Text style={styles.noticeText}>
            등록된 주소는 체험 예약이 확정된 참가자들에게만 상세히 노출됩니다.
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
          style={[styles.nextBtn, (!address || isSubmitting) && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!address || isSubmitting}
          onPress={handleComplete}
        >
          <Text style={styles.nextBtnText}>{isSubmitting ? "등록 중..." : "등록 완료"}</Text>
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
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600", color: BRAND },
  bellBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },

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
  block: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND, marginBottom: 10 },

  // 주소 검색
  searchRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  searchInputBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1, paddingVertical: 13,
    fontSize: 14, color: "#1C1107",
  },
  searchBtn: {
    backgroundColor: BRAND, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 13,
  },
  searchBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },

  // 상세주소
  input: {
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 14, color: "#1C1107",
  },

  // 지도 박스
  mapBox: {
    height: 200, borderRadius: 14, overflow: "hidden",
    marginBottom: 16, position: "relative",
    borderWidth: 1, borderColor: BORDER,
  },
  mapBg: {
    flex: 1, backgroundColor: "#E8E0D5",
    justifyContent: "center", alignItems: "center",
  },
  // 지도 패턴 (일러스트 느낌)
  mapPattern: { ...StyleSheet.absoluteFillObject },
  mapRoad1: {
    position: "absolute", top: "45%", left: 0, right: 0,
    height: 18, backgroundColor: "#D4C9BA",
  },
  mapRoad2: {
    position: "absolute", left: "45%", top: 0, bottom: 0,
    width: 14, backgroundColor: "#D4C9BA",
  },
  mapBuilding1: {
    position: "absolute", top: "15%", left: "10%",
    width: 60, height: 40, backgroundColor: "#C8BAA8",
    borderRadius: 4,
  },
  mapBuilding2: {
    position: "absolute", top: "20%", right: "12%",
    width: 50, height: 55, backgroundColor: "#BFB09E",
    borderRadius: 4,
  },
  mapBuilding3: {
    position: "absolute", bottom: "15%", left: "20%",
    width: 70, height: 35, backgroundColor: "#C8BAA8",
    borderRadius: 4,
  },
  // 핀
  pinWrapper: { alignItems: "center", zIndex: 10 },
  pinLabel: {
    backgroundColor: BRAND, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: 6,
  },
  pinLabelText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  pin: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: BRAND,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: CARD,
  },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: CARD },
  pinShadow: {
    width: 12, height: 5, borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.2)", marginTop: 2,
  },

  // 현재 위치 버튼
  locationBtn: {
    position: "absolute", bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4,
    elevation: 2,
  },

  // 안내 박스
  noticeBox: {
    flexDirection: "row", gap: 8,
    backgroundColor: "#EDE8E3", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 12, color: GRAY, lineHeight: 18 },

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
