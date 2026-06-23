import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getActiveCardNews } from "@/features/cardnews/api/cardNewsApi";
import type { CardNews } from "@/types/api";

const { width } = Dimensions.get("window");
// 화면 너비에서 홈 화면의 양옆 여백(24 * 2)을 고려하여 카드 너비 계산
const CARD_WIDTH = width * 0.65;

// CardNews를 UI 형식으로 변환
interface CardNewsUI {
  id: string;
  title: string;
  desc: string;
  tag: string;
  imageUri: string;
}

function mapCardNewsToUI(cardNews: CardNews): CardNewsUI {
  // 첫 번째 카테고리 태그 사용, 없으면 contentType 사용
  const tag = cardNews.categoryTags && cardNews.categoryTags.length > 0
    ? cardNews.categoryTags[0]
    : cardNews.contentType || "전통문화";

  return {
    id: String(cardNews.id),
    title: cardNews.title,
    desc: cardNews.aiExplanation || "AI가 설명하는 전통문화 이야기",
    tag: tag,
    imageUri: cardNews.imageUrl || "https://images.unsplash.com/photo-1605369680336-6468700a9437?w=400&q=80"
  };
}

export function CardNewsCarousel() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardNews, setCardNews] = useState<CardNewsUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardNews = async () => {
      try {
        setIsLoading(true);
        const activeNews = await getActiveCardNews();
        const uiNews = activeNews.slice(0, 5).map(mapCardNewsToUI);
        setCardNews(uiNews);
      } catch (e) {
        console.error("카드뉴스를 불러오는데 실패했습니다:", e);
        // 에러 발생 시 빈 배열 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardNews();
  }, []);
  // 카드뉴스가 없으면 섹션 전체를 숨김
  if (!isLoading && cardNews.length === 0) {
    return null;
  }

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

      {/* 로딩 상태 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B2B26" />
        </View>
      ) : (
        /* 가로 스크롤 캐러셀 */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + 16} // 카드 너비 + 마진
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {cardNews.map((news) => (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
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
