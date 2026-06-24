import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { getMyReservations } from "@/features/reservations/api/reservationsApi";
import { getExperience } from "@/features/experiences/api/experiencesApi";
import { getUserReviews, deleteReview } from "@/features/reviews/api/reviewsApi";
import type { Review } from "@/types/api";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const BORDER = "#EAE6E1";
const GRAY = "#8A8077";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";
const { width: SCREEN_W } = Dimensions.get("window");

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface PastExperienceItem {
  id: string;
  reservationId: number;
  experienceId: number;
  date: string;
  title: string;
  artisan: string;
  imageUri: string;
}

interface MyReviewItem {
  id: string;
  title: string;
  rating: number;
  date: string;
  content: string;
  imageUri: string;
  experienceId: number;
  review: Review;
}

export function MyReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pastExperiences, setPastExperiences] = useState<PastExperienceItem[]>([]);
  const [myReviews, setMyReviews] = useState<MyReviewItem[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadReviewsAndPastExperiences = async () => {
      try {
        setIsLoading(true);
        const profile = await getCurrentProfile();
        if (!profile) return;

        const [completedReservations, reviews] = await Promise.all([
          getMyReservations("COMPLETED"),
          getUserReviews(profile.id),
        ]);

        const reviewedReservationIds = new Set(reviews.map((r) => r.reservationId));

        const pastWithoutReview = completedReservations.filter(
          (r) => !reviewedReservationIds.has(r.id)
        );

        const [pastCards, reviewCards] = await Promise.all([
          Promise.all(
            pastWithoutReview.map(async (r): Promise<PastExperienceItem> => {
              const exp = await getExperience(r.experienceId);
              return {
                id: String(r.id),
                reservationId: r.id,
                experienceId: r.experienceId,
                date: formatDate(r.reservedDateTime),
                title: exp.title,
                artisan: exp.locationAddress || "위치 미정",
                imageUri: exp.images?.[0]?.imageUrl || FALLBACK_IMAGE,
              };
            })
          ),
          Promise.all(
            reviews.map(async (rv): Promise<MyReviewItem> => {
              const exp = await getExperience(rv.experienceId);
              return {
                id: String(rv.id),
                title: exp.title,
                rating: rv.rating,
                date: formatDate(rv.createdAt),
                content: rv.content,
                imageUri: exp.images?.[0]?.imageUrl || FALLBACK_IMAGE,
                experienceId: rv.experienceId,
                review: rv,
              };
            })
          ),
        ]);

        setPastExperiences(pastCards);
        setMyReviews(reviewCards);
      } catch (e) {
        console.error("리뷰/지난 체험 목록을 불러오는데 실패했습니다:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewsAndPastExperiences();
  }, []);

  const handleDeleteReview = (reviewItem: MyReviewItem) => {
    Alert.alert("후기 삭제", "이 후기를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(reviewItem.review.id);
            setMyReviews((prev) => prev.filter((r) => r.id !== reviewItem.id));
          } catch (e) {
            Alert.alert("오류", e instanceof Error ? e.message : "후기 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const switchTab = (idx: 0 | 1) => {
    setActiveTab(idx);
    scrollRef.current?.scrollTo({ x: SCREEN_W * idx, animated: true });
    Animated.spring(indicatorAnim, {
      toValue: idx,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const indicatorTranslate = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_W / 2],
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={BRAND} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 0 ? "후기 작성하기" : "작성한 후기"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => switchTab(0)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
            지난 체험
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => switchTab(1)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
            작성한 후기
          </Text>
        </TouchableOpacity>

        {/* 슬라이딩 인디케이터 */}
        <Animated.View
          style={[
            styles.tabIndicator,
            { transform: [{ translateX: indicatorTranslate }] },
          ]}
        />
      </View>

      {/* 스와이프 가능한 페이지 컨테이너 */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          switchTab(page as 0 | 1);
        }}
        style={{ flex: 1 }}
      >
        {/* ── 페이지 1: 지난 체험 ── */}
        <View style={{ width: SCREEN_W }}>
          <FlatList
            data={pastExperiences}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.pastCardRow}>
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.pastThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.pastCardInfo}>
                    <Text style={styles.pastDateLabel}>{item.date}</Text>
                    <Text style={styles.pastTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.pastSub} numberOfLines={2}>
                      {item.artisan}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.writeBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("Review", {
                      booking: {
                        ...item,
                        time: "",
                        guests: 1,
                        location: "",
                        status: "past",
                      },
                    })
                  }
                >
                  <Text style={styles.writeBtnText}>후기 작성하기</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#D4CDC4" />
                <Text style={styles.emptyText}>작성 가능한 후기가 없습니다.</Text>
              </View>
            }
          />
        </View>

        {/* ── 페이지 2: 작성한 후기 ── */}
        <View style={{ width: SCREEN_W }}>
          <FlatList
            data={myReviews}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {/* 제목 + 별점 + 날짜 */}
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.reviewThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.reviewTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= item.rating ? "star" : "star-outline"}
                          size={14}
                          color="#F59E0B"
                        />
                      ))}
                      <Text style={styles.reviewDate}> {item.date}</Text>
                    </View>
                  </View>
                </View>

                {/* 후기 본문 */}
                <Text style={styles.reviewContent}>{item.content}</Text>

                {/* 삭제 / 수정 버튼 */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.8}
                    onPress={() => handleDeleteReview(item)}
                  >
                    <Text style={styles.deleteBtnText}>삭제하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate("Review", {
                        booking: {
                          id: item.id,
                          reservationId: item.review.reservationId,
                          experienceId: item.experienceId,
                          status: "past",
                          title: item.title,
                          artisan: "",
                          date: item.date,
                          time: "",
                          guests: 1,
                          location: "",
                          imageUri: item.imageUri,
                        },
                        existingReview: item.review,
                      })
                    }
                  >
                    <Text style={styles.editBtnText}>수정하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#D4CDC4" />
                <Text style={styles.emptyText}>아직 작성한 후기가 없습니다.</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },

  // 탭 바
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
    position: "relative",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabText: { fontSize: 14, fontWeight: "500", color: GRAY },
  tabTextActive: { color: BRAND, fontWeight: "700" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SCREEN_W / 2,
    height: 2,
    backgroundColor: BRAND,
    borderRadius: 1,
  },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // 지난 체험 카드
  pastCardRow: { flexDirection: "row", marginBottom: 14 },
  pastThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: "#E8E2D9",
  },
  pastCardInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  pastDateLabel: { fontSize: 11, color: GRAY, marginBottom: 4 },
  pastTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 4, lineHeight: 20 },
  pastSub: { fontSize: 12, color: GRAY, lineHeight: 17 },
  writeBtn: {
    backgroundColor: BRAND,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  writeBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

  // 작성한 후기 카드
  reviewHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  reviewThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#E8E2D9",
  },
  reviewTitle: { fontSize: 15, fontWeight: "700", color: "#1C1107", marginBottom: 6 },
  starsRow: { flexDirection: "row", alignItems: "center" },
  reviewDate: { fontSize: 12, color: GRAY, marginLeft: 4 },
  reviewContent: { fontSize: 13, color: "#4B3D33", lineHeight: 21, marginBottom: 14 },
  reviewActions: { flexDirection: "row", gap: 8 },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  deleteBtnText: { fontSize: 13, fontWeight: "600", color: GRAY },
  editBtn: {
    flex: 1,
    backgroundColor: BRAND,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },

  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 14, color: GRAY },
});