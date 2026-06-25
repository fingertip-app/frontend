import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { deleteAccount, logout } from "@/features/auth/api/authApi";
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
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setIsDeleteModalVisible(false);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
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
            onPress={() => navigation.navigate("ProfileEdit")}
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
            onPress={() => {
              setDeleteError(null);
              setIsDeleteModalVisible(true);
            }}
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

      <Modal
        transparent
        visible={isDeleteModalVisible}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setIsDeleteModalVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.deleteIcon}>
              <Ionicons name="person-remove-outline" size={24} color="#D04040" />
            </View>
            <Text style={[styles.deleteTitle, { color: colors.text }]}>회원 탈퇴</Text>
            <Text style={[styles.deleteDescription, { color: colors.textSecondary }]}>
              탈퇴 후에는 같은 계정으로 다시 로그인할 수 없습니다.
            </Text>
            {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                disabled={isDeleting}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colors.text }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                disabled={isDeleting}
                onPress={() => void handleDeleteAccount()}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteButtonText}>탈퇴</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  deleteModal: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  deleteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteTitle: { fontSize: 19, fontWeight: "800", marginBottom: 8 },
  deleteDescription: { fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 18 },
  deleteError: { color: "#D04040", fontSize: 13, textAlign: "center", marginBottom: 14 },
  modalActions: { width: "100%", flexDirection: "row", gap: 10 },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: { backgroundColor: "#D04040", borderColor: "#D04040" },
  cancelText: { fontSize: 15, fontWeight: "700" },
  deleteButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
