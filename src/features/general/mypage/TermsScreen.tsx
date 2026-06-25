import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

function Section({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{body}</Text>
    </View>
  );
}

export function TermsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>이용약관</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.noticeBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            아래 내용은 서비스 안내용 약관 초안입니다. 정식 서비스 게시 전 법무 검토에 따라 변경될 수 있습니다.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.docTitle, { color: colors.text }]}>손끝 서비스 이용약관</Text>
          <Section
            title="제1조 목적"
            body="본 약관은 손끝이 제공하는 전통 공예 체험 예약 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정합니다."
          />
          <Section
            title="제2조 서비스의 내용"
            body="손끝은 이용자가 장인 공방 체험 프로그램을 검색하고 예약, 결제, 후기 작성을 할 수 있는 플랫폼을 제공합니다. 체험의 실제 진행은 각 장인 또는 공방의 책임 아래 이루어집니다."
          />
          <Section
            title="제3조 예약 및 취소"
            body="이용자는 서비스 내에서 체험 일정을 예약할 수 있으며, 예약 확정 여부는 장인의 승인에 따릅니다. 취소 및 환불 기준은 체험별 정책과 관련 법령을 따릅니다."
          />
          <Section
            title="제4조 이용자의 의무"
            body="이용자는 서비스 이용 시 관련 법령과 본 약관을 준수해야 하며, 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다."
          />
          <Section
            title="제5조 책임의 제한"
            body="천재지변, 통신 장애, 장인 또는 공방의 사정 등 회사의 귀책 사유가 아닌 사유로 발생한 서비스 이용 장애에 대해서 회사는 책임을 지지 않습니다."
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.docTitle, { color: colors.text }]}>개인정보 처리방침</Text>
          <Section
            title="1. 수집하는 개인정보 항목"
            body="회원가입, 예약, 결제 과정에서 이름, 이메일, 휴대폰 번호, 프로필 이미지 등 서비스 제공에 필요한 최소한의 정보를 수집합니다."
          />
          <Section
            title="2. 개인정보의 이용 목적"
            body="수집된 정보는 회원 식별, 예약 및 결제 처리, 고객 문의 대응, 서비스 개선을 위한 목적으로만 이용됩니다."
          />
          <Section
            title="3. 개인정보 보유 및 이용 기간"
            body="회원 탈퇴 시 관련 법령에서 정한 보관 의무가 없는 경우 즉시 파기합니다."
          />
          <Section
            title="4. 개인정보의 제3자 제공"
            body="회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않으며, 법령상 근거가 있는 경우에만 예외적으로 제공할 수 있습니다."
          />
        </View>
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
  content: { padding: 20, paddingBottom: 40 },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  docTitle: { fontSize: 17, fontWeight: "900", marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 6 },
  sectionBody: { fontSize: 13, lineHeight: 21 },
});
