import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { getExperience } from "@/features/experiences/api/experiencesApi";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme/ThemeContext";
import type { Experience } from "@/types/api";

export function MasterExperienceDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MasterExperienceDetail">>();
  const { colors } = useTheme();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExperience(route.params.experienceId)
      .then(setExperience)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "체험 정보를 불러오지 못했습니다.");
      });
  }, [route.params.experienceId]);

  if (!experience && !error) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>체험 상세정보</Text>
        <View style={{ width: 26 }} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{error}</Text>
        </View>
      ) : experience ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {experience.images?.[0]?.imageUrl ? (
            <Image source={{ uri: experience.images[0].imageUrl }} style={styles.heroImage} />
          ) : null}

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.category, { color: colors.accent }]}>{experience.category}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{experience.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: experience.isActive ? colors.text : colors.border }]}>
              <Text style={[styles.statusText, { color: colors.bg }]}>
                {experience.isActive ? "운영 중" : "비활성"}
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow label="가격" value={`${Number(experience.price).toLocaleString("ko-KR")}원`} colors={colors} />
            <InfoRow label="소요 시간" value={`${experience.durationMinutes}분`} colors={colors} />
            <InfoRow label="최대 인원" value={`${experience.maxParticipants}명`} colors={colors} />
            <InfoRow label="난이도" value={experience.difficulty} colors={colors} />
            <InfoRow label="장소" value={experience.locationAddress || "미등록"} colors={colors} />
          </View>

          <Section title="체험 소개" body={experience.description} colors={colors} />
          <Section title="문화 이야기" body={experience.culturalStory} colors={colors} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>운영 일정</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {experience.schedules?.length ? (
              experience.schedules.map((schedule) => (
                <View key={schedule.id} style={styles.scheduleRow}>
                  <Text style={[styles.scheduleDate, { color: colors.text }]}>
                    {new Date(schedule.scheduledAt).toLocaleString("ko-KR")}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    잔여 {schedule.remainingSlots}/{schedule.availableSlots}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary }}>등록된 일정이 없습니다.</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.text }]}
            onPress={() =>
              navigation.navigate("MasterExperienceCreate", { experienceId: experience.id })
            }
          >
            <Ionicons name="pencil-outline" size={17} color={colors.bg} />
            <Text style={[styles.editButtonText, { color: colors.bg }]}>체험 수정</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  body,
  colors,
}: {
  title: string;
  body?: string | null;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
        {body || "등록된 내용이 없습니다."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 40 },
  heroImage: { width: "100%", height: 240, borderRadius: 16, marginBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  category: { fontSize: 13, fontWeight: "700", marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 31 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  infoCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16, marginBottom: 12 },
  infoLabel: { fontSize: 14 },
  infoValue: { flex: 1, fontSize: 14, fontWeight: "600", textAlign: "right" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  scheduleRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  scheduleDate: { flex: 1, fontSize: 13, fontWeight: "600" },
  editButton: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  editButtonText: { fontSize: 15, fontWeight: "700" },
});
