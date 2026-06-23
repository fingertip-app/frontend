import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity,
  Image, ImageBackground, FlatList, NativeSyntheticEvent,
  NativeScrollEvent, Dimensions, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { CardNewsCarousel } from "../cardnews/CardNewsCarousel";
import { MainLayout } from "./MainLayout";
import { apiGet } from "@/services/api";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getMyWishlists } from "@/features/wishlists/api/wishlistsApi";
import type { Reservation, Wishlist } from "@/types/api";

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

const TOP_BANNERS = [
  {
    id: "1",
    tag: "오늘 하루,",
    title: "장인의 시간이\n되어보세요",
    subtitle: "전통의 가치를 경험하는 특별한 하루를 만나보세요.",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
  },
  {
    id: "2",
    tag: "이번 주 추천,",
    title: "손끝에서 피어나는\n전통 매듭 공예",
    subtitle: "조선시대 왕실 기법을 직접 배워보세요.",
    image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=800&q=80",
  },
];

const POPULAR_EXPERIENCES = [
  {
    id: "1",
    title: "도자기 물레 체험",
    location: "이천",
    duration: "2시간",
    category: "도자기",
    price: "45,000원",
    rating: 4.9,
    reviewCount: 128,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80",
  },
  {
    id: "2",
    title: "한지 등 만들기",
    location: "전주",
    duration: "1.5시간",
    category: "한지공예",
    price: "38,000원",
    rating: 4.8,
    reviewCount: 96,
    image: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=400&q=80",
  },
  {
    id: "3",
    title: "전통 매듭 팔찌",
    location: "서울",
    duration: "1시간",
    category: "매듭/자수",
    price: "30,000원",
    rating: 4.7,
    reviewCount: 84,
    image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=400&q=80",
  },
];

// Wishlist를 UI 카드 형식으로 변환
function mapWishlistToCard(wishlist: Wishlist): typeof POPULAR_EXPERIENCES[0] {
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

const TODAY_ARTISAN = {
  name: "김영수 장인",
  badge: "국가무형유산 매듭장",
  quote: '"매듭에는 사람의 마음을 잇는 힘이 있습니다."',
  image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80",
};

// 장인 작업실 위치 (실제로는 백엔드 Experience.locationLat/Lng 기준이어야 하나,
// 현재 /experiences/active 응답에 장인명이 포함되지 않아 좌표만 목업으로 둔다)
const NEARBY_ARTISANS = [
  {
    id: "1",
    name: "김도예 장인",
    category: "도자기",
    location: "경기 이천시",
    lat: 37.2725,
    lng: 127.4348,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&q=80",
  },
  {
    id: "2",
    name: "한지마을",
    category: "한지공예",
    location: "전북 전주시",
    lat: 35.8242,
    lng: 127.1480,
    image: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=300&q=80",
  },
  {
    id: "3",
    name: "이영희 장인",
    category: "나전칠기",
    location: "서울 종로구",
    lat: 37.5735,
    lng: 126.9788,
    image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=300&q=80",
  },
];

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function BannerCard({ item }: { item: typeof TOP_BANNERS[0] }) {
  return (
    <TouchableOpacity activeOpacity={0.95} style={{ width: BANNER_WIDTH, marginRight: 16 }}>
      <ImageBackground
        source={{ uri: item.image }}
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

function mapExperienceToCard(exp: any): typeof POPULAR_EXPERIENCES[0] {
  return {
    id: String(exp.id),
    title: exp.title,
    location: exp.locationAddress || "위치 미정",
    duration: exp.durationMinutes ? `${exp.durationMinutes}분` : "시간 미정",
    category: exp.category || "기타",
    price: `${Number(exp.price).toLocaleString()}원`,
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80",
  };
}

function PopularExperienceCard({
  item,
  onPress,
}: {
  item: typeof POPULAR_EXPERIENCES[0];
  onPress?: () => void;
}) {
  const [isWished, setIsWished] = useState(false);
  return (
    <TouchableOpacity style={styles.popularCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.popularImageContainer}>
        <Image source={{ uri: item.image }} style={styles.popularImage} />
        <TouchableOpacity
          style={styles.wishButton}
          onPress={() => setIsWished(!isWished)}
          activeOpacity={0.8}
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
  item: typeof NEARBY_ARTISANS[0];
  distanceLabel: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.nearbyCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nearbyMeta}>{item.category} · {item.location}</Text>
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
  const [wishedExperiences, setWishedExperiences] = useState<typeof POPULAR_EXPERIENCES>([]);

  const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16));
    setActiveBanner(index);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const position = await Location.getCurrentPositionAsync({});
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      } catch (e) {
        console.warn("위치 정보를 가져오지 못했습니다:", e);
      }
    };
    fetchLocation();
  }, []);

  const nearbyArtisans = userCoords
    ? [...NEARBY_ARTISANS].sort(
        (a, b) =>
          getDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng) -
          getDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng)
      )
    : NEARBY_ARTISANS;

  const getDistanceLabel = (item: typeof NEARBY_ARTISANS[0]) =>
    userCoords ? `${getDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng).toFixed(1)}km` : "거리 정보 없음";

  // 다가오는 일정 로드
  useEffect(() => {
    const fetchUpcomingSchedule = async () => {
      try {
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
            image: experience.imageUrl || "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80",
          });
        }
      } catch (e) {
        console.error("다가오는 일정을 불러오는데 실패했습니다:", e);
        // 일정이 없거나 에러 발생 시 섹션을 표시하지 않음 (null 상태 유지)
      }
    };

    fetchUpcomingSchedule();
  }, []);

  // 찜 목록 로드
  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const wishlists = await getMyWishlists();
        const wishCards = wishlists.slice(0, 5).map(mapWishlistToCard);
        setWishedExperiences(wishCards);
      } catch (e) {
        console.error("찜 목록을 불러오는데 실패했습니다:", e);
        // 에러 발생 시 빈 배열 유지
      }
    };

    fetchWishlists();
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
          />
        ))}
      </ScrollView>
    );
  };

  const openExperienceDetail = (exp: any) => {
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
          imageUri: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80",
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
            onMomentumScrollEnd={handleBannerScroll}
          >
            {TOP_BANNERS.map((banner) => (
              <BannerCard key={banner.id} item={banner} />
            ))}
          </ScrollView>
          {/* 페이지 인디케이터 */}
          <View style={styles.dotRow}>
            {TOP_BANNERS.map((_, i) => (
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 장인</Text>
          <TouchableOpacity style={styles.artisanCard} activeOpacity={0.9}>
            <Image source={{ uri: TODAY_ARTISAN.image }} style={styles.artisanImage} />
            <View style={styles.artisanInfo}>
              <View style={styles.artisanBadgeWrap}>
                <Text style={styles.artisanBadge}>{TODAY_ARTISAN.badge}</Text>
              </View>
              <Text style={styles.artisanName}>{TODAY_ARTISAN.name}</Text>
              <Text style={styles.artisanQuote}>{TODAY_ARTISAN.quote}</Text>
              <TouchableOpacity
                style={styles.artisanButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("ArtisanDetail" as any)}
              >
                <Text style={styles.artisanButtonText}>장인 스토리 보기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

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
                onPress={() => navigation.navigate("ArtisanDetail" as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* 찜한 체험 */}
        {wishedExperiences.length > 0 && (
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScroll}
            >
              {wishedExperiences.map((item) => (
                <PopularExperienceCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

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