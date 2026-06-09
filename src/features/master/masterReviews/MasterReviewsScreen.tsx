import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

// ─── 더미 데이터 ───────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: "1",
    userName: "김하루",
    date: "2026.06.01",
    rating: 5,
    className: "이천 도자기 물레 원데이 클래스",
    content: "너무 재밌었어요! 처음 해보는 건데 친절하게 알려주셔서 예쁜 그릇을 만들 수 있었습니다. 다음에 또 오고 싶어요.",
    hasReply: false,
  },
  {
    id: "2",
    userName: "이예솔",
    date: "2026.05.28",
    rating: 4,
    className: "청자 상감 기법 심화반 (4주 과정)",
    content: "심화 과정이라 조금 어려웠지만 유익한 시간이었습니다. 공방 분위기도 너무 좋고 힐링되는 기분이었어요.",
    hasReply: true,
  },
  {
    id: "3",
    userName: "박지민",
    date: "2026.05.20",
    rating: 5,
    className: "어린이를 위한 흙놀이 도예 교실",
    content: "아이들과 함께 갔는데 정말 즐거워했어요. 흙 만지면서 노니까 창의력에도 좋은 것 같고 선생님도 너무 친절하셨어요!",
    hasReply: false,
  },
];

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
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>후기 관리</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="filter" size={22} color={BRAND} />
        </TouchableOpacity>
      </View>

      {/* ── 상단 요약 통계 ── */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>평균 평점</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.summaryValue}>4.9</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>전체 후기</Text>
          <Text style={[styles.summaryValue, { marginTop: 4 }]}>
            128<Text style={styles.summaryUnit}> 개</Text>
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>미답변</Text>
          <Text style={[styles.summaryValue, { marginTop: 4, color: "#E05252" }]}>
            2<Text style={styles.summaryUnit}> 개</Text>
          </Text>
        </View>
      </View>

      {/* ── 후기 리스트 ── */}
      <FlatList
        style={{ flex: 1 }}
        data={MOCK_REVIEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
              {item.hasReply ? (
                <View style={styles.repliedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#166534" />
                  <Text style={styles.repliedText}>답글 완료</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.replyBtn} activeOpacity={0.7}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={BRAND} />
                  <Text style={styles.replyBtnText}>답글 달기</Text>
                </TouchableOpacity>
              )}
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

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 18, fontWeight: "800", color: BRAND },

  summaryContainer: { flexDirection: "row", backgroundColor: CARD, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: BORDER },
  summaryBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },
  summaryLabel: { fontSize: 13, color: GRAY, fontWeight: "600" },
  summaryValue: { fontSize: 22, fontWeight: "800", color: BRAND },
  summaryUnit: { fontSize: 14, fontWeight: "600", color: GRAY },

  listContent: { padding: 20, paddingBottom: 40 },

  card: { backgroundColor: CARD, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAE6E1", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700", color: BRAND, marginBottom: 2 },
  dateText: { fontSize: 12, color: GRAY },
  
  classInfoBox: { backgroundColor: "#FAF9F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  classText: { fontSize: 13, color: GRAY, fontWeight: "500" },
  
  reviewContent: { fontSize: 15, color: "#3B2B26", lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: "row", justifyContent: "flex-end", borderTopWidth: 1, borderTopColor: "#F5F4F0", paddingTop: 12 },
  replyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FAF9F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  replyBtnText: { fontSize: 13, fontWeight: "600", color: BRAND },
  repliedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  repliedText: { fontSize: 13, fontWeight: "600", color: "#166534" },
});