import React, { useState, useEffect } from "react";
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity,
  Image, ImageBackground, NativeSyntheticEvent,
  NativeScrollEvent, Dimensions, ActivityIndicator, Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { CardNewsCarousel } from "../cardnews/CardNewsCarousel";
import { MainLayout } from "./MainLayout";
import { apiGet } from "@/services/api";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getMyWishlists, addToWishlist, removeFromWishlist, checkWishlist } from "@/features/wishlists/api/wishlistsApi";
import { getHeroBanners, getRecommendedArtisan, getNearbyArtisans } from "./api/homeApi";
import type { Reservation, Wishlist, Banner, Artisan } from "@/types/api";
import { supabase } from "@/lib/supabase";

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

// Wishlist를 UI 카드 형식으로 변환
function mapWishlistToCard(wishlist: Wishlist): ExperienceCard {
  return {
    id: String(wishlist.experienceId),
    title: wishlist.experienceTitle,
    location: wishlist.experienceLocation || "위치 미정",
    duration: wishlist.experienceDurationMinutes ? `${wishlist.experienceDurationMinutes}분` : "시간 미정",
    category: wishlist.experienceCategory || "기타",
    price: `${Number(wishlist.experiencePrice).toLocaleString()}원`,
    rating: 0, // TODO: 리뷰 평점 연동 필요
    reviewCount: 0, // TODO: 리뷰 개수 연동 필요
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

function BannerCard({ item }: { item: Banner }) {
  return (
    <TouchableOpacity activeOpacity={0.95} style={{ width: BANNER_WIDTH, marginRight: 16 }}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.bannerCard}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTag}>{item.tag}</Text>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.bannerButton} activeOpacity={0.85}>
            <Text style={styles.bannerButtonText}>체험 둘러보기</Text>
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
    rating: 0,
    reviewCount: 0,
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
          <Text style={styles.wishIcon}>{isWished ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.popularInfo}>
        <Text style={styles.popularMeta}>{item.location} | {item.duration}</Text>
        <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.ratingText}>{item.rating} ({item.reviewCount})</Text>
        </View>
        <Text style={styles.popularPrice}>{item.price}</Text>
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
  return (
    <TouchableOpacity style={styles.nearbyCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: item.profileImageUrl || undefined }} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nearbyMeta}>{item.heritageCategory} · {item.address || "위치 정보 없음"}</Text>
        <View style={styles.nearbyDistanceRow}>
          <Text style={styles.nearbyDistanceIcon}>📍</Text>
          <Text style={styles.nearbyDistance}>{distanceLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [popularExperiences, setPopularExperiences] = useState<any[]>([]);
  const [newExperiences, setNewExperiences] = useState<any[]>([]);
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
      const wishlistCards = wishlists.map(mapWishlistToCard);
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
    const fetchBanners = async () => {
      try {
        const bannersData = await getHeroBanners();
        setBanners(bannersData);
      } catch (e) {
        console.error("[Home] 배너 로드 실패:", e);
      }
    };
    const fetchRecommendedArtisan = async () => {
      try {
        const artisanData = await getRecommendedArtisan();
        setRecommendedArtisan(artisanData);
      } catch (e) {
        console.error("[Home] 오늘의 장인 로드 실패:", e);
      }
    };
    fetchBanners();
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
        // 백엔드의 활성 체험 목록 API 호출
        const response = await apiGet<any[]>("/experiences/active");
        const experiences = response || [];
        setPopularExperiences(experiences);
        const sortedByNewest = [...experiences].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNewExperiences(sortedByNewest.slice(0, 5));
      } catch (e: any) {
        console.error("체험 목록을 불러오는데 실패했습니다:", e);
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
      return <ActivityIndicator size="large" color="#3B2B26" style={{ height: 250 }} />;
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
          rating: 0,
          reviewCount: 0,
          duration: exp.durationMinutes ? `${exp.durationMinutes}분` : "시간 미정",
          price: Number(exp.price) || 0,
          tags: [],
          imageUri: imageUrl,
          difficulty: exp.difficulty || "초급",
        },
      },
    });
  };

  return (
    <MainLayout>
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
              <BannerCard key={banner.id} item={banner} />
            ))}
          </ScrollView>
          {/* 페이지 인디케이터 */}
          <View style={styles.dotRow}>
            {banners.map((_, i) => (
              <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* 다가오는 일정 */}
        {upcomingSchedule ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>다가오는 일정</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MainTabs", { screen: "Bookings" })}
              >
                <Text style={styles.viewAllText}>전체보기 &gt;</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.scheduleCard}
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
                  <Text style={styles.scheduleCalIcon}>📅</Text>
                  <Text style={styles.scheduleDateTime}>
                    {upcomingSchedule.date} {upcomingSchedule.time}
                  </Text>
                </View>
                <Text style={styles.scheduleTitle}>{upcomingSchedule.title}</Text>
                <View style={styles.scheduleLocationRow}>
                  <Text style={styles.scheduleLocationIcon}>📍</Text>
                  <Text style={styles.scheduleLocation}>{upcomingSchedule.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.emptyScheduleContainer}>
              <Text style={styles.emptyScheduleIcon}>📋</Text>
              <Text style={styles.emptyScheduleTitle}>예정된 체험이 없습니다</Text>
              <Text style={styles.emptyScheduleDesc}>
                새로운 체험을 찾아 예약해보세요!
              </Text>
              <TouchableOpacity
                style={styles.emptyScheduleButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("MainTabs", { screen: "Explore" })}
              >
                <Text style={styles.emptyScheduleButtonText}>체험 탐색하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* 오늘의 장인 */}
        {recommendedArtisan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 장인</Text>
            <TouchableOpacity style={styles.artisanCard} activeOpacity={0.9}>
              <Image source={{ uri: recommendedArtisan.profileImageUrl || undefined }} style={styles.artisanImage} />
              <View style={styles.artisanInfo}>
                {recommendedArtisan.heritageCategory && (
                  <View style={styles.artisanBadgeWrap}>
                    <Text style={styles.artisanBadge}>{recommendedArtisan.heritageCategory}</Text>
                  </View>
                )}
                <Text style={styles.artisanName}>{recommendedArtisan.name}</Text>
                {recommendedArtisan.bio && (
                  <Text style={styles.artisanQuote}>{recommendedArtisan.bio}</Text>
                )}
                <TouchableOpacity
                  style={styles.artisanButton}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("ArtisanDetail", { artisanId: recommendedArtisan.id })}
                >
                  <Text style={styles.artisanButtonText}>장인 스토리 보기</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 내 주변 장인 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 내 주변 장인</Text>
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
            <Text style={styles.sectionTitle}>❤️ 내가 찜한 체험</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Wishlist" as any)}
            >
              <Text style={styles.viewAllText}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>
          {wishedExperiences.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScroll}
            >
              {wishedExperiences.map((item) => (
                <PopularExperienceCard key={item.id} item={item} refreshTrigger={refreshTrigger} />
              ))}
            </ScrollView>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🤍</Text>
              <Text style={{ fontSize: 14, color: "#8A8077" }}>아직 찜한 체험이 없습니다</Text>
            </View>
          )}
        </View>

        {/* 인기 체험 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 인기 체험 Top 10</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("MainTabs", { screen: "Explore", params: { filter: "popular" } })}
            >
              <Text style={styles.viewAllText}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>
          {renderPopularExperiences()}
        </View>

        {/* 신규 체험 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ 새로 나온 체험</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("MainTabs", { screen: "Explore", params: { filter: "new" } })}
            >
              <Text style={styles.viewAllText}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {newExperiences.map((item) => (
              <PopularExperienceCard
                key={item.id}
                item={mapExperienceToCard(item)}
                onPress={() => openExperienceDetail(item)}
                refreshTrigger={refreshTrigger}
              />
            ))}
          </ScrollView>
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
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D4CDC4" },
  dotActive: { width: 18, backgroundColor: "#3B2B26" },

  // 공통 섹션
  section: { marginBottom: 30, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#3B2B26" },
  viewAllText: { fontSize: 13, color: "#8A8077" },

  // 다가오는 일정
  scheduleCard: {
    flexDirection: "row",
    backgroundColor: "#FAF9F6",
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 14,
    overflow: "hidden",
  },
  scheduleThumb: { width: 80, height: 80 },
  scheduleInfo: { flex: 1, padding: 12, justifyContent: "center" },
  scheduleDateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  scheduleCalIcon: { fontSize: 13, marginRight: 4 },
  scheduleDateTime: { fontSize: 13, color: "#6E665F", fontWeight: "600" },
  scheduleTitle: { fontSize: 15, fontWeight: "700", color: "#3B2B26", marginBottom: 4 },
  scheduleLocationRow: { flexDirection: "row", alignItems: "center" },
  scheduleLocationIcon: { fontSize: 12, marginRight: 3 },
  scheduleLocation: { fontSize: 12, color: "#8A8077" },

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
  wishIcon: { fontSize: 14 },
  popularInfo: {},
  popularMeta: { fontSize: 11, color: "#8A8077", marginBottom: 3 },
  popularTitle: { fontSize: 14, fontWeight: "700", color: "#3B2B26", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 3 },
  starIcon: { fontSize: 12, color: "#D4A97A" },
  ratingText: { fontSize: 11, color: "#8A8077" },
  popularPrice: { fontSize: 14, fontWeight: "600", color: "#3B2B26" },

  // 내 주변 장인
  nearbyCard: { width: 168, marginRight: 14 },
  nearbyImage: { width: "100%", height: 110, borderRadius: 12, marginBottom: 10 },
  nearbyInfo: {},
  nearbyName: { fontSize: 14, fontWeight: "700", color: "#3B2B26", marginBottom: 4 },
  nearbyMeta: { fontSize: 11, color: "#8A8077", marginBottom: 4 },
  nearbyDistanceRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  nearbyDistanceIcon: { fontSize: 11 },
  nearbyDistance: { fontSize: 12, color: "#6E665F", fontWeight: "600" },

  // 오늘의 장인
  artisanCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FAF9F6",
    borderWidth: 1,
    borderColor: "#D4CDC4",
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
  artisanName: { fontSize: 20, fontWeight: "700", color: "#3B2B26", marginBottom: 10 },
  artisanQuote: { fontSize: 14, color: "#6E665F", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  artisanButton: {
    borderWidth: 1,
    borderColor: "#3B2B26",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  artisanButtonText: { fontSize: 13, fontWeight: "600", color: "#3B2B26" },

  // 빈 다가오는 일정 상태
  emptyScheduleContainer: {
    backgroundColor: "#FEF3E2",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D5C4",
  },
  emptyScheduleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyScheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2B26",
    marginBottom: 6,
  },
  emptyScheduleDesc: {
    fontSize: 13,
    color: "#8A8077",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyScheduleButton: {
    backgroundColor: "#3B2B26",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  emptyScheduleButtonText: {
    color: "#FFF",
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