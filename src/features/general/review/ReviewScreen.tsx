import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MainLayout } from "@/features/general/home/MainLayout";

const BRAND = "#3D1F0D";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const MAX_PHOTOS = 5;
const MAX_CHARS = 1000;

const RATING_LABELS: Record<number, string> = {
  0: "별점을 선택해주세요",
  1: "아쉬워요",
  2: "그저 그래요",
  3: "보통이에요",
  4: "좋았어요",
  5: "최고예요!",
};

export function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "Review">>();
  const { booking } = route.params;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState("");
  // 실제 앱에서는 ImagePicker를 사용. 여기서는 더미 URI 배열로 대체.
  const [photos, setPhotos] = useState<string[]>([]);

  const displayRating = hovered || rating;

  const handleSubmit = () => {
    alert("리뷰가 등록되었습니다!");
    navigation.goBack();
  };

  const canSubmit = rating > 0 && content.length >= 10;

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#1C1107" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>후기 작성하기</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── 체험 정보 카드 ── */}
          <View style={styles.expCard}>
            <Image
              source={{ uri: booking.imageUri }}
              style={styles.expThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.expLabel}>EXPERIENCE</Text>
              <Text style={styles.expTitle} numberOfLines={2}>
                {booking.title}
              </Text>
              <Text style={styles.expArtisan} numberOfLines={1}>
                {booking.artisan ?? "장인"}
              </Text>
            </View>
          </View>

          {/* ── 별점 선택 ── */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingQuestion}>경험은 어떠셨나요?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  onPressIn={() => setHovered(star)}
                  onPressOut={() => setHovered(0)}
                  activeOpacity={0.8}
                  hitSlop={6}
                >
                  <Ionicons
                    name={star <= displayRating ? "star" : "star-outline"}
                    size={42}
                    color={star <= displayRating ? "#C8824A" : "#C4BBB2"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>{RATING_LABELS[displayRating]}</Text>
          </View>

          {/* ── 사진 추가 ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>ADD PHOTOS</Text>
            <View style={styles.photoGrid}>
              {/* 첫 번째 셀: 추가 버튼 */}
              <TouchableOpacity
                style={[styles.photoCell, styles.photoCellAdd]}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: ImagePicker 연동
                }}
              >
                <Ionicons name="camera-outline" size={24} color={GRAY} />
                <Text style={styles.photoCount}>
                  {photos.length}/{MAX_PHOTOS}
                </Text>
              </TouchableOpacity>

              {/* 추가된 사진 셀들 */}
              {Array.from({ length: MAX_PHOTOS - 1 }).map((_, i) => {
                const uri = photos[i];
                return (
                  <View key={i} style={[styles.photoCell, styles.photoCellEmpty]}>
                    {uri ? (
                      <>
                        <Image
                          source={{ uri }}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.photoRemove}
                          onPress={() =>
                            setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                          }
                        >
                          <Ionicons name="close" size={12} color="#FFF" />
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── 후기 텍스트 ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>YOUR STORY</Text>
            <TextInput
              style={styles.textInput}
              placeholder="명인님과의 소중한 경험을 기록해주세요."
              placeholderTextColor="#B5ADA6"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={(t) => t.length <= MAX_CHARS && setContent(t)}
            />
            {/* 구분선 + 글자수 */}
            <View style={styles.inputFooter}>
              <View style={styles.inputDivider} />
              <Text style={styles.charCount}>
                {content.length} / {MAX_CHARS}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 하단 등록 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitBtnText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const PHOTO_CELL_SIZE = (340 - 32 - 40) / 4; // 4열 기준 (여백 고려)

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },

  container: { padding: 20, paddingBottom: 40 },

  // 체험 카드
  expCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  expThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: "#E8E2D9",
  },
  expLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1,
    marginBottom: 4,
  },
  expTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 4, lineHeight: 20 },
  expArtisan: { fontSize: 12, color: GRAY },

  // 별점
  ratingSection: { alignItems: "center", marginBottom: 32 },
  ratingQuestion: { fontSize: 17, fontWeight: "600", color: "#1C1107", marginBottom: 16 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  ratingLabel: { fontSize: 14, color: GRAY },

  // 섹션 공통
  sectionBlock: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // 사진 그리드
  photoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  photoCell: {
    width: PHOTO_CELL_SIZE,
    height: PHOTO_CELL_SIZE,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoCellAdd: {
    borderWidth: 1.5,
    borderColor: "#C4BBB2",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CARD,
    gap: 4,
  },
  photoCellEmpty: {
    backgroundColor: "#EDE8E2",
  },
  photoCount: { fontSize: 11, color: GRAY, fontWeight: "600" },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // 텍스트 입력
  textInput: {
    fontSize: 15,
    color: "#1C1107",
    lineHeight: 24,
    minHeight: 200,
  },
  inputFooter: { marginTop: 12 },
  inputDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: GRAY,
    textAlign: "right",
  },

  // 하단
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  submitBtn: {
    backgroundColor: BRAND,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: "#C4BDB5" },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});