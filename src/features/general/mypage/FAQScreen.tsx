import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "체험은 어떻게 예약하나요?",
    answer:
      "탐색 화면에서 원하는 체험을 선택한 뒤 날짜와 시간을 고르고 예약 요청을 보내면 됩니다. 장인이 예약을 승인하면 예약 내역에서 상태를 확인할 수 있어요.",
  },
  {
    question: "예약을 취소하면 환불이 가능한가요?",
    answer:
      "예약 내역에서 취소를 요청할 수 있습니다. 체험 시작일까지 남은 기간과 각 체험의 운영 정책에 따라 환불 규정이 달라질 수 있습니다.",
  },
  {
    question: "장인으로 활동하려면 어떻게 하나요?",
    answer:
      "로그인 후 장인 신청 메뉴에서 프로필과 인증 정보를 제출하면 됩니다. 운영팀 확인 후 장인 계정으로 전환됩니다.",
  },
  {
    question: "후기는 언제 작성할 수 있나요?",
    answer:
      "체험이 완료된 예약에 대해서만 후기를 작성할 수 있습니다. 마이페이지의 후기 작성 또는 예약 상세 화면에서 확인해보세요.",
  },
  {
    question: "찜한 체험은 어디서 확인하나요?",
    answer:
      "마이페이지의 찜한 체험에서 모아볼 수 있습니다. 체험 상세 화면의 하트 아이콘으로 언제든 찜하거나 취소할 수 있어요.",
  },
  {
    question: "회원 탈퇴는 어떻게 하나요?",
    answer:
      "마이페이지 하단의 회원탈퇴 메뉴에서 진행할 수 있습니다. 탈퇴 후 계정 정보와 이용 내역은 복구할 수 없으니 신중히 결정해주세요.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.8}
      onPress={() => setIsOpen((open) => !open)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.questionMark, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.questionMarkText, { color: colors.accent }]}>Q</Text>
        </View>
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </View>
      {isOpen && <Text style={[styles.answer, { color: colors.textSecondary }]}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export function FAQScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>자주 묻는 질문</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.leadText, { color: colors.textSecondary }]}>
          예약, 취소, 후기와 계정 이용에 대한 안내를 모았습니다.
        </Text>
        {FAQ_ITEMS.map((item) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} />
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
    alignItems: "center",
    gap: 10,
  },
  questionMark: {
    width: 30,
    height: 30,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionMarkText: { fontSize: 14, fontWeight: "900" },
  question: { flex: 1, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  answer: { fontSize: 13, lineHeight: 21, marginTop: 14, paddingLeft: 40 },
});
