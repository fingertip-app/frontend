import React, { useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";

export function CardNewsDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CardNewsDetail">>();
  const { news } = route.params;

  // 스크롤 위치를 추적할 애니메이션 변수
  const scrollY = useRef(new Animated.Value(0)).current;

  // 스크롤이 50~90px 내려갈 때 상단 제목 서서히 나타남
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [50, 90],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // 스크롤이 10~30px 내려갈 때 상단 구분선 서서히 나타남
  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [10, 30],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* 스크롤 시 서서히 나타나는 하단 구분선 */}
        <Animated.View style={[styles.headerBorder, { opacity: headerBorderOpacity }]} />
        
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={{ zIndex: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>

        {/* 스크롤 시 서서히 나타나는 상단 제목 */}
        <Animated.View style={[styles.headerTitleContainer, { opacity: headerTitleOpacity }]}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {news.title.replace(/\n/g, ' ')}
          </Text>
        </Animated.View>

        <View style={[styles.headerRight, { zIndex: 10 }]}>
          <TouchableOpacity hitSlop={10} style={{ marginRight: 16 }}>
            <Ionicons name="share-social-outline" size={22} color="#3B2B26" />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="bookmark-outline" size={22} color="#3B2B26" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <View style={styles.titleSection}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{news.tag}</Text>
          </View>
          <Text style={styles.title}>{news.title}</Text>
          <Text style={styles.desc}>{news.desc}</Text>
        </View>

        <Image source={{ uri: news.imageUri }} style={styles.image} resizeMode="cover" />

        <View style={styles.contentSection}>
          <Text style={styles.contentParagraph}>
            {news.tag}에 담긴 오랜 역사와 장인의 숨결을 느껴보세요. 전통 기법을 그대로 살리면서도 현대적인 감각을 더해 일상 속에서도 자연스럽게 어우러집니다.
          </Text>
          <Text style={styles.contentParagraph}>
            본문 내용이 여기에 들어갑니다. 카드뉴스의 상세한 설명이나 관련 체험에 대한 안내, 장인의 인터뷰 등을 담을 수 있습니다. 전통을 이어나가는 사람들의 이야기를 직접 확인해 보세요.
          </Text>
          
          {/* AI 해설 듣기 버튼 */}
          <TouchableOpacity 
            style={styles.aiBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate("AIChat", { news })}
          >
            <Ionicons name="sparkles" size={16} color="#FFF" />
            <Text style={styles.aiBtnText}>AI 문화 해설 듣기</Text>
          </TouchableOpacity>

          {/* 관련 체험 추천 버튼 */}
          <TouchableOpacity 
            style={styles.recommendBtn} 
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate("MainTabs", {
                screen: "Explore",
                params: news.relatedExperienceIds.length > 0
                  ? { relatedExperienceIds: news.relatedExperienceIds }
                  : { relatedCategory: news.tag },
              });
            }}
          >
            <Text style={styles.recommendBtnText}>
              관련 체험 둘러보기
              {news.relatedExperienceIds.length > 0 ? ` (${news.relatedExperienceIds.length})` : ""}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F0' },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F4F0',
  },
  headerBorder: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1, backgroundColor: '#EAE6E1'
  },
  headerTitleContainer: {
    position: "absolute", left: 60, right: 80, top: 0, bottom: 0,
    justifyContent: "center", alignItems: "center"
  },
  headerTitleText: { fontSize: 16, fontWeight: "700", color: "#3B2B26" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  scrollContent: { paddingBottom: 60 },
  titleSection: { padding: 24, paddingTop: 32 },
  tagBadge: { alignSelf: "flex-start", backgroundColor: "#EAE6E1", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginBottom: 14 },
  tagText: { fontSize: 12, color: "#3B2B26", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "700", color: "#3B2B26", lineHeight: 36, marginBottom: 12 },
  desc: { fontSize: 15, color: "#8A8077", lineHeight: 22 },
  image: { width: "100%", height: 260, backgroundColor: "#EAE6E1" },
  contentSection: { padding: 24, paddingTop: 32 },
  contentParagraph: { fontSize: 16, color: "#3B2B26", lineHeight: 28, marginBottom: 20 },
  aiBtn: { flexDirection: "row", backgroundColor: "#9C7E6A", borderRadius: 12, paddingVertical: 16, justifyContent: "center", alignItems: "center", marginTop: 24, gap: 6 },
  aiBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  recommendBtn: { flexDirection: "row", backgroundColor: "#3B2B26", borderRadius: 12, paddingVertical: 16, justifyContent: "center", alignItems: "center", marginTop: 12, gap: 4 },
  recommendBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
