import React, { useState, useRef } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const BORDER = "#EAE6E1";
const GRAY = "#8A8077";
const { width: SCREEN_W } = Dimensions.get("window");

// --- 더미 데이터 ---
const PAST_EXPERIENCES = [
  {
    id: "1",
    title: "Seoul Woodworking Class",
    artisan: "목공 장인과 함께하는 달항아리 깎기",
    date: "2023년 10월 14일 체험",
    imageUri: "https://picsum.photos/seed/wood1/300/200",
  },
  {
    id: "2",
    title: "Boseong Green Tea Tea Ceremony",
    artisan: "장인과 함께하는 다도 및 찻잎 따기",
    date: "2023년 9월 28일 체험",
    imageUri: "https://picsum.photos/seed/tea2/300/200",
  },
  {
    id: "3",
    title: "Jeonju Hanji Making Workshop",
    artisan: "전통 한지 제작 및 공예 체험",
    date: "2023년 8월 12일 체험",
    imageUri: "https://picsum.photos/seed/hanji3/300/200",
  },
];

const MY_REVIEWS = [
  {
    id: "1",
    title: "이천 도자기 물레 체험",
    rating: 5,
    date: "2024.05.30",
    content:
      "도자기 물레 체험은 처음이었는데, 장인님께서 정말 친절하게 가르쳐 주셔서 멋진 결과물을 얻을 수 있습니다. 흙의 감촉이 너무 좋았고 마음이 편안해지는 시간이었어요.",
    imageUri: "https://picsum.photos/seed/pottery1/300/200",
  },
  {
    id: "2",
    title: "전주 한지 공예 체험",
    rating: 5,
    date: "2024.04.15",
    content:
      "한지 만드는 과정이 이렇게 정성이 많이 들어가는 줄 몰랐요. 직접 만든 한지로 소품을 접어보니 정말 뜻깊은 시간이었습니다. 장소도 너무 고즈넉하고 여유로웠어요.",
    imageUri: "https://picsum.photos/seed/hanji1/300/200",
  },
  {
    id: "3",
    title: "서울 목공에 원데이 클래스",
    rating: 4,
    date: "2024.03.10",
    content:
      "나무 냄새가 가득한 공방에서 나만의 도마를 만드는 경험이 정말 즐거웠습니다. 초보자도 쉽게 따라할 수 있게 세심하게 봐주셔서 감사했어요. 다음에는 조금 더 긴 수업도 들어보고 싶어요.",
    imageUri: "https://picsum.photos/seed/wood2/300/200",
  },
];

export function MyReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const scrollRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

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
            data={PAST_EXPERIENCES}
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
            data={MY_REVIEWS}
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
                  <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8}>
                    <Text style={styles.deleteBtnText}>삭제하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
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