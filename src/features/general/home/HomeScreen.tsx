import React, { useState, useEffect } from "react";
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity,
  Image, ImageBackground, NativeSyntheticEvent,
  NativeScrollEvent, Dimensions, ActivityIndicator, Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { CardNewsCarousel } from "../cardnews/CardNewsCarousel";
import { MainLayout } from "./MainLayout";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getExperienceReviews } from "@/features/reviews/api/reviewsApi";
import { getMyWishlists, addToWishlist, removeFromWishlist, checkWishlist } from "@/features/wishlists/api/wishlistsApi";
import { getRecommendedArtisan, getNearbyArtisans } from "./api/homeApi";
import { getChungbukExperiences, type ChungbukExperience } from "@/features/chungbuk/api/chungbukApi";
import type { Reservation, Wishlist, Banner, Artisan } from "@/types/api";

// 충북 버전: 체험 섹션 데이터를 충북 FastAPI 체험으로 매핑 (기존 Experience 모양에 맞춤)
function chungbukExperienceToExperienceLike(exp: ChungbukExperience) {
  return {
    id: exp.id,
    title: exp.title,
    locationAddress: exp.location || "충북",
    durationMinutes: exp.duration_minutes,
    category: "충북",
    price: exp.price,
    averageRating: 0,
    reviewCount: 0,
    images: exp.image_url ? [{ imageUrl: exp.image_url, displayOrder: 0 }] : [],
    createdAt: new Date().toISOString(),
  };
}

// 충북 버전: 기존 동적 히어로 배너 대신 전통시장/관광명소 진입점을 고정 배너로 노출
const CHUNGBUK_BANNERS: Banner[] = [
  {
    id: -1,
    title: "충북 전통시장",
    subtitle: "충북 곳곳의 전통시장 이야기를 만나보세요",
    tag: "전통시장",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    bannerType: "전통시장",
    displayOrder: 0,
    createdAt: "",
  },
  {
    id: -2,
    title: "충북 관광명소",
    subtitle: "충북의 대표 관광명소를 카드뉴스로 둘러보세요",
    tag: "관광명소",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    bannerType: "관광명소",
    displayOrder: 1,
    createdAt: "",
  },
];
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 48;

// 다가오는 일정 타입
interface UpcomingSchedule {
  id: string;
  reservationId: number;
  date: string;
  time: string;
  title: string;
  location: string;
  image: string;
}

// 날짜 포맷팅 함수
function formatScheduleDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

// 시간 포맷팅 함수 - 사용자 로케일에 맞춘 포맷팅
function formatScheduleTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}


// Experience를 UI 카드 형식으로 변환
interface ExperienceCard {
  id: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
}

// 백엔드 Wishlist 응답에는 averageRating/reviewCount가 채워지지 않으므로,
// 인기/신규 체험과 동일하게 리뷰 API에서 직접 계산해 보강한다.
async function getWishlistReviewStats(wishlist: Wishlist): Promise<{ rating: number; reviewCount: number }> {
  const known = wishlist.averageRating ?? wishlist.rating;
  if (known !== undefined && wishlist.reviewCount !== undefined) {
    return { rating: Number(known.toFixed(1)), reviewCount: wishlist.reviewCount };
  }

  const reviews = await getExperienceReviews(wishlist.experienceId).catch(() => []);
  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;
  return { rating, reviewCount };
}

// Wishlist를 UI 카드 형식으로 변환
function mapWishlistToCard(wishlist: Wishlist, stats: { rating: number; reviewCount: number }): ExperienceCard {
  return {
    id: String(wishlist.experienceId),
    title: wishlist.experienceTitle,
    location: wishlist.experienceLocation || "위치 미정",
    duration: wishlist.experienceDurationMinutes ? `${wishlist.experienceDurationMinutes}분` : "시간 미정",
    category: wishlist.experienceCategory || "기타",
    price: `${Number(wishlist.experiencePrice).toLocaleString()}원`,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    image: wishlist.experienceImageUrl || "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80",
  };
}


