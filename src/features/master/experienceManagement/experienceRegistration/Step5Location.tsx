import React, { useEffect, useState } from "react";
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
import { useTheme } from "@/theme/ThemeContext";
import { searchKakaoAddress, reverseGeocodeKakaoAddress, type KakaoAddressResult } from "@/lib/kakaoAddressSearch";
import { KakaoMapView } from "@/components/KakaoMapView";

const STEP_LABELS = ["기본 정보", "사진", "일정 등록", "가격/인원", "장소"];

export function Step5Location() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const params = (route.params ?? {}) as Partial<ExperienceRegistrationParams>;
  const currentStep = 5;

  const [addressSearchText, setAddressSearchText] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<KakaoAddressResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<KakaoAddressResult | null>(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 입력 중 카카오 주소검색 API를 디바운스해서 호출
  useEffect(() => {
    if (!addressSearchText.trim()) {
      setAddressSuggestions([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchKakaoAddress(addressSearchText)
        .then((results) => {
          if (!cancelled) setAddressSuggestions(results);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [addressSearchText]);

  const selectAddress = (address: KakaoAddressResult) => {
    setSelectedAddress(address);
    setAddressSearchText("");
    setAddressSuggestions([]);
  };

  const clearAddress = () => {
    setSelectedAddress(null);
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
      const label = await reverseGeocodeKakaoAddress(position.coords.latitude, position.coords.longitude);
      if (!label) {
        Alert.alert("알림", "현재 위치의 주소를 확인할 수 없어요. 검색으로 직접 선택해주세요.");
        return;
      }
      selectAddress({ label, lat: position.coords.latitude, lng: position.coords.longitude });
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
        !params.difficulty ||
        !params.languages?.length ||
        !params.mainPhoto ||
        !params.selectedDays ||
        !params.timeSlots ||
        params.price === undefined ||
        params.minGuests === undefined ||
        params.maxGuests === undefined
      ) {
        throw new Error("체험 등록 정보가 누락되었습니다. 첫 단계부터 다시 진행해주세요.");
      }
      if (!selectedAddress) {
        throw new Error("체험 장소를 검색해서 선택해주세요.");
      }
      await createRegisteredExperience(
        params as ExperienceRegistrationParams,
        addressDetail ? `${selectedAddress.label} ${addressDetail}` : selectedAddress.label,
        { lat: selectedAddress.lat, lng: selectedAddress.lng },
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 헤더 바 ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>장인 홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>체험 장소를 등록해 주세요</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            참가자들이 찾아오기 쉽도록 정확한 위치를 입력해 주세요.
          </Text>
        </View>

        {/* ── 주소 검색 ── */}
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>주소 검색</Text>
          <View style={[styles.searchInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="도로명, 건물명, 지번 등으로 검색"
              placeholderTextColor={colors.textSecondary}
              value={addressSearchText}
              onChangeText={setAddressSearchText}
            />
            <TouchableOpacity
              style={[styles.currentLocationChip, { borderColor: colors.border }]}
              onPress={handleUseCurrentLocation}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              <Ionicons name="locate-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 실시간 검색 결과 */}
          {addressSearchText.length > 0 && (
            <View style={[styles.searchResults, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {isSearching ? (
                <Text style={[styles.noResultText, { color: colors.textSecondary }]}>검색 중...</Text>
              ) : addressSuggestions.length > 0 ? (
                addressSuggestions.map((addr, i) => (
                  <TouchableOpacity
                    key={`${addr.label}-${i}`}
                    style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                    onPress={() => selectAddress(addr)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.searchResultText, { color: colors.text }]}>{addr.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noResultText, { color: colors.textSecondary }]}>검색 결과가 없습니다.</Text>
              )}
            </View>
          )}

          {/* 선택된 주소 */}
          {selectedAddress && (
            <View style={[styles.selectedRegionTag, { backgroundColor: colors.text }]}>
              <Text style={[styles.selectedRegionTagText, { color: colors.bg }]} numberOfLines={1}>
                {selectedAddress.label}
              </Text>
              <TouchableOpacity onPress={clearAddress}>
                <Ionicons name="close" size={14} color={colors.bg} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 상세 주소 ── */}
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>상세 주소</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="나머지 상세 주소 입력 (예: 북촌로 11길, 2층)"
            placeholderTextColor={colors.textSecondary}
            value={addressDetail}
            onChangeText={setAddressDetail}
          />
        </View>

        {/* ── 지도 영역 ── */}
        {selectedAddress && (
          <View style={[styles.mapBox, { borderColor: colors.border }]}>
            <KakaoMapView
              latitude={selectedAddress.lat}
              longitude={selectedAddress.lng}
              address={addressDetail ? `${selectedAddress.label} ${addressDetail}` : selectedAddress.label}
              height={200}
              markerTitle={selectedAddress.label}
            />
          </View>
        )}

        {/* ── 안내 박스 ── */}
        <View style={[styles.noticeBox, { backgroundColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text} style={{ marginTop: 1 }} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            등록된 주소는 체험 예약이 확정된 참가자들에게만 상세히 노출됩니다.
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
          style={[styles.nextBtn, { backgroundColor: colors.text }, (!selectedAddress || isSubmitting) && styles.nextBtnDisabled]}
          activeOpacity={0.8}
          disabled={!selectedAddress || isSubmitting}
          onPress={handleComplete}
        >
          <Text style={[styles.nextBtnText, { color: colors.bg }]}>{isSubmitting ? "등록 중..." : "등록 완료"}</Text>
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
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600" },
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
  block: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 10 },

  // 지역 검색
  searchInputBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1, paddingVertical: 13,
    fontSize: 14,
  },
  currentLocationChip: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center", alignItems: "center",
  },

  // 연관 검색어 / 결과
  searchResults: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  searchResultItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  searchResultText: { fontSize: 14 },
  noResultText: { padding: 16, fontSize: 14 },

  // 선택된 지역 태그
  selectedRegionTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 14,
    marginTop: 10,
  },
  selectedRegionTagText: { fontSize: 13, fontWeight: "600" },

  // 상세주소
  input: {
    borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 14,
  },

  // 지도 박스
  mapBox: {
    height: 200, borderRadius: 14, overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  // 안내 박스
  noticeBox: {
    flexDirection: "row", gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },

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
