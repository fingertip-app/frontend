import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "@/features/auth/api/authApi";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useTheme, ThemeMode } from "@/theme/ThemeContext";

type RowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
};

function Row({ icon, label, value, onPress, danger }: RowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIconBox}>{icon}</View>
        <Text style={[styles.rowLabel, { color: danger ? "#D04040" : colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={danger ? "#D04040" : colors.border}
        />
      </View>
    </TouchableOpacity>
  );
}

const THEME_LABEL: Record<ThemeMode, string> = {
  light: "라이트",
  dark: "다크",
  auto: "시스템 설정",
};

const THEME_ORDER: ThemeMode[] = ["light", "dark", "auto"];

export function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { mode, setMode, colors } = useTheme();

  const handleCycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];
    setMode(next);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch {
            Alert.alert("오류", "로그아웃에 실패했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 계정 설정 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>계정 설정</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row
            icon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
            label="프로필 수정"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Row
            icon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
            label="비밀번호 변경"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Row
            icon={<Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />}
            label="알림 설정"
          />
        </View>

        {/* ── 앱 환경설정 ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 28 }]}>앱 환경설정</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row
            icon={<Ionicons name="globe-outline" size={18} color={colors.textSecondary} />}
            label="언어 (Language)"
            value="한국어"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Row
            icon={<Ionicons name="contrast-outline" size={18} color={colors.textSecondary} />}
            label="테마"
            value={THEME_LABEL[mode]}
            onPress={handleCycleTheme}
          />
        </View>

        {/* ── 로그아웃 / 회원탈퇴 ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 28 }]}>
          <Row
            icon={<Ionicons name="log-out-outline" size={18} color={colors.textSecondary} />}
            label="로그아웃"
            onPress={handleLogout}
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Row
            icon={<Ionicons name="person-remove-outline" size={18} color="#D04040" />}
            label="회원 탈퇴"
            danger
          />
        </View>

        {/* ── 버전 / 저작권 ── */}
        <View style={styles.versionBlock}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>버전 2.4.1 (최신 버전)</Text>
          <Text style={styles.copyrightText}>
            © 2024 Fingertip. All rights reserved.
          </Text>
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
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 10,
    marginLeft: 2,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowIconBox: { width: 22, alignItems: "center" },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowValue: { fontSize: 14 },

  separator: {
    height: 1,
    marginLeft: 50,
  },

  versionBlock: {
    alignItems: "center",
    marginTop: 36,
    gap: 4,
  },
  versionText: { fontSize: 12 },
  copyrightText: { fontSize: 11, color: "#B0A89E" },
});