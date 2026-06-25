import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { getActiveCardNews } from "@/features/cardnews/api/cardNewsApi";
import type { CardNews } from "@/types/api";

export function CardNewsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardNews, setCardNews] = useState<CardNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardNews = async () => {
      try {
        const data = await getActiveCardNews();
        setCardNews(data);
      } catch (e) {
        console.error("카드뉴스를 불러오는데 실패했습니다:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardNews();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#3B2B26" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>한물결 카드뉴스</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B2B26" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>한물결 카드뉴스</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={cardNews}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => {
              console.log('📰 CardNews item:', JSON.stringify(item, null, 2));
              navigation.navigate("CardNewsDetail", {
                news: {
                  id: String(item.id),
                  title: item.title || '제목 없음',
                  desc: item.aiExplanation || '',
                  tag: item.categoryTags?.[0] || item.contentType || '기타',
                  imageUri: item.imageUrl || '',
                  relatedExperienceIds: item.relatedExperienceIds ?? [],
                }
              });
            }}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardBody}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.categoryTags[0] || item.contentType}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={1}>{item.aiExplanation}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  listContent: { padding: 20, paddingBottom: 40 },
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
