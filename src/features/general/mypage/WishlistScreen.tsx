import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getMyWishlists, removeFromWishlist } from "@/features/wishlists/api/wishlistsApi";
import { useTheme } from "@/theme/ThemeContext";
import type { Wishlist } from "@/types/api";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";

export function WishlistScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyWishlists();
      setWishlists(data);
    } catch {
      Alert.alert("알림", "찜 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlists();
    }, [loadWishlists]),
  );

  const handleRemove = async (experienceId: number) => {
    try {
      await removeFromWishlist(experienceId);
      setWishlists((prev) => prev.filter((item) => item.experienceId !== experienceId));
    } catch {
      Alert.alert("알림", "찜 해제에 실패했습니다.");
    }
  };

  const openExperienceDetail = (item: Wishlist) => {
    navigation.navigate("MainTabs", {
      screen: "Explore",
      params: {
        exp: {
          id: String(item.experienceId),
          title: item.experienceTitle,
          category: item.experienceCategory || "기타",
          location: item.experienceLocation || "위치 미정",
          artisan: "장인",
          rating: Number(((item.averageRating ?? item.rating) ?? 0).toFixed(1)),
          reviewCount: item.reviewCount ?? 0,
          duration: item.experienceDurationMinutes ? `${item.experienceDurationMinutes}분` : "시간 미정",
          price: Number(item.experiencePrice) || 0,
          tags: [],
          imageUri: item.experienceImageUrl || PLACEHOLDER_IMAGE,
          difficulty: "초급",
        },
      },
    });
  };

  const renderWishlist = ({ item }: { item: Wishlist }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.88}
      onPress={() => openExperienceDetail(item)}
    >
      <Image source={{ uri: item.experienceImageUrl || PLACEHOLDER_IMAGE }} style={styles.cardImage} />
      <TouchableOpacity
        style={[styles.heartButton, { backgroundColor: colors.bg, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={(event) => {
          event.stopPropagation();
          handleRemove(item.experienceId);
        }}
      >
        <Ionicons name="heart" size={18} color={colors.accent} />
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <View style={styles.metaRow}>
          <Text style={[styles.categoryText, { color: colors.accent }]} numberOfLines={1}>
            {item.experienceCategory || "공방 체험"}
          </Text>
          <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.experienceLocation || "위치 미정"}
          </Text>
        </View>
        <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
          {item.experienceTitle}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={[styles.priceText, { color: colors.text }]}>
            {Number(item.experiencePrice || 0).toLocaleString()}원
          </Text>
          <View style={[styles.ratingPill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {Number(((item.averageRating ?? item.rating) ?? 0).toFixed(1))}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>찜한 체험</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={wishlists}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderWishlist}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="heart-outline" size={34} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>아직 찜한 체험이 없습니다</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                마음에 드는 공방 체험을 저장해두면 여기서 다시 볼 수 있어요.
              </Text>
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
  headerTitle: { fontSize: 18, fontWeight: "800" },
  listContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardImage: { width: "100%", height: 164 },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { padding: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  categoryText: { maxWidth: "42%", fontSize: 12, fontWeight: "800" },
  dot: { fontSize: 12 },
  locationText: { flex: 1, fontSize: 12 },
  titleText: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceText: { fontSize: 17, fontWeight: "800" },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  ratingText: { fontSize: 12, fontWeight: "700" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 100 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { marginTop: 16, fontSize: 17, fontWeight: "800" },
  emptyDesc: { marginTop: 8, fontSize: 14, lineHeight: 20, textAlign: "center", paddingHorizontal: 28 },
});