function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function BannerCard({ item, onPress }: { item: Banner; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.95} style={{ width: BANNER_WIDTH, marginRight: 16 }} onPress={onPress}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.bannerCard}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTag}>{item.tag}</Text>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.bannerButton} activeOpacity={0.85} onPress={onPress}>
            <Text style={styles.bannerButtonText}>카드뉴스 보기</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function mapExperienceToCard(exp: any): ExperienceCard {
  // images 배열에서 첫 번째 이미지 URL 추출, 없으면 기본 이미지 사용
  const imageUrl = exp.images && exp.images.length > 0
    ? exp.images[0].imageUrl
    : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";

  return {
    id: String(exp.id),
    title: exp.title,
    location: exp.locationAddress || "위치 미정",
    duration: exp.durationMinutes ? `${exp.durationMinutes}분` : "시간 미정",
    category: exp.category || "기타",
    price: `${Number(exp.price).toLocaleString()}원`,
    rating: Number((exp.averageRating ?? 0).toFixed(1)),
    reviewCount: exp.reviewCount ?? 0,
    image: imageUrl,
  };
}

function PopularExperienceCard({
  item,
  onPress,
  refreshTrigger,
}: {
  item: ExperienceCard;
  onPress?: () => void;
  refreshTrigger?: number;
}) {
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  // 마운트 시 + refreshTrigger 변경 시 찜 상태 확인
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const isLiked = await checkWishlist(Number(item.id));
        setIsWished(isLiked);
      } catch (e) {
        console.log("찜 상태 확인 실패:", e);
      }
    };
    fetchWishlistStatus();
  }, [item.id, refreshTrigger]);

  // 찜 토글 핸들러
  const handleToggleWishlist = async () => {
    if (loading) return;

    setLoading(true);
    const experienceId = Number(item.id);

    try {
      if (isWished) {
        await removeFromWishlist(experienceId);
        setIsWished(false);
        console.log("✅ 찜 해제:", item.title);
      } else {
        await addToWishlist(experienceId);
        setIsWished(true);
        console.log("✅ 찜 추가:", item.title);
      }
    } catch (error: any) {
      console.error("❌ 찜 토글 실패:", error);

      // 409 에러 (이미 찜됨) 처리
      if (error.status === 409) {
        console.log("⚠️ 이미 찜된 체험 - 상태 동기화");
        setIsWished(true);
      } else {
        Alert.alert("알림", "찜 기능을 사용할 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.popularCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.popularImageContainer}>
        <Image source={{ uri: item.image }} style={styles.popularImage} />
        <TouchableOpacity
          style={styles.wishButton}
          onPress={handleToggleWishlist}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Ionicons
            name={isWished ? "heart" : "heart-outline"}
            size={15}
            color={isWished ? colors.accent : colors.text}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.popularInfo}>
        <Text style={[styles.popularMeta, { color: colors.textSecondary }]}>{item.location} | {item.duration}</Text>
        <Text style={[styles.popularTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.starIcon, { color: colors.gold }]}>★</Text>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating} ({item.reviewCount})</Text>
        </View>
        <Text style={[styles.popularPrice, { color: colors.text }]}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

function NearbyArtisanCard({
  item,
  distanceLabel,
  onPress,
}: {
  item: Artisan;
  distanceLabel: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.nearbyCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: item.profileImageUrl || undefined }} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <Text style={[styles.nearbyName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.nearbyMeta, { color: colors.textSecondary }]}>{item.heritageCategory} · {item.address || "위치 정보 없음"}</Text>
        <View style={styles.nearbyDistanceRow}>
          <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
          <Text style={[styles.nearbyDistance, { color: colors.textSecondary }]}>{distanceLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [popularExperiences, setPopularExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState<UpcomingSchedule | null>(null);
  const [wishedExperiences, setWishedExperiences] = useState<ExperienceCard[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recommendedArtisan, setRecommendedArtisan] = useState<Artisan | null>(null);
  const [nearbyArtisans, setNearbyArtisans] = useState<Artisan[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 찜한 체험 목록 로드 함수
  const fetchWishlists = React.useCallback(async () => {
    try {
      // 인증 체크
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setWishedExperiences([]);
        return;
      }

      const wishlists = await getMyWishlists();
      const statsList = await Promise.all(wishlists.map(getWishlistReviewStats));
      const wishlistCards = wishlists.map((w, i) => mapWishlistToCard(w, statsList[i]));
      setWishedExperiences(wishlistCards);
      console.log("✅ 찜한 체험 목록 갱신:", wishlistCards.length);
    } catch (e) {
      console.error("찜 목록을 불러오는데 실패했습니다:", e);
    }
  }, []);

  // 화면 포커스 시 찜 목록 + 찜 상태 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchWishlists(); // 찜 목록 새로고침
      setRefreshTrigger((prev) => prev + 1); // 각 카드의 찜 상태 새로고침
    }, [fetchWishlists])
  );

  const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (BANNER_WIDTH + 16));
    console.log("🎯 [배너 스크롤]", { offsetX, index, activeBanner });
    setActiveBanner(index);
  };

  useEffect(() => {
    // 충북 버전: 동적 배너 API 대신 전통시장/관광명소 고정 배너 사용
    setBanners(CHUNGBUK_BANNERS);
    const fetchRecommendedArtisan = async () => {
      try {
        const artisanData = await getRecommendedArtisan();
        setRecommendedArtisan(artisanData);
      } catch (e) {
        console.error("[Home] 오늘의 장인 로드 실패:", e);
      }
    };
    fetchRecommendedArtisan();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const position = await Location.getCurrentPositionAsync({});
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        // 위치 정보 받은 후 근처 장인 로드
        const nearby = await getNearbyArtisans(coords.lat, coords.lng);
        setNearbyArtisans(nearby);
      } catch (e) {
        console.warn("위치 정보를 가져오지 못했습니다:", e);
      }
    };
    fetchLocation();
  }, []);

  const getDistanceLabel = (item: Artisan) => {
    if (!userCoords || !item.latitude || !item.longitude) return "거리 정보 없음";
    return `${getDistanceKm(userCoords.lat, userCoords.lng, item.latitude, item.longitude).toFixed(1)}km`;
  };

  // 다가오는 일정 로드
  useEffect(() => {
    const fetchUpcomingSchedule = async () => {
      try {
        // 인증 체크
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // 로그인하지 않은 경우 스킵

        const reservations = await getMyReservations();

        // APPROVED, PAID, CONFIRMED 상태 중 가장 가까운 미래 일정 찾기
        const upcomingReservations = reservations
          .filter(r =>
            (r.status === "APPROVED" || r.status === "PAID" || r.status === "CONFIRMED") &&
            r.reservedDateTime &&
            new Date(r.reservedDateTime) > new Date()
          )
          .sort((a, b) =>
            new Date(a.reservedDateTime!).getTime() - new Date(b.reservedDateTime!).getTime()
          );

        if (upcomingReservations.length > 0) {
          const nextReservation = upcomingReservations[0];
          const experience = await getExperience(nextReservation.experienceId);

          setUpcomingSchedule({
            id: String(nextReservation.id),
            reservationId: nextReservation.id,
            date: formatScheduleDate(nextReservation.reservedDateTime),
            time: formatScheduleTime(nextReservation.reservedDateTime),
            title: experience.title,
            location: experience.locationAddress || "위치 미정",
            image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80",
          });
        }
      } catch (e) {
        console.error("다가오는 일정을 불러오는데 실패했습니다:", e);
        // 일정이 없거나 에러 발생 시 섹션을 표시하지 않음 (null 상태 유지)
      }
    };

    fetchUpcomingSchedule();
  }, []);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // 충북 버전: 기존 Spring 활성 체험 목록 대신 충북 FastAPI 체험 데이터 사용
        const chungbukExperiences = await getChungbukExperiences();
        const experiences = chungbukExperiences.map(chungbukExperienceToExperienceLike);
        setPopularExperiences(experiences);
      } catch (e: any) {
        console.error("충북 체험 목록을 불러오는데 실패했습니다:", e);
        setError("체험 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  // 초기 마운트 시 찜한 체험 로드
  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  const renderPopularExperiences = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.text} style={{ height: 250 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScroll}
      >
        {popularExperiences.map((item) => (
          <PopularExperienceCard
            key={item.id}
            item={mapExperienceToCard(item)}
            onPress={() => openExperienceDetail(item)}
            refreshTrigger={refreshTrigger}
          />
        ))}
      </ScrollView>
    );
  };

  const openExperienceDetail = (exp: any) => {
    // images 배열에서 첫 번째 이미지 URL 추출
    const imageUrl = exp.images && exp.images.length > 0
      ? exp.images[0].imageUrl
      : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";

    navigation.navigate("MainTabs", {
      screen: "Explore",
      params: {
        exp: {
          id: String(exp.id),
          title: exp.title,
          category: exp.category || "기타",
          location: exp.locationAddress || "위치 미정",
          artisan: "장인",
          rating: Number((exp.averageRating ?? 0).toFixed(1)),
          reviewCount: exp.reviewCount ?? 0,
          duration: exp.durationMinutes ? `${exp.durationMinutes}분` : "시간 미정",
          price: Number(exp.price) || 0,
          tags: [],
          imageUri: imageUrl,
          difficulty: exp.difficulty || "초급",
        },
      },
    });
  };

  const openWishedExperienceDetail = (card: ExperienceCard) => {
    navigation.navigate("MainTabs", {
      screen: "Explore",
      params: {
        exp: {
          id: card.id,
          title: card.title,
          category: card.category,
          location: card.location,
          artisan: "장인",
          rating: card.rating,
          reviewCount: card.reviewCount,
          duration: card.duration,
          price: Number(card.price.replace(/[^0-9]/g, "")) || 0,
          tags: [],
          imageUri: card.image,
          difficulty: "초급",
        },
      },
    });
  };

  return (
    <MainLayout activeItem="홈">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* 히어로 배너 */}
        <View style={styles.bannerSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannerScroll}
            snapToInterval={BANNER_WIDTH + 16}
            decelerationRate="fast"
            onScroll={handleBannerScroll}
            onMomentumScrollEnd={handleBannerScroll}
            scrollEventThrottle={16}
          >
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                item={banner}
                onPress={() => navigation.navigate("CardNewsList", { initialFilter: "충북" })}
              />
            ))}
          </ScrollView>
          {/* 페이지 인디케이터 */}
          <View style={styles.dotRow}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: colors.border },
                  activeBanner === i && { width: 18, backgroundColor: colors.text },
                ]}
              />
            ))}
          </View>
        </View>

        {/* 다가오는 일정 */}
        {upcomingSchedule ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>다가오는 일정</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MainTabs", { screen: "Bookings" })}
              >
                <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>전체보기 &gt;</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate("BookingDetail", {
                booking: {
                  id: upcomingSchedule.id,
                  reservationId: upcomingSchedule.reservationId,
                  date: upcomingSchedule.date,
                  time: upcomingSchedule.time,
                  title: upcomingSchedule.title,
                  location: upcomingSchedule.location,
                  imageUri: upcomingSchedule.image,
                  artisan: "장인",
                  status: "upcoming",
                  guests: 1,
                } as any
              })}
            >
              <Image source={{ uri: upcomingSchedule.image }} style={styles.scheduleThumb} />
              <View style={styles.scheduleInfo}>
                <View style={styles.scheduleDateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.scheduleDateTime, { color: colors.textSecondary }]}>
                    {upcomingSchedule.date} {upcomingSchedule.time}
                  </Text>
                </View>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>{upcomingSchedule.title}</Text>
                <View style={styles.scheduleLocationRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.scheduleLocation, { color: colors.textSecondary }]}>{upcomingSchedule.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={[styles.emptyScheduleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="calendar-clear-outline" size={40} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyScheduleTitle, { color: colors.text }]}>예정된 체험이 없습니다</Text>
              <Text style={[styles.emptyScheduleDesc, { color: colors.textSecondary }]}>
                새로운 체험을 찾아 예약해보세요!
              </Text>
              <TouchableOpacity
                style={[styles.emptyScheduleButton, { backgroundColor: colors.text }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("MainTabs", { screen: "Explore" })}
              >
                <Text style={[styles.emptyScheduleButtonText, { color: colors.bg }]}>체험 탐색하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* 인기 체험 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>충북 체험</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("MainTabs", { screen: "Explore", params: { filter: "popular" } })}
            >
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>
          {renderPopularExperiences()}
        </View>

        {/* 오늘의 장인 */}
        {recommendedArtisan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘의 장인</Text>
            <TouchableOpacity style={[styles.artisanCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.9}>
              <Image source={{ uri: recommendedArtisan.profileImageUrl || undefined }} style={styles.artisanImage} />
              <View style={styles.artisanInfo}>
                {recommendedArtisan.heritageCategory && (
                  <View style={styles.artisanBadgeWrap}>
                    <Text style={styles.artisanBadge}>{recommendedArtisan.heritageCategory}</Text>
                  </View>
                )}
                <Text style={[styles.artisanName, { color: colors.text }]}>{recommendedArtisan.name}</Text>
                {recommendedArtisan.bio && (
                  <Text style={[styles.artisanQuote, { color: colors.textSecondary }]}>{recommendedArtisan.bio}</Text>
                )}
                <TouchableOpacity
                  style={[styles.artisanButton, { borderColor: colors.text }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("ArtisanDetail", { artisanId: recommendedArtisan.id })}
                >
                  <Text style={[styles.artisanButtonText, { color: colors.text }]}>장인 스토리 보기</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 내 주변 장인 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>내 주변 장인</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {nearbyArtisans.map((item) => (
              <NearbyArtisanCard
                key={item.id}
                item={item}
                distanceLabel={getDistanceLabel(item)}
                onPress={() => navigation.navigate("ArtisanDetail", { artisanId: item.id })}
              />
            ))}
          </ScrollView>
        </View>

        {/* 찜한 체험 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>찜한 체험</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Wishlist" as any)}
            >
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>
          {wishedExperiences.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScroll}
            >
              {wishedExperiences.map((item) => (
                <PopularExperienceCard
                  key={item.id}
                  item={item}
                  onPress={() => openWishedExperienceDetail(item)}
                  refreshTrigger={refreshTrigger}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Ionicons name="heart-outline" size={28} color={colors.border} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>아직 찜한 체험이 없습니다</Text>
            </View>
          )}
        </View>

        {/* 카드뉴스 */}
        <View style={styles.section}>
          <CardNewsCarousel />
        </View>

      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 40 },

  // 배너
  bannerSection: { marginBottom: 30 },
  bannerScroll: { paddingHorizontal: 24 },
  bannerCard: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerImage: { borderRadius: 16 },
  bannerOverlay: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderRadius: 16,
  },
  bannerTag: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 4 },
  bannerTitle: { fontSize: 22, fontWeight: "700", color: "#FFF", lineHeight: 30, marginBottom: 6 },
  bannerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 18, marginBottom: 16 },
  bannerButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerButtonText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  dotRow: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // 공통 섹션
  section: { marginBottom: 30, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  viewAllText: { fontSize: 13 },

  // 다가오는 일정
  scheduleCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  scheduleThumb: { width: 80, height: 80 },
  scheduleInfo: { flex: 1, padding: 12, justifyContent: "center" },
  scheduleDateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  scheduleDateTime: { fontSize: 13, fontWeight: "600" },
  scheduleTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  scheduleLocationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  scheduleLocation: { fontSize: 12 },

  // 인기 체험
  popularScroll: { paddingRight: 24 },
  popularCard: { width: 148, marginRight: 14 },
  popularImageContainer: {
    width: "100%",
    height: 148,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  popularImage: { width: "100%", height: "100%" },
  wishButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  popularInfo: {},
  popularMeta: { fontSize: 11, marginBottom: 3 },
  popularTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 3 },
  starIcon: { fontSize: 12 },
  ratingText: { fontSize: 11 },
  popularPrice: { fontSize: 14, fontWeight: "600" },

  // 내 주변 장인
  nearbyCard: { width: 168, marginRight: 14 },
  nearbyImage: { width: "100%", height: 110, borderRadius: 12, marginBottom: 10 },
  nearbyInfo: {},
  nearbyName: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  nearbyMeta: { fontSize: 11, marginBottom: 4 },
  nearbyDistanceRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  nearbyDistance: { fontSize: 12, fontWeight: "600" },

  // 오늘의 장인
  artisanCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  artisanImage: { width: "100%", height: 200 },
  artisanInfo: { padding: 20, alignItems: "center" },
  artisanBadgeWrap: { marginBottom: 10 },
  artisanBadge: {
    fontSize: 12,
    color: "#8B6F5E",
    backgroundColor: "#F5EFE8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  artisanName: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  artisanQuote: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 16 },
  artisanButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  artisanButtonText: { fontSize: 13, fontWeight: "600" },

  // 빈 다가오는 일정 상태
  emptyScheduleContainer: {
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyScheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyScheduleDesc: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyScheduleButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  emptyScheduleButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // 에러 텍스트
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    paddingVertical: 20,
  }
});
