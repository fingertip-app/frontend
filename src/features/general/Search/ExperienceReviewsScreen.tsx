import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getExperienceReviews } from "@/features/reviews/api/reviewsApi";
import { formatScheduleDate } from "@/lib/scheduling";
import type { Review } from "@/types/api";
import { useTheme } from "@/theme/ThemeContext";

export function ExperienceReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ExperienceReviews">>();
  const { experienceId, title } = route.params;
  const { colors } = useTheme();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    getExperienceReviews(experienceId)
      .then((data) => {
        if (isCurrent) setReviews(data);
      })
      .catch(() => {
        if (isCurrent) setReviews([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [experienceId]);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
        <Ionicons name="star" size={16} color={colors.gold} />
        <Text style={[styles.summaryRating, { color: colors.text }]}>
          {reviewCount > 0 ? averageRating.toFixed(1) : "0.0"}
        </Text>
        <Text style={[styles.summaryCount, { color: colors.textSecondary }]}>후기 {reviewCount}개</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= item.rating ? "star" : "star-outline"}
                      size={13}
                      color={colors.gold}
                    />
                  ))}
                </View>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{formatScheduleDate(item.createdAt)}</Text>
              </View>
              <Text style={[styles.cardContent, { color: colors.textSecondary }]}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centerFill}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>아직 등록된 후기가 없습니다.</Text>
            </View>
          }
        />
      )}
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center", marginHorizontal: 8 },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  summaryRating: { fontSize: 16, fontWeight: "700" },
  summaryCount: { fontSize: 13, marginLeft: 4 },

  listContent: { padding: 20, paddingBottom: 40 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardDate: { fontSize: 12 },
  cardContent: { fontSize: 14, lineHeight: 21 },

  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 14 },
});
