import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BG = "#F7F4EF";
const BRAND = "#3B2314";
const TEXT = "#1C1410";
const TEXT_S = "#7A6F65";
const BORDER = "#E8E2D9";
const CARD_BG = "#FFFFFF";
const WARN_BG = "#FEF3E2";
const WARN_TEXT = "#92400E";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

export function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warnBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={WARN_TEXT} />
          <Text style={styles.warnText}>
            아래 내용은 법률 검토 전 임시 템플릿입니다. 정식 서비스 게시 전 변호사 검토를 받아주세요.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.docTitle}>이용약관</Text>
          <Section
            title="제1조 (목적)"
            body="이 약관은 장인과 하루(이하 '회사')가 제공하는 전통 공예 체험 중개 서비스(이하 '서비스')의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다."
          />
          <Section
            title="제2조 (서비스의 내용)"
            body="회사는 이용자가 장인(공방) 파트너의 체험 프로그램을 검색, 예약, 결제할 수 있는 플랫폼을 제공합니다. 회사는 체험의 실제 제공 주체가 아니며, 체험의 진행은 각 장인 파트너의 책임 하에 이루어집니다."
          />
          <Section
            title="제3조 (예약 및 취소)"
            body="이용자는 서비스 내에서 체험 일정을 예약할 수 있으며, 예약의 확정 여부는 장인 파트너의 승인에 따릅니다. 예약 취소 및 환불 정책은 체험별로 다르게 적용될 수 있으며, 예약 시 안내된 취소 규정을 따릅니다."
          />
          <Section
            title="제4조 (이용자의 의무)"
            body="이용자는 서비스 이용 시 관계 법령과 이 약관을 준수해야 하며, 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다."
          />
          <Section
            title="제5조 (책임의 제한)"
            body="회사는 천재지변, 장인 파트너의 사정 등 회사의 귀책사유가 없는 사유로 발생한 서비스 이용 장애에 대해서는 책임을 지지 않습니다."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.docTitle}>개인정보 처리방침</Text>
          <Section
            title="1. 수집하는 개인정보 항목"
            body="회사는 회원가입, 예약, 결제 과정에서 이름, 이메일, 휴대폰 번호, 프로필 이미지 등 서비스 제공에 필요한 최소한의 정보를 수집합니다."
          />
          <Section
            title="2. 개인정보의 이용 목적"
            body="수집된 정보는 회원 식별, 예약/결제 처리, 고객 문의 대응, 서비스 개선을 위한 목적으로만 이용됩니다."
          />
          <Section
            title="3. 개인정보의 보유 및 이용 기간"
            body="회원 탈퇴 시 관련 법령에서 정한 보관 의무가 없는 한 즉시 파기합니다."
          />
          <Section
            title="4. 개인정보의 제3자 제공"
            body="회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않으며, 법령에 근거가 있는 경우에만 예외적으로 제공할 수 있습니다."
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
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: TEXT },
  content: { padding: 20, paddingBottom: 40 },
  warnBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: WARN_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  warnText: { flex: 1, fontSize: 12, color: WARN_TEXT, lineHeight: 18 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 16,
  },
  docTitle: { fontSize: 16, fontWeight: "700", color: BRAND, marginBottom: 14 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: TEXT, marginBottom: 4 },
  sectionBody: { fontSize: 13, color: TEXT_S, lineHeight: 20 },
});
