import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";

const DUMMY_NEWS = [
  { id: "1", title: "K-콘텐츠 속 자수,\n조선 왕실 기법입니다", desc: "AI 해설과 전통 자수 체험으로 연결", tag: "전통 자수", imageUri: "https://images.unsplash.com/photo-1605369680336-6468700a9437?w=400&q=80" },
  { id: "2", title: "천년의 빛을 품은\n나전칠기의 비밀", desc: "바다의 보석이 일상 소품으로 재탄생하다", tag: "나전칠기", imageUri: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80" },
  { id: "3", title: "흙과 불이 빚어낸 예술,\n이천 도자기 마을", desc: "가족과 함께하는 주말 도예 체험 가이드", tag: "도자기", imageUri: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80" },
  { id: "4", title: "전통주 빚기,\n쌀과 누룩의 마법", desc: "집에서 쉽게 따라하는 막걸리 빚기", tag: "전통음식", imageUri: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80" },
];

export function CardNewsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        data={DUMMY_NEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("CardNewsDetail", { news: item })}
          >
            <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F0' },
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