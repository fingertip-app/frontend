import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { getActiveCardNews } from "@/features/cardnews/api/cardNewsApi";
import { getChungbukCardNews, getChungbukTouristSpots } from "@/features/chungbuk/api/chungbukApi";
import type { CardNews } from "@/types/api";

type FilterOption = "전체" | "전통시장" | "관광명소" | "충북문화";
const FILTERS: FilterOption[] = ["전체", "전통시장", "관광명소", "충북문화"];

interface DisplayItem {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  desc: string;
  relatedExperienceIds: number[];
  category: FilterOption;
}

export function CardNewsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CardNewsList">>();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>(route.params?.initialFilter ?? "전체");

  useEffect(() => {
    const fetchAll = async () => {
      const [springResult, chungbukResult, spotsResult] = await Promise.allSettled([
        getActiveCardNews(),
        getChungbukCardNews(),
        getChungbukTouristSpots(),
      ]);

      const springItems: DisplayItem[] =
        springResult.status === "fulfilled"
          ? springResult.value.map((item: CardNews) => ({
              id: `spring-${item.id}`,
              title: item.title || "제목 없음",
              tag: item.categoryTags?.[0] || item.contentType || "기타",
              imageUrl: item.imageUrl || "",
              desc: item.aiExplanation || "",
              relatedExperienceIds: item.relatedExperienceIds ?? [],
              category: "충북문화" as FilterOption,
            }))
          : [];

      const chungbukItems: DisplayItem[] =
        chungbukResult.status === "fulfilled"
          ? chungbukResult.value.map((item) => ({
              id: `chungbuk-${item.id}`,
              title: item.title,
              tag: "충북문화",
              imageUrl: item.image_url || "",
              desc: item.ai_explanation || "",
              relatedExperienceIds: [],
              category: "충북문화" as FilterOption,
            }))
          : [];

      const spotItems: DisplayItem[] =
        spotsResult.status === "fulfilled"
          ? spotsResult.value.map((spot) => ({
              id: `spot-${spot.id}`,
              title: spot.name,
              tag: spot.category,
              imageUrl: spot.image_url || "",
              desc: spot.intro || spot.address || "",
              relatedExperienceIds: [],
              category: spot.category as FilterOption,
            }))
          : [];

      if (springResult.status === "rejected") {
        console.error("카드뉴스를 불러오는데 실패했습니다:", springResult.reason);
      }
      if (chungbukResult.status === "rejected") {
        console.error("충북 카드뉴스를 불러오는데 실패했습니다:", chungbukResult.reason);
      }
      if (spotsResult.status === "rejected") {
        console.error("충북 전통시장/관광명소를 불러오는데 실패했습니다:", spotsResult.reason);
      }

      setItems([...spotItems, ...chungbukItems, ...springItems]);
      setIsLoading(false);
    };

    fetchAll();
  }, []);

  const filteredItems = items.filter((item) => filter === "전체" || item.category === filter);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
        <Ionicons name="arrow-back" size={24} color="#3B2B26" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>한물결 카드뉴스</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

      <View style={styles.filterRow}>
        {FILTERS.map((option) => {
          const isActive = filter === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setFilter(option)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B2B26" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>표시할 카드뉴스가 없습니다.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("CardNewsDetail", {
                  news: {
                    id: item.id,
                    title: item.title,
                    desc: item.desc,
                    tag: item.tag,
                    imageUri: item.imageUrl,
                    relatedExperienceIds: item.relatedExperienceIds,
                  },
                })
              }
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardBody}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={1}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F0' },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F4F0',
    borderBottomWidth: 1, borderBottomColor: '#EAE6E1'
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#3B2B26" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, flexWrap: "wrap" },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE6E1",
  },
  filterChipActive: { backgroundColor: "#3B2B26", borderColor: "#3B2B26" },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#3B2B26" },
  filterChipTextActive: { color: "#FFFFFF" },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#8A8077", marginTop: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAE6E1",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 180, backgroundColor: "#EAE6E1" },
  cardBody: { padding: 16 },
  tagBadge: { alignSelf: "flex-start", backgroundColor: "#F5F4F0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  tagText: { fontSize: 11, color: "#3B2B26", fontWeight: "600" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#3B2B26", lineHeight: 24, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#8A8077" },
});
