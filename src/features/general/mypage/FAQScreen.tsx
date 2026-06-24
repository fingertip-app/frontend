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

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "체험은 어떻게 예약하나요?",
    answer: "탐색 탭에서 원하는 체험을 선택한 뒤, 원하는 날짜와 시간을 골라 예약 신청을 보내면 됩니다. 장인(공방)이 예약을 확정하면 예약 내역에서 확인할 수 있어요.",
  },
  {
    question: "예약을 취소하고 싶어요. 환불이 가능한가요?",
    answer: "예약 내역에서 취소를 요청할 수 있습니다. 체험 시작일까지 남은 기간에 따라 환불 규정이 다를 수 있으니, 예약 상세 화면의 취소/환불 안내를 확인해주세요.",
  },
  {
    question: "장인(공방) 파트너는 어떻게 신청하나요?",
    answer: "로그인 화면에서 '장인으로 시작하기'를 선택해 파트너 신청을 진행할 수 있습니다. 신청 후 운영팀의 승인을 거쳐 장인 계정으로 전환됩니다.",
  },
  {
    question: "후기는 언제 작성할 수 있나요?",
    answer: "체험이 완료된 예약에 대해서만 후기를 작성할 수 있습니다. 마이페이지의 '후기 작성'에서 작성 가능한 예약을 확인해보세요.",
  },
  {
    question: "찜한 체험은 어디서 확인하나요?",
    answer: "마이페이지의 '찜한 체험'에서 모아볼 수 있습니다. 체험 상세 화면의 하트 아이콘으로 언제든 찜하거나 취소할 수 있어요.",
  },
  {
    question: "회원 탈퇴는 어떻게 하나요?",
    answer: "마이페이지 하단의 '회원탈퇴' 메뉴에서 진행할 수 있습니다. 탈퇴 시 계정 정보 및 이용 내역이 삭제되며 복구가 불가능하니 신중히 결정해주세요.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.cardHeader}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={TEXT_S} />
      </View>
      {isOpen && <Text style={styles.answer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export function FAQScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자주 묻는 질문</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {FAQ_ITEMS.map((item) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} />
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  question: { flex: 1, fontSize: 14, fontWeight: "600", color: TEXT, marginRight: 8 },
  answer: { fontSize: 13, color: TEXT_S, lineHeight: 20, marginTop: 12 },
});
