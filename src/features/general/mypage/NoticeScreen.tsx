import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BG = "#F7F4EF";
const BRAND = "#3B2314";
const TEXT = "#1C1410";
const TEXT_S = "#7A6F65";
const BORDER = "#E8E2D9";
const CARD_BG = "#FFFFFF";
const NEW_BG = "#FEF3E2";
const NEW_TEXT = "#92400E";

// TODO: 백엔드 Notice API 연동 전까지 사용하는 더미 데이터
const NOTICES: { id: string; title: string; date: string; content: string; isNew?: boolean }[] = [
  {
    id: "1",
    title: "장인과 하루 정식 오픈 안내",
    date: "2026-06-20",
    content: "전통 공예 체험 예약 플랫폼 '장인과 하루'가 정식으로 오픈했습니다. 다양한 장인들의 체험을 둘러보고 예약해보세요.",
    isNew: true,
  },
  {
    id: "2",
    title: "여름 시즌 체험 프로그램 추가 안내",
    date: "2026-06-15",
    content: "전통주, 모시짜기 등 여름철 인기 체험 프로그램이 새롭게 추가되었습니다. 탐색 탭에서 확인해보세요.",
    isNew: true,
  },
  {
    id: "3",
    title: "서비스 점검 안내 (완료)",
    date: "2026-06-10",
    content: "보다 안정적인 서비스 제공을 위해 시스템 점검을 진행했습니다. 이용에 불편을 드려 죄송합니다.",
  },
  {
    id: "4",
    title: "개인정보 처리방침 개정 안내",
    date: "2026-05-28",
    content: "이용자 보호를 위해 개인정보 처리방침 일부가 개정되었습니다. 마이페이지 > 이용약관에서 확인할 수 있습니다.",
  },
];

function NoticeItem({ notice }: { notice: typeof NOTICES[number] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            {notice.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            <Text style={styles.title} numberOfLines={isOpen ? undefined : 1}>{notice.title}</Text>
          </View>
          <Text style={styles.date}>{notice.date}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={TEXT_S} />
      </View>
      {isOpen && <Text style={styles.content}>{notice.content}</Text>}
    </TouchableOpacity>
  );
}

export function NoticeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {NOTICES.map((notice) => (
          <NoticeItem key={notice.id} notice={notice} />
        ))}
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
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: TEXT },
  listContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  newBadge: {
    backgroundColor: NEW_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: { fontSize: 10, fontWeight: "700", color: NEW_TEXT },
  title: { flex: 1, fontSize: 14, fontWeight: "600", color: TEXT },
  date: { fontSize: 12, color: TEXT_S },
  content: { fontSize: 13, color: TEXT_S, lineHeight: 20, marginTop: 12 },
});
