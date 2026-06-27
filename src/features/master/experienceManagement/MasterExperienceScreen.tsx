import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MasterBottomTabs } from "../components/MasterBottomTabs";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MasterHeader } from "../components/MasterHeader";
import { useExperienceManagement } from "./useExperienceManagement";
import { getMyArtisan } from "@/features/artisans/api/artisanApi";
import { deleteExperience } from "@/features/experiences/api/experiencesApi";
import { useTheme } from "@/theme/ThemeContext";

export function MasterExperienceScreen({
  onMenuPress,
  onNotificationPress,
}: {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { data, isLoading, error, reload } = useExperienceManagement();
  const experiences = data?.experiences ?? [];
  const [menuExperienceId, setMenuExperienceId] = useState<number | null>(null);
  const [deleteExperienceId, setDeleteExperienceId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  useEffect(() => {
    if (error) Alert.alert("오류", error.message);
  }, [error]);

  const handleMorePress = (id: number) => {
    setMenuExperienceId(id);
  };

  const confirmDelete = (id: number) => {
    setDeleteError(null);
    setDeleteExperienceId(id);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const artisan = await getMyArtisan();
      await deleteExperience(artisan.id, id);
      await reload();
      setDeleteExperienceId(null);
      setSuccessMessage("체험이 삭제되었습니다.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (deleteError) {
      setDeleteError(
        deleteError instanceof Error ? deleteError.message : "체험 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 공통 상단바 및 서랍 ── */}
      <MasterHeader activeItem="체험관리" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 요약 통계 2칸 ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 8 }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>운영 승인 체험</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{data?.activeExperienceCount ?? 0}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>총 후기 수</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{data?.reviewCount ?? 0}</Text>
          </View>
        </View>

        {/* ── 나의 체험 목록 헤더 ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>나의 체험 목록</Text>
        </View>

        {isLoading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />}

        {!isLoading && experiences.length === 0 && (
          <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 20 }}>
            등록된 체험이 없습니다. 새 체험을 등록해보세요.
          </Text>
        )}

        {/* ── 체험 카드 목록 ── */}
        {!isLoading && experiences.map((item) => (
          <View key={item.id} style={[styles.experienceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* 이미지 + ACTIVE 뱃지 */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.active ? colors.text : "rgba(90,75,68,0.75)" },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.bg }]}>{item.statusLabel}</Text>
              </View>
            </View>

            {/* 카드 하단 정보 */}
            <View style={styles.cardBody}>
              {/* 제목 + 더보기 */}
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <TouchableOpacity hitSlop={8} onPress={() => handleMorePress(item.id)}>
                  <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* 예약 건수 · 평점 */}
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                {item.bookings > 0
                  ? `예약 ${item.bookings}건 | 평점 ${item.rating}`
                  : `최근 진행 없음 | 평점 ${item.rating}`}
              </Text>

              {/* 수정 · 상세 */}
              <View style={styles.cardActions}>
                <View style={styles.cardActionsLeft}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={6}
                    onPress={() =>
                      navigation.navigate("MasterExperienceCreate", { experienceId: item.id })
                    }
                  >
                    <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={6}
                    onPress={() =>
                      navigation.navigate("MasterExperienceDetail", { experienceId: item.id })
                    }
                  >
                    <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>상세</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── 새 체험 등록 FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.text, shadowColor: colors.text }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Step1BasicInfo")}
      >
        <Ionicons name="add" size={16} color={colors.bg} />
        <Text style={[styles.fabText, { color: colors.bg }]}>새체험 등록</Text>
      </TouchableOpacity>

      {/* ── 하단 탭 바 ── */}
      <MasterBottomTabs activeTab="체험관리" />

      <Modal
        transparent
        visible={menuExperienceId !== null}
        animationType="fade"
        onRequestClose={() => setMenuExperienceId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuExperienceId(null)}>
          <Pressable
            style={[styles.actionMenu, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const id = menuExperienceId;
                setMenuExperienceId(null);
                if (id !== null) {
                  navigation.navigate("MasterExperienceCreate", { experienceId: id });
                }
              }}
            >
              <Ionicons name="pencil-outline" size={19} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>체험 수정</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const id = menuExperienceId;
                setMenuExperienceId(null);
                if (id !== null) confirmDelete(id);
              }}
            >
              <Ionicons name="trash-outline" size={19} color="#D64545" />
              <Text style={[styles.menuText, { color: "#D64545" }]}>체험 삭제</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={deleteExperienceId !== null}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setDeleteExperienceId(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.confirmModal, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.deleteIcon}>
              <Ionicons name="trash-outline" size={24} color="#D64545" />
            </View>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>체험을 삭제할까요?</Text>
            <Text style={[styles.confirmDescription, { color: colors.textSecondary }]}>
              삭제된 체험은 복구할 수 없습니다.
            </Text>
            {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, { borderColor: colors.border }]}
                disabled={isDeleting}
                onPress={() => setDeleteExperienceId(null)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                disabled={isDeleting}
                onPress={() => {
                  if (deleteExperienceId !== null) void handleDelete(deleteExperienceId);
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteButtonText}>삭제</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {successMessage ? (
        <View style={[styles.toast, { backgroundColor: colors.text }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.bg} />
          <Text style={[styles.toastText, { color: colors.bg }]}>{successMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  // 통계 2칸
  statsRow: { flexDirection: "row", marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  statLabel: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800" },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  moreLink: { fontSize: 13 },

  // 체험 카드
  experienceCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // 이미지 영역
  imageWrapper: { position: "relative" },
  cardImage: { width: "100%", height: 180 },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },

  // 카드 하단
  cardBody: { padding: 14 },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 13, marginBottom: 14 },

  // 하단 액션 행
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardActionsLeft: { flexDirection: "row", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtnText: { fontSize: 13, fontWeight: "500" },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { fontSize: 14, fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  actionMenu: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: { fontSize: 15, fontWeight: "600" },
  menuDivider: { height: 1 },
  confirmModal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
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
  confirmTitle: { fontSize: 19, fontWeight: "800", marginBottom: 8 },
  confirmDescription: { fontSize: 14, textAlign: "center", marginBottom: 18 },
  deleteErrorText: {
    color: "#D64545",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  confirmActions: { width: "100%", flexDirection: "row", gap: 10 },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: { backgroundColor: "#D64545", borderColor: "#D64545" },
  cancelButtonText: { fontSize: 15, fontWeight: "700" },
  deleteButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  toast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
  },
  toastText: { fontSize: 14, fontWeight: "700" },

});
