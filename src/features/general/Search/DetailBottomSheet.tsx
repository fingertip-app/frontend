import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Experience } from "./SearchScreen";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getExperienceReviews } from "@/features/reviews/api/reviewsApi";
import { getArtisan } from "@/features/artisans/api/artisanApi";
import { addToWishlist, checkWishlist, removeFromWishlist } from "@/features/wishlists/api/wishlistsApi";
import { formatScheduleDate } from "@/lib/scheduling";
import type { Artisan, Experience as BackendExperience, Review } from "@/types/api";
import { useTheme } from "@/theme/ThemeContext";
import { KakaoMapView } from "@/components/KakaoMapView";

type Props = {
  exp: Experience;
  onClose: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return "시간 정보 없음";
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

function formatDifficulty(difficulty?: string): string {
  if (!difficulty) return "난이도 정보 없음";
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

function formatLanguages(languages?: string[]): string {
  if (!languages || !languages.length) return "언어 정보 없음";
  return languages.join(", ");
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        gap: 6,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

export function DetailBottomSheet({ exp, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fullExperience, setFullExperience] = useState<BackendExperience | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [isLoadingExperience, setIsLoadingExperience] = useState(true);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isWished, setIsWished] = useState(false);
  const [isWishLoading, setIsWishLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const requestIdRef = useRef(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const galleryImages = fullExperience?.images?.length
    ? [...fullExperience.images].sort((a, b) => a.displayOrder - b.displayOrder).map((img) => img.imageUrl)
    : [exp.imageUri];

  const handleImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const loadExperience = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const experienceId = Number(exp.id);

    if (!Number.isFinite(experienceId)) {
      setFullExperience(null);
      setExperienceError("체험 정보를 불러올 수 없습니다.");
      setIsLoadingExperience(false);
      return;
    }

    setIsLoadingExperience(true);
    setExperienceError(null);

    try {
      const experience = await getExperience(experienceId);
      if (requestIdRef.current === requestId) {
        setFullExperience(experience);
      }
    } catch {
      if (requestIdRef.current === requestId) {
        setFullExperience(null);
        setExperienceError("예약 가능한 일정을 불러오지 못했습니다.");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoadingExperience(false);
      }
    }
  }, [exp.id]);

  useEffect(() => {
    loadExperience();
    setActiveImageIndex(0);

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadExperience]);

  useEffect(() => {
    const artisanId = fullExperience?.artisanId;
    if (!artisanId) {
      setArtisan(null);
      return;
    }

    let isCurrent = true;
    getArtisan(artisanId)
      .then((data) => {
        if (isCurrent) setArtisan(data);
      })
      .catch(() => {
        if (isCurrent) setArtisan(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [fullExperience?.artisanId]);

  useEffect(() => {
    const experienceId = Number(exp.id);
    if (!Number.isFinite(experienceId)) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    let isCurrent = true;
    setIsLoadingReviews(true);
    getExperienceReviews(experienceId)
      .then((data) => {
        if (isCurrent) setReviews(data);
      })
      .catch(() => {
        if (isCurrent) setReviews([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingReviews(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [exp.id]);

  useEffect(() => {
    const experienceId = Number(exp.id);
    if (!Number.isFinite(experienceId)) {
      setIsWished(false);
      return;
    }

    let isCurrent = true;
    checkWishlist(experienceId)
      .then((liked) => {
        if (isCurrent) setIsWished(liked);
      })
      .catch(() => {
        if (isCurrent) setIsWished(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [exp.id]);

  const handleToggleWishlist = async () => {
    if (isWishLoading) return;
    const experienceId = Number(exp.id);
    if (!Number.isFinite(experienceId)) return;

    setIsWishLoading(true);
    try {
      if (isWished) {
        await removeFromWishlist(experienceId);
        setIsWished(false);
      } else {
        await addToWishlist(experienceId);
        setIsWished(true);
      }
    } catch (error: any) {
      if (error?.status === 409) {
        setIsWished(true);
      } else {
        Alert.alert("알림", "찜 기능을 사용할 수 없습니다.");
      }
    } finally {
      setIsWishLoading(false);
    }
  };

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  const hasSchedules = !!fullExperience?.schedules?.some(
    (schedule) => schedule.isActive && schedule.remainingSlots > 0
  );
  const bookingButtonLabel = isLoadingExperience
    ? "일정 확인 중..."
    : experienceError
      ? "다시 시도"
      : hasSchedules
        ? "날짜 선택하기"
        : "예약 가능한 일정 없음";

  const shortDesc = fullExperience?.description || "체험 소개가 아직 등록되지 않았습니다.";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
      }}
    >
      {/* 딤드 배경 */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* 시트 콘텐츠 */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: "90%",
          overflow: "hidden",
        }}
      >
        {/* 드래그 핸들 */}
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginTop: 12,
            marginBottom: 0,
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* 썸네일 이미지 갤러리 */}
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
            >
              {galleryImages.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={{ width: SCREEN_WIDTH, height: 240 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {galleryImages.length > 1 && (
              <View
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 0,
                  right: 0,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {galleryImages.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: index === activeImageIndex ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        index === activeImageIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={handleToggleWishlist}
              disabled={isWishLoading}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.9)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={isWished ? "heart" : "heart-outline"}
                size={18}
                color={isWished ? colors.accent : colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* 메인 콘텐츠 */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {/* 제목 */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              {exp.title}
            </Text>

            {/* 위치 · 장인 · 별점 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {exp.location} · {exp.artisan}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="star" size={14} color={colors.gold} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  {reviewCount > 0 ? averageRating.toFixed(1) : "0.0"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>({reviewCount})</Text>
              </View>
            </View>

            {/* 스타일 태그 */}
            {!!fullExperience?.tags?.length && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {fullExperience.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: colors.border,
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 정보 칩 4개 */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors.card,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <InfoChip
                icon={<Ionicons name="time-outline" size={20} color={colors.accent} />}
                label={formatDuration(fullExperience?.durationMinutes)}
              />
              <InfoChip
                icon={<Ionicons name="construct-outline" size={20} color={colors.accent} />}
                label={formatDifficulty(fullExperience?.difficulty)}
              />
              <InfoChip
                icon={<Ionicons name="people-outline" size={20} color={colors.accent} />}
                label={fullExperience?.maxParticipants ? `최대 ${fullExperience.maxParticipants}명` : "인원 정보 없음"}
              />
              <InfoChip
                icon={<Ionicons name="language-outline" size={20} color={colors.accent} />}
                label={formatLanguages(fullExperience?.supportedLanguages)}
              />
            </View>

            {/* 구분선 */}
            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24 }} />

            {/* 체험 소개 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              체험 소개
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 22,
                marginBottom: 8,
              }}
              numberOfLines={expanded ? undefined : 4}
            >
              {shortDesc}
            </Text>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 14, color: colors.accent, fontWeight: "600" }}>
                {expanded ? "접기" : "더보기"}
              </Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.accent}
              />
            </TouchableOpacity>

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: colors.border, marginTop: 24, marginBottom: 24 }}
            />

            {/* 장인 소개 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 14,
              }}
            >
              장인 소개
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
                marginBottom: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.bg,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="person-outline" size={26} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
                  >
                    {exp.artisan}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {artisan?.heritageCategory
                      ? artisan.certificationNumber
                        ? `${artisan.heritageCategory} · 인증번호 ${artisan.certificationNumber}`
                        : artisan.heritageCategory
                      : "장인 인증 정보가 아직 등록되지 않았습니다."}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 20,
                  marginTop: 12,
                }}
                numberOfLines={2}
              >
                {artisan?.bio || "장인 소개가 아직 등록되지 않았습니다."}
              </Text>
            </View>
            {!!fullExperience?.artisanId && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                onPress={() => {
                  onClose();
                  navigation.navigate("ArtisanDetail", { artisanId: fullExperience.artisanId });
                }}
              >
                <Text style={{ fontSize: 14, color: colors.accent, fontWeight: "600" }}>
                  장인 이야기 보기
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </TouchableOpacity>
            )}

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: colors.border, marginTop: 24, marginBottom: 24 }}
            />

            {/* 후기 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>
                후기
              </Text>
              {reviewCount > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    {averageRating.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>({reviewCount})</Text>
                </View>
              )}
            </View>

            {isLoadingReviews ? (
              <ActivityIndicator color={colors.accent} />
            ) : reviewCount === 0 ? (
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                아직 등록된 후기가 없습니다.
              </Text>
            ) : (
              reviews.slice(0, 3).map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= review.rating ? "star" : "star-outline"}
                          size={13}
                          color={colors.gold}
                        />
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {formatScheduleDate(review.createdAt)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 21 }}>
                    {review.content}
                  </Text>
                </View>
              ))
            )}

            {reviewCount > 3 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ExperienceReviews", {
                    experienceId: Number(exp.id),
                    title: exp.title,
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.accent, fontWeight: "600" }}>
                  리뷰 전체보기 ({reviewCount})
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </TouchableOpacity>
            )}

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: colors.border, marginTop: 24, marginBottom: 24 }}
            />

            {/* 위치 안내 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 14,
              }}
            >
              위치 안내
            </Text>
            <View style={{ position: "relative" }}>
              <KakaoMapView
                latitude={fullExperience?.locationLat || 37.5665}
                longitude={fullExperience?.locationLng || 126.9780}
                address={exp.location}
                height={160}
                markerTitle={fullExperience?.title || exp.title}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  backgroundColor: "rgba(255,255,255,0.55)",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color="#1C1107" />
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: "#1C1107" }}
                  >
                    {exp.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 하단 고정 버튼 */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === "ios" ? 34 : 20,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {/* 가격 + 버튼 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>1인 기준</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                {Number(fullExperience?.price ?? exp.price).toLocaleString("ko-KR")}{" "}
                <Text style={{ fontSize: 14, fontWeight: "500" }}>원~</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (experienceError) {
                  loadExperience();
                  return;
                }
                if (!fullExperience || !hasSchedules) {
                  // 일정 없음 상태는 disabled이므로 이 분기 도달 불가
                  return;
                }
                onClose(); // 팝업 닫기
                navigation.navigate("BookingCreate", { exp, experience: fullExperience });
              }}
              disabled={isLoadingExperience || (!experienceError && !hasSchedules)}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: hasSchedules || experienceError ? colors.accent : colors.border,
                borderRadius: 50,
                paddingVertical: 16,
                alignItems: "center",
                opacity: isLoadingExperience ? 0.75 : 1,
              }}
            >
              {isLoadingExperience ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text
                  style={{ color: colors.bg, fontSize: 16, fontWeight: "700" }}
                >
                  {bookingButtonLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
