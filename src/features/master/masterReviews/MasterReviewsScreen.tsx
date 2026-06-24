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
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { MasterHeader } from "../components/MasterHeader";
import { useMasterReviews } from "./useMasterReviews";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

// 별점 렌더링 헬퍼
const renderStars = (rating: number) => {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#F59E0B" : "#D4CDC4"}
        />
      ))}
    </View>
  );
};

export function MasterReviewsScreen() {
  const [sortOption, setSortOption] = useState<"latest" | "rating">("latest");
  const { data, isLoading, error, reload } = useMasterReviews();
  const reviews = data?.reviews ?? [];

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

  const handleUnsupportedReply = () => {
    Alert.alert("알림", "후기 답글 기능은 백엔드 API 구현이 필요합니다.");
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
    <SafeAreaView style={styles.safeArea}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader 
        activeItem="후기" 
        rightComponent={
          <TouchableOpacity hitSlop={8} onPress={handleFilterPress} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 13, color: BRAND, fontWeight: "600" }}>
              {sortOption === "latest" ? "최신순" : "별점순"}
            </Text>
            <Ionicons name="filter" size={18} color={BRAND} />
          </TouchableOpacity>
        }
      />

      {/* ── 상단 요약 통계 ── */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>평균 평점</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.summaryValue}>{(data?.averageRating ?? 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>전체 후기</Text>
          <Text style={[styles.summaryValue, { marginTop: 4 }]}>
            {data?.reviewCount ?? 0}<Text style={styles.summaryUnit}> 개</Text>
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>미답변</Text>
          <Text style={[styles.summaryValue, { marginTop: 4, color: "#E05252" }]}>
            -
          </Text>
        </View>
      </View>

      {/* ── 미답변 토글 스위치 ── */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>미답변 리뷰만 보기 (준비 중)</Text>
        <Switch
          value={false}
          disabled
          trackColor={{ false: "#D1CBC4", true: BRAND }}
          thumbColor={CARD}
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
            <ActivityIndicator color={BRAND} style={{ marginTop: 40 }} />
          ) : (
            <Text style={{ color: GRAY, textAlign: "center", marginTop: 40 }}>
              등록된 후기가 없습니다.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* 리뷰 작성자 정보 & 별점 */}
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={16} color="#A39B92" />
                </View>
                <View>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
              {renderStars(item.rating)}
            </View>

            {/* 클래스 정보 */}
            <View style={styles.classInfoBox}>
              <Text style={styles.classText}>체험: {item.className}</Text>
            </View>

            {/* 후기 내용 */}
            <Text style={styles.reviewContent}>{item.content}</Text>

            {/* 하단 액션 (답글 달기) */}
            <View style={styles.cardFooter}>
              <TouchableOpacity 
                style={styles.replyBtn} 
                activeOpacity={0.7}
                onPress={handleUnsupportedReply}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={BRAND} />
                <Text style={styles.replyBtnText}>답글 기능 준비 중</Text>
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
  safeArea: { flex: 1, backgroundColor: BG },

  summaryContainer: { flexDirection: "row", backgroundColor: CARD, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: BORDER },
  summaryBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },
  summaryLabel: { fontSize: 13, color: GRAY, fontWeight: "600" },
  summaryValue: { fontSize: 22, fontWeight: "800", color: BRAND },
  summaryUnit: { fontSize: 14, fontWeight: "600", color: GRAY },

  toggleRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  toggleLabel: { fontSize: 13, color: GRAY, fontWeight: "600", marginRight: 6 },

  listContent: { padding: 20, paddingBottom: 40 },

  card: { backgroundColor: CARD, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAE6E1", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700", color: BRAND, marginBottom: 2 },
  dateText: { fontSize: 12, color: GRAY },
  
  classInfoBox: { backgroundColor: "#FAF9F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  classText: { fontSize: 13, color: GRAY, fontWeight: "500" },
  
  reviewContent: { fontSize: 15, color: "#3B2B26", lineHeight: 22, marginBottom: 12 },

  replyBox: { backgroundColor: "#F5F4F0", borderRadius: 10, padding: 14, marginBottom: 16 },
  replyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  replyTitle: { fontSize: 13, fontWeight: "700", color: BRAND },
  replyText: { fontSize: 14, color: "#5C5651", lineHeight: 20 },
  
  cardFooter: { flexDirection: "row", justifyContent: "flex-end", borderTopWidth: 1, borderTopColor: "#F5F4F0", paddingTop: 12 },
  replyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FAF9F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  replyBtnText: { fontSize: 13, fontWeight: "600", color: BRAND },
  repliedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  repliedText: { fontSize: 13, fontWeight: "600", color: "#166534" },
  actionText: { fontSize: 13, fontWeight: "600", color: GRAY, paddingVertical: 4 },
});
