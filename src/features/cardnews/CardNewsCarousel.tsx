import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";

const { width } = Dimensions.get("window");
// 화면 너비에서 홈 화면의 양옆 여백(24 * 2)을 고려하여 카드 너비 계산
const CARD_WIDTH = width * 0.65;

const DUMMY_NEWS = [
  {
    id: "1",
    title: "K-콘텐츠 속 자수,\n조선 왕실 기법입니다",
    desc: "AI 해설과 전통 자수 체험으로 연결",
    tag: "전통 자수",
    imageUri: "https://images.unsplash.com/photo-1605369680336-6468700a9437?w=400&q=80"
  },
  {
    id: "2",
    title: "천년의 빛을 품은\n나전칠기의 비밀",
    desc: "바다의 보석이 일상 소품으로 재탄생하다",
    tag: "나전칠기",
    imageUri: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80"
  },
  {
    id: "3",
    title: "흙과 불이 빚어낸 예술,\n이천 도자기 마을",
    desc: "가족과 함께하는 주말 도예 체험 가이드",
    tag: "도자기",
    imageUri: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80"
  }
];

export function CardNewsCarousel() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // TODO(영진): 카드뉴스 API와 개인화 정렬을 연결한다.
  return (
    <View style={styles.container}>
      {/* 섹션 헤더 */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📖 한물결 카드뉴스</Text>
        <TouchableOpacity 
          activeOpacity={0.7} 
          hitSlop={8}
          onPress={() => navigation.navigate("CardNewsList")}
        >
          <Text style={styles.viewAllText}>더보기</Text>
        </TouchableOpacity>
      </View>

      {/* 가로 스크롤 캐러셀 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16} // 카드 너비 + 마진
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {DUMMY_NEWS.map((news) => (
          <TouchableOpacity 
            key={news.id} 
            style={styles.card} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("CardNewsDetail", { news })}
          >
            {/* 썸네일 이미지 */}
            <Image source={{ uri: news.imageUri }} style={styles.cardImage} resizeMode="cover" />
            
            {/* 카드 콘텐츠 */}
            <View style={styles.cardBody}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{news.tag}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{news.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={1}>{news.desc}</Text>
            </View>

            {/* 액션 버튼 (공유 / 저장) */}
            {/* <View style={styles.cardFooter}>
              <TouchableOpacity hitSlop={10} style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={18} color="#8A8077" />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={10} style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={18} color="#8A8077" />
              </TouchableOpacity>
            </View> */}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 부모 컨테이너(HomeScreen)의 paddingHorizontal을 뚫고 나가도록 설정할 수도 있지만
    // 일단 깔끔하게 패딩 안쪽에서 보여주도록 설정
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B2B26",
  },
  viewAllText: {
    fontSize: 13,
    color: "#8A8077",
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 10, // 그림자가 잘리지 않도록 여백 추가
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#EAE6E1",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#EAE6E1",
  },
  cardBody: {
    padding: 14,
    minHeight: 100, // 일정한 카드 높이 유지
  },
  tagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F4F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagText: { fontSize: 11, color: "#3B2B26", fontWeight: "600" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#3B2B26", lineHeight: 22, marginBottom: 6 },
  cardDesc: { fontSize: 12, color: "#8A8077" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
});
