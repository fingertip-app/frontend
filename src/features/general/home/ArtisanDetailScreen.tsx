import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ArtisanMap } from "@/components/map/ArtisanMap";
import { getArtisan } from "@/features/artisans/api/artisanApi";
import type { Artisan } from "@/types/api";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type ArtisanDetailRouteProp = RouteProp<RootStackParamList, "ArtisanDetail">;

export function ArtisanDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ArtisanDetailRouteProp>();
  const { artisanId } = route.params;

  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtisan() {
      try {
        setLoading(true);
        setError(null);
        const data = await getArtisan(artisanId);
        setArtisan(data);
      } catch (err) {
        console.error("Failed to load artisan:", err);
        setError("장인 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadArtisan();
  }, [artisanId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B2B26" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !artisan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#3B2B26" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>장인 스토리</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#8B6F5E" />
          <Text style={styles.errorText}>{error || "장인 정보를 찾을 수 없습니다."}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 지도 표시 여부 확인
  const hasLocation = artisan.latitude !== null && artisan.longitude !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장인 스토리</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 상세 내용 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: artisan.profileImageUrl || "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80" }}
          style={styles.heroImage}
        />

        <View style={styles.content}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badge}>{artisan.heritageCategory}</Text>
          </View>
          <Text style={styles.title}>{artisan.name}</Text>
          {artisan.bio && (
            <Text style={styles.quote}>"{artisan.bio.substring(0, 100)}"</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>장인의 이야기</Text>
          <Text style={styles.description}>
            {artisan.bio || "전통 기술을 이어가고 있는 장인입니다."}
          </Text>

          {artisan.certificationNumber && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>인증 정보</Text>
              <Text style={styles.description}>인증 번호: {artisan.certificationNumber}</Text>
            </>
          )}

          {hasLocation && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>위치</Text>
              {artisan.address && (
                <Text style={styles.description}>{artisan.address}</Text>
              )}
              <View style={styles.mapContainer}>
                <ArtisanMap
                  latitude={artisan.latitude!}
                  longitude={artisan.longitude!}
                  artisanName={artisan.name}
                  address={artisan.address || undefined}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F4F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F5F4F0",
    zIndex: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#3B2B26" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#5C5651",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B2B26",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: { paddingBottom: 60 },
  heroImage: { width: "100%", height: 300 },
  content: {
    padding: 24,
    backgroundColor: "#F5F4F0",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  badgeWrap: {
    alignSelf: "flex-start",
    backgroundColor: "#EAE6E1",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16
  },
  badge: { fontSize: 13, color: "#6A5548", fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", color: "#3B2B26", marginBottom: 12 },
  quote: { fontSize: 16, color: "#8A8077", fontStyle: "italic", lineHeight: 24, marginBottom: 8 },
  divider: { height: 1, backgroundColor: "#DDD7CE", marginVertical: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#3B2B26", marginBottom: 20 },
  description: { fontSize: 15, color: "#5C5651", lineHeight: 28 },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
});
