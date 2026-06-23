import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyWishlists, removeFromWishlist } from "@/features/wishlists/api/wishlistsApi";
import type { Wishlist } from "@/types/api";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80";

export function WishlistScreen() {
  const navigation = useNavigation();
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
    }, [loadWishlists])
  );

  const handleRemove = async (experienceId: number) => {
    try {
      await removeFromWishlist(experienceId);
      setWishlists((prev) => prev.filter((w) => w.experienceId !== experienceId));
    } catch {
      Alert.alert("알림", "찜 해제에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>찜한 체험</Text>
        {/* 중앙 정렬용 여백 */}
        <View style={{ width: 24 }} /> 
      </View>

      {/* ── 찜한 목록 ── */}
      {isLoading ? (
        <ActivityIndicator color="#3B2B26" style={{ marginTop: 40 }} />
      ) : (
      <FlatList
        data={wishlists}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image source={{ uri: item.experienceImageUrl || PLACEHOLDER_IMAGE }} style={styles.cardImage} />

            {/* 좋아요 하트 버튼 */}
            <TouchableOpacity
              style={styles.heartButton}
              activeOpacity={0.8}
              onPress={() => handleRemove(item.experienceId)}
            >
              <Ionicons name="heart" size={20} color="#EF4444" />
            </TouchableOpacity>

            <View style={styles.cardInfo}>
              <Text style={styles.categoryText}>{item.experienceLocation} · {item.experienceCategory}</Text>
              <Text style={styles.titleText} numberOfLines={1}>{item.experienceTitle}</Text>
              <Text style={styles.priceText}>{item.experiencePrice.toLocaleString()}원~</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#D4CDC4" />
            <Text style={styles.emptyText}>아직 찜한 체험이 없습니다.</Text>
          </View>
        }
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4EF" },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E8E2D9", backgroundColor: "#F7F4EF" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },
  
  listContent: { padding: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardImage: { width: "100%", height: 160, backgroundColor: "#E8E2D9" },
  
  heartButton: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(255,255,255,0.9)", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  
  cardInfo: { padding: 16 },
  categoryText: { fontSize: 12, color: "#8A8077", marginBottom: 4 },
  titleText: { fontSize: 16, fontWeight: "bold", color: "#1C1107", marginBottom: 8 },
  priceText: { fontSize: 16, fontWeight: "800", color: "#3B2314" },
  
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: "#8A8077" },
});