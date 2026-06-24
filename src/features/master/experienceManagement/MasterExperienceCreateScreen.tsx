import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyArtisan } from "@/features/artisans/api/artisanApi";
import {
  createExperience,
  CreateExperienceRequest,
  getExperience,
  updateExperience,
} from "@/features/experiences/api/experiencesApi";
import {
  buildRecurringSchedules,
  formatLocalDate,
  parseLocalDate,
  parseTimeLabel,
} from "@/features/experiences/utils/scheduleBuilder";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

export function MasterExperienceCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const experienceId = route.params?.experienceId as number | undefined;
  const isEditing = experienceId !== undefined;
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 1);
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 30);
  const [operationStartDate, setOperationStartDate] = useState(formatLocalDate(defaultStartDate));
  const [operationEndDate, setOperationEndDate] = useState(formatLocalDate(defaultEndDate));
  const [selectedDays, setSelectedDays] = useState<string[]>(["월", "화", "수", "목", "금"]);
  const [scheduleTimes, setScheduleTimes] = useState("10:00, 14:00, 16:00");
  const [availableSlots, setAvailableSlots] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [culturalStory, setCulturalStory] = useState("");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [locationAddress, setLocationAddress] = useState<string | undefined>();
  const [locationLat, setLocationLat] = useState<number | undefined>();
  const [locationLng, setLocationLng] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [hasReservedSchedules, setHasReservedSchedules] = useState(false);

  const CATEGORIES = ["도예", "목공", "한지", "염색", "전통음식", "기타"];
  const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
  const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    if (!experienceId) return;

    const loadExperience = async () => {
      setIsLoading(true);
      try {
        const experience = await getExperience(experienceId);
        setTitle(experience.title ?? "");
        setDescription(experience.description ?? "");
        setCategory(experience.category ?? "");
        setPrice(String(experience.price ?? ""));
        setAvailableSlots(String(experience.maxParticipants ?? ""));
        setDurationMinutes(String(experience.durationMinutes ?? ""));
        setCulturalStory(experience.culturalStory ?? "");
        setSupportedLanguages(experience.supportedLanguages ?? []);
        setLocationAddress(experience.locationAddress);
        setLocationLat(experience.locationLat);
        setLocationLng(experience.locationLng);
        setTags(experience.tags ?? []);
        setHasReservedSchedules(
          (experience.schedules ?? []).some((schedule) => (schedule.bookedSlots ?? 0) > 0),
        );
        setMainImage(
          experience.images?.[0]?.imageUrl ??
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
        );

        const schedules = [...(experience.schedules ?? [])].sort((a, b) =>
          a.scheduledAt.localeCompare(b.scheduledAt),
        );
        if (schedules.length > 0) {
          const firstDate = new Date(schedules[0].scheduledAt);
          const lastDate = new Date(schedules[schedules.length - 1].scheduledAt);
          setOperationStartDate(formatLocalDate(firstDate));
          setOperationEndDate(formatLocalDate(lastDate));
          setSelectedDays(
            Array.from(
              new Set(schedules.map((schedule) => WEEKDAY_LABELS[new Date(schedule.scheduledAt).getDay()])),
            ),
          );
          setScheduleTimes(
            Array.from(
              new Set(
                schedules.map((schedule) => {
                  const date = new Date(schedule.scheduledAt);
                  return `${String(date.getHours()).padStart(2, "0")}:${String(
                    date.getMinutes(),
                  ).padStart(2, "0")}`;
                }),
              ),
            ).join(", "),
          );
        }
      } catch (error) {
        Alert.alert(
          "오류",
          error instanceof Error ? error.message : "체험 정보를 불러오지 못했습니다.",
        );
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [experienceId, navigation]);

  const handleAddImage = () => {
    // TODO: 추후 expo-image-picker 등을 활용해 실제 기기 갤러리와 연동하세요.
    setMainImage("https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80");
  };

  const handleSubmit = async () => {
    if (!mainImage) {
      Alert.alert("알림", "대표 이미지를 등록해주세요.");
      return;
    }
    if (!category) {
      Alert.alert("알림", "카테고리를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("알림", "체험명을 입력해주세요.");
      return;
    }
    const parsedPrice = Number(price);
    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("알림", "가격을 올바르게 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("알림", "상세 설명을 입력해주세요.");
      return;
    }
    const startDate = parseLocalDate(operationStartDate);
    const endDate = parseLocalDate(operationEndDate);
    if (!startDate || !endDate || endDate < startDate) {
      Alert.alert("알림", "운영 시작일과 종료일을 YYYY-MM-DD 형식으로 확인해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("알림", "운영 요일을 하나 이상 선택해주세요.");
      return;
    }
    const parsedTimes = scheduleTimes
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean);
    if (parsedTimes.length === 0 || parsedTimes.some((time) => !parseTimeLabel(time))) {
      Alert.alert("알림", "시간대를 10:00, 14:00처럼 쉼표로 구분해 입력해주세요.");
      return;
    }
    const parsedSlots = Number(availableSlots);
    if (!availableSlots.trim() || Number.isNaN(parsedSlots) || parsedSlots <= 0) {
      Alert.alert("알림", "모집 인원을 올바르게 입력해주세요.");
      return;
    }
    const parsedDuration = Number(durationMinutes);
    if (!durationMinutes.trim() || Number.isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert("알림", "체험 소요 시간(분)을 올바르게 입력해주세요.");
      return;
    }
    const schedules = buildRecurringSchedules(
      operationStartDate,
      operationEndDate,
      selectedDays,
      parsedTimes.map((time) => ({ startTime: time, endTime: time })),
      parsedSlots,
    );
    if (schedules.length === 0) {
      Alert.alert("알림", "선택한 조건으로 생성되는 일정이 없습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateExperienceRequest = {
        title: title.trim(),
        description: description.trim(),
        culturalStory,
        category,
        price: parsedPrice,
        maxParticipants: parsedSlots,
        difficulty: "BEGINNER",
        imageUrl: mainImage,
        durationMinutes: parsedDuration,
        supportedLanguages,
        locationAddress,
        locationLat,
        locationLng,
        tags,
        schedules: hasReservedSchedules ? undefined : schedules,
      };
      if (isEditing && experienceId) {
        await updateExperience(experienceId, request);
      } else {
        const artisan = await getMyArtisan();
        await createExperience(artisan.id, request);
      }
      Alert.alert(isEditing ? "수정 완료" : "등록 완료", `체험이 성공적으로 ${isEditing ? "수정" : "등록"}되었습니다!`, [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "오류",
        e instanceof Error ? e.message : `체험 ${isEditing ? "수정" : "등록"}에 실패했습니다.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "체험 수정" : "새 체험 등록"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 대표 이미지 업로드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>대표 이미지</Text>
          <TouchableOpacity
            style={[styles.imageUploadBox, !!mainImage && styles.imageUploadBoxDone]}
            onPress={handleAddImage}
            activeOpacity={0.8}
          >
            {mainImage ? (
              <>
                <Image source={{ uri: mainImage }} style={styles.uploadedImage} />
                <View style={styles.changeImageOverlay}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                  <Text style={styles.changeImageText}>사진 변경</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="image-outline" size={28} color={GRAY} />
                </View>
                <Text style={styles.uploadText}>터치하여 사진 업로드</Text>
                <Text style={styles.uploadSubText}>권장 크기: 1200 x 900 (4:3 비율)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 카테고리 선택 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>카테고리</Text>
          <TouchableOpacity
            style={styles.dropdownHeader}
            activeOpacity={0.8}
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <Text style={[styles.dropdownHeaderText, !category && { color: GRAY }]}>
              {category || "카테고리를 선택해주세요"}
            </Text>
            <Ionicons name={isCategoryOpen ? "chevron-up" : "chevron-down"} size={20} color={GRAY} />
          </TouchableOpacity>

          {isCategoryOpen && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.dropdownItem, idx === CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setCategory(cat);
                    setIsCategoryOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, category === cat && { color: BRAND, fontWeight: "700" }]}>
                    {cat}
                  </Text>
                  {category === cat && <Ionicons name="checkmark" size={18} color={BRAND} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 체험명 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>체험명</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 이천 도자기 물레 체험"
            placeholderTextColor={GRAY}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 가격 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>가격 (1인 기준)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 35000"
            placeholderTextColor={GRAY}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* 상세 설명 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>상세 설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="체험에 대한 상세한 설명을 적어주세요."
            placeholderTextColor={GRAY}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* 체험 일정 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>운영 시작일</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (예: 2026-07-01)"
            placeholderTextColor={GRAY}
            value={operationStartDate}
            onChangeText={setOperationStartDate}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>운영 종료일</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (예: 2026-07-31)"
            placeholderTextColor={GRAY}
            value={operationEndDate}
            onChangeText={setOperationEndDate}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>운영 요일</Text>
          <View style={styles.dayGrid}>
            {DAYS.map((day) => {
              const selected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, selected && styles.dayBtnSelected]}
                  onPress={() =>
                    setSelectedDays((current) =>
                      current.includes(day)
                        ? current.filter((value) => value !== day)
                        : [...current, day],
                    )
                  }
                >
                  <Text style={[styles.dayBtnText, selected && styles.dayBtnTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>운영 시간대</Text>
          <TextInput
            style={styles.input}
            placeholder="10:00, 14:00, 16:00"
            placeholderTextColor={GRAY}
            value={scheduleTimes}
            onChangeText={setScheduleTimes}
          />
          <Text style={styles.helperText}>여러 시간은 쉼표로 구분해주세요.</Text>
          {hasReservedSchedules && (
            <Text style={styles.scheduleNotice}>
              예약이 연결된 체험이라 기존 일정은 유지되고 기본 정보만 수정됩니다.
            </Text>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>모집 인원</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 6"
            placeholderTextColor={GRAY}
            keyboardType="numeric"
            value={availableSlots}
            onChangeText={setAvailableSlots}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>소요 시간 (분)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 90"
            placeholderTextColor={GRAY}
            keyboardType="numeric"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
          />
        </View>
      </ScrollView>
      )}

      {/* ── 하단 등록 버튼 ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? (isEditing ? "수정 중..." : "등록 중...") : (isEditing ? "수정하기" : "등록하기")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 17, fontWeight: "700", color: BRAND },
  
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND, marginBottom: 8 },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1C1107" },
  textArea: { height: 120, paddingTop: 12 },
  helperText: { marginTop: 6, fontSize: 12, color: GRAY },
  scheduleNotice: { marginTop: 8, fontSize: 12, color: "#B45309", lineHeight: 18 },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  dayBtnSelected: { backgroundColor: BRAND, borderColor: BRAND },
  dayBtnText: { color: GRAY, fontWeight: "600" },
  dayBtnTextSelected: { color: "#FFF" },
  
  dropdownHeader: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownHeaderText: { fontSize: 15, color: "#1C1107" },
  dropdownList: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, marginTop: 8, overflow: "hidden" },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownItemText: { fontSize: 15, color: "#1C1107" },

  // 이미지 업로드
  imageUploadBox: { backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER, borderStyle: "dashed", borderRadius: 12, height: 180, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  imageUploadBoxDone: { borderStyle: "solid", borderWidth: 1 },
  uploadIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FAF9F6", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  uploadText: { fontSize: 14, fontWeight: "700", color: BRAND, marginBottom: 6 },
  uploadSubText: { fontSize: 12, color: GRAY },
  uploadedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  changeImageOverlay: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  changeImageText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  submitBtn: { backgroundColor: BRAND, borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
