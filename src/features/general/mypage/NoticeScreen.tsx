import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

const NOTICES: { id: string; title: string; date: string; content: string; isNew?: boolean }[] = [
  {
    id: "1",
    title: "손끝 정식 오픈 안내",
    date: "2026-06-20",
    content:
      "전통 공예 체험 예약 플랫폼 손끝이 정식으로 오픈했습니다. 다양한 장인의 체험을 둘러보고 원하는 일정으로 예약해보세요.",
    isNew: true,
  },
  {
    id: "2",
    title: "여름 시즌 체험 프로그램 추가 안내",
    date: "2026-06-15",
    content:
      "전통주, 모시 짜기 등 여름철 인기 체험 프로그램이 새롭게 추가되었습니다. 탐색 화면에서 확인해보세요.",
    isNew: true,
  },
  {
    id: "3",
    title: "서비스 점검 안내",
    date: "2026-06-10",
    content:
      "보다 안정적인 서비스 제공을 위해 시스템 점검이 진행되었습니다. 이용에 불편을 드려 죄송합니다.",
  },
  {
    id: "4",
    title: "개인정보 처리방침 개정 안내",
    date: "2026-05-28",
    content:
      "이용자 보호를 위해 개인정보 처리방침 일부가 개정되었습니다. 마이페이지의 이용약관에서 확인할 수 있습니다.",
  },
];

function NoticeItem({ notice }: { notice: typeof NOTICES[number] }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.8}
      onPress={() => setIsOpen((open) => !open)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <View style={styles.titleRow}>
            {notice.isNew && (
              <View style={[styles.newBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.newBadgeText, { color: colors.bg }]}>NEW</Text>
              </View>
            )}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={isOpen ? undefined : 1}>
              {notice.title}
            </Text>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{notice.date}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </View>
      {isOpen && <Text style={[styles.content, { color: colors.textSecondary }]}>{notice.content}</Text>}
    </TouchableOpacity>
  );
}

export function NoticeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>공지사항</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.leadText, { color: colors.textSecondary }]}>
          손끝 서비스 소식과 운영 안내를 확인하세요.
        </Text>
        {NOTICES.map((notice) => (
          <NoticeItem key={notice.id} notice={notice} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  listContent: { padding: 20, paddingBottom: 40 },
  leadText: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleBlock: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
  newBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: { fontSize: 10, fontWeight: "800" },
  title: { flex: 1, fontSize: 15, fontWeight: "800" },
  date: { fontSize: 12 },
  content: { fontSize: 13, lineHeight: 21, marginTop: 14 },
});
