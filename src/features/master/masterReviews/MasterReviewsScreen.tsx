import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { useMasterReviews } from "./useMasterReviews";
import { useTheme } from "@/theme/ThemeContext";
import { summarizeReview } from "@/features/reviews/api/reviewsApi";
import { RootStackParamList } from "@/navigation/RootNavigator";

// 별점 렌더링 헬퍼
const renderStars = (rating: number, goldColor: string, emptyColor: string) => {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? goldColor : emptyColor}
        />
      ))}
    </View>
  );
};

export function MasterReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [sortOption, setSortOption] = useState<"latest" | "rating">("latest");
  const { data, isLoading, error, reload } = useMasterReviews();
  const reviews = data?.reviews ?? [];
  const [summarizingReviewId, setSummarizingReviewId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  useEffect(() => {
    if (error) Alert.alert("알림", error.message);
  }, [error]);

  // ── 필터링 및 정렬된 리뷰 목록 계산 ──
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "rating") {
      if (b.rating !== a.rating) return b.rating - a.rating; // 별점 높은 순
    }
    // 기본: 최신순 (날짜 내림차순)
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const unansweredCount = reviews.filter((review) => !review.replyContent).length;

  const handleReplyPress = (item: typeof reviews[number]) => {
    navigation.navigate("MasterReviewReply", { review: item });
  };

  // AI 요약 버튼 핸들러
  const handleSummarizeReview = async (reviewId: number, content: string) => {
    if (!content || content.trim().length === 0) {
      Alert.alert("알림", "요약할 내용이 없습니다.");
      return;
    }

    setSummarizingReviewId(reviewId);
    try {
      const result = await summarizeReview({ content, locale: "ko" });

      const keywords = result.keywords.join(", ");
      const sentiment = result.sentimentScore >= 0.7 ? "😊 긍정적" :
                       result.sentimentScore >= 0.4 ? "😐 중립적" : "😟 부정적";

      Alert.alert(
        "AI 리뷰 요약",
        `📝 요약: ${result.summary}\n\n` +
        `💭 감정: ${sentiment} (${(result.sentimentScore * 100).toFixed(0)}%)\n\n` +
        `🏷️ 키워드: ${keywords}`
      );
    } catch (err) {
      Alert.alert("오류", err instanceof Error ? err.message : "AI 요약에 실패했습니다.");
    } finally {
      setSummarizingReviewId(null);
    }
  };

  // 필터(정렬) 버튼 핸들러
  const handleFilterPress = () => {
    Alert.alert("리뷰 정렬", "정렬 기준을 선택해주세요.", [
      { text: "최신순", onPress: () => setSortOption("latest") },
      { text: "별점 높은 순", onPress: () => setSortOption("rating") },
      { text: "취소", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader
        activeItem="후기"
        rightComponent={
          <TouchableOpacity hitSlop={8} onPress={handleFilterPress} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600" }}>
              {sortOption === "latest" ? "최신순" : "별점순"}
            </Text>
            <Ionicons name="filter" size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* ── 상단 요약 통계 ── */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>평균 평점</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Ionicons name="star" size={24} color={colors.gold} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{(data?.averageRating ?? 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>전체 후기</Text>
          <Text style={[styles.summaryValue, { color: colors.text, marginTop: 4 }]}>
            {data?.reviewCount ?? 0}<Text style={[styles.summaryUnit, { color: colors.textSecondary }]}> 개</Text>
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>미답변</Text>
          <Text style={[styles.summaryValue, { marginTop: 4, color: unansweredCount > 0 ? "#E05252" : colors.text }]}>
            {unansweredCount}
          </Text>
        </View>
      </View>

      {/* ── 미답변 토글 스위치 ── */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>미답변 리뷰만 보기</Text>
        <Switch
          value={false}
          disabled
          trackColor={{ false: "#D1CBC4", true: colors.text }}
          thumbColor={colors.card}
          ios_backgroundColor="#D1CBC4"
          style={Platform.OS === "android" ? { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] } : { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      {/* ── 후기 리스트 ── */}
      <FlatList
        style={{ flex: 1 }}
        data={sortedReviews}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={() => void reload()}
        refreshing={isLoading}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>
              등록된 후기가 없습니다.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* 리뷰 작성자 정보 & 별점 */}
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="person" size={16} color={colors.textSecondary} />
                </View>
                <View>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{item.date}</Text>
                </View>
              </View>
              {renderStars(item.rating, colors.gold, colors.border)}
            </View>

            {/* 클래스 정보 */}
            <View style={[styles.classInfoBox, { backgroundColor: colors.bg }]}>
              <Text style={[styles.classText, { color: colors.textSecondary }]}>체험: {item.className}</Text>
            </View>

            {/* 후기 내용 */}
            <Text style={[styles.reviewContent, { color: colors.text }]}>{item.content}</Text>

            {/* 답글 표시 (있으면) */}
            {item.replyContent && (
              <View style={[styles.replyBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Ionicons name="chatbubble" size={14} color={colors.gold} />
                  <Text style={[styles.replyLabel, { color: colors.gold }]}>장인님의 답글</Text>
                </View>
                <Text style={[styles.replyContent, { color: colors.text }]} numberOfLines={2}>
                  {item.replyContent}
                </Text>
              </View>
            )}

            {/* 하단 액션 (AI 요약, 답글 달기) */}
            <View style={[styles.cardFooter, { borderTopColor: colors.bg }]}>
              <TouchableOpacity
                style={[styles.summaryBtn, { backgroundColor: colors.bg }]}
                activeOpacity={0.7}
                onPress={() => handleSummarizeReview(item.id, item.content)}
                disabled={summarizingReviewId === item.id}
              >
                {summarizingReviewId === item.id ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={16} color={colors.gold} />
                    <Text style={[styles.summaryBtnText, { color: colors.gold }]}>AI 요약</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.replyBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => handleReplyPress(item)}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.text} />
                <Text style={[styles.replyBtnText, { color: colors.text }]}>
                  {item.replyContent ? "답글 수정" : "답글 달기"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="후기" />
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  summaryContainer: { flexDirection: "row", paddingVertical: 20, borderBottomWidth: 1 },
  summaryBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryDivider: { width: 1, marginVertical: 4 },
  summaryLabel: { fontSize: 13, fontWeight: "600" },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryUnit: { fontSize: 14, fontWeight: "600" },

  toggleRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  toggleLabel: { fontSize: 13, fontWeight: "600", marginRight: 6 },

  listContent: { padding: 20, paddingBottom: 40 },

  card: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  dateText: { fontSize: 12 },

  classInfoBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  classText: { fontSize: 13, fontWeight: "500" },

  reviewContent: { fontSize: 15, lineHeight: 22, marginBottom: 12 },

  replyBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  replyLabel: { fontSize: 12, fontWeight: "700" },
  replyContent: { fontSize: 14, lineHeight: 20 },

  cardFooter: { flexDirection: "row", justifyContent: "flex-end", borderTopWidth: 1, paddingTop: 12, gap: 8 },
  summaryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 90, justifyContent: "center" },
  summaryBtnText: { fontSize: 13, fontWeight: "600" },
  replyBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  replyBtnText: { fontSize: 13, fontWeight: "600" },
});
