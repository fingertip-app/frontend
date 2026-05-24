import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";

import { CardNewsCarousel } from "../cardnews/CardNewsCarousel";
import { ExperienceList } from "../experiences/ExperienceList";

// 다가오는 일정 더미 데이터
const UPCOMING_SCHEDULE = {
  id: '1',
  date: '5월 28일 (목)',
  time: '오후 2:00',
  title: '달항아리 물레 체험',
  location: '이천 도자기 마을',
  dDay: 'D-4',
};

// 상단에 보여줄 카드 뉴스(배너) 더미 데이터
const TOP_BANNERS = [
  { id: '1', title: '초보자도 쉽게 배우는\n나전칠기 원데이 클래스', tag: '✨ 추천', bgColor: '#EACCA5' },
  { id: '2', title: '오래된 물건에 새 생명을,\n전통 금박 공예', tag: '🔥 인기', bgColor: '#D4CDC4' },
  { id: '3', title: '차분한 주말을 위한\n다도와 다식 체험', tag: '🍵 힐링', bgColor: '#EAE6E1' },
];

// 인기 체험 더미 데이터
const POPULAR_EXPERIENCES = [
  { id: '1', title: '청자 상감 기법 체험', location: '전남 강진', category: '도자기', price: '45,000원' },
  { id: '2', title: '전통 매듭 팔찌 만들기', location: '서울 북촌', category: '매듭/자수', price: '30,000원' },
  { id: '3', title: '나만의 목재 트레이 제작', location: '경기 남양주', category: '목공예', price: '55,000원' },
];

function PopularExperienceCard({ item }: { item: any }) {
  const [isWished, setIsWished] = useState(false);
  
  return (
    <TouchableOpacity style={styles.popularCard} activeOpacity={0.9}>
      <View style={styles.popularImageContainer}>
        <View style={styles.popularImagePlaceholder} />
        <TouchableOpacity 
          style={styles.wishButton} 
          onPress={() => setIsWished(!isWished)}
          activeOpacity={0.8}
        >
          <Text style={styles.wishIcon}>{isWished ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.popularInfo}>
        <Text style={styles.popularCategory}>{item.location} · {item.category}</Text>
        <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.popularPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.title}>장인과 하루</Text>
          <Text style={styles.subtitle}>K-콘텐츠 속 전통문화를 직접 체험하세요</Text>
        </View>

        {/* 상단 카드 뉴스 (배너) */}
        <View style={styles.bannerSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.bannerScroll}
            snapToInterval={316} // 카드 너비(300) + 마진(16)
            decelerationRate="fast"
          >
            {TOP_BANNERS.map((banner) => (
              <TouchableOpacity key={banner.id} style={[styles.bannerCard, { backgroundColor: banner.bgColor }]} activeOpacity={0.9}>
                <Text style={styles.bannerTag}>{banner.tag}</Text>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 다가오는 일정 영역 */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>📅 다가오는 일정</Text>
          <TouchableOpacity style={styles.scheduleCard} activeOpacity={0.9}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleDDay}>{UPCOMING_SCHEDULE.dDay}</Text>
              <Text style={styles.scheduleDateTime}>{UPCOMING_SCHEDULE.date} {UPCOMING_SCHEDULE.time}</Text>
            </View>
            <Text style={styles.scheduleTitle}>{UPCOMING_SCHEDULE.title}</Text>
            <Text style={styles.scheduleLocation}>📍 {UPCOMING_SCHEDULE.location}</Text>
          </TouchableOpacity>
        </View>

        {/* 리스트 영역 */}
        <View style={styles.listSection}>
          <ExperienceList title="✨ AI 추천 장인 체험" />
        </View>
        
        {/* 인기 체험 영역 */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithoutMargin}>🔥 인기 체험</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
            {POPULAR_EXPERIENCES.map(item => (
              <PopularExperienceCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.listSection}>
          <CardNewsCarousel />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4F0',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B2B26",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6E665F",
  },
  bannerSection: {
    marginBottom: 30,
  },
  bannerScroll: {
    paddingHorizontal: 24,
  },
  bannerCard: {
    width: 300,
    height: 160,
    borderRadius: 16,
    padding: 24,
    marginRight: 16,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTag: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3B2B26',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden', // iOS에서 배경색과 border-radius 렌더링을 위해 필요
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B2B26',
    lineHeight: 28,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#3B2B26', marginHorizontal: 24, marginBottom: 16 },
  scheduleSection: { marginBottom: 30 },
  scheduleCard: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  scheduleDDay: { backgroundColor: '#3B2B26', color: '#FFF', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', marginRight: 10 },
  scheduleDateTime: { fontSize: 14, color: '#6E665F', fontWeight: '600' },
  scheduleTitle: { fontSize: 18, fontWeight: 'bold', color: '#3B2B26', marginBottom: 8 },
  scheduleLocation: { fontSize: 13, color: '#8A8077' },
  listSection: { marginBottom: 30, paddingHorizontal: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleWithoutMargin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B2B26',
  },
  viewAllText: {
    fontSize: 13,
    color: '#8A8077',
    fontWeight: '600',
  },
  popularSection: { marginBottom: 30 },
  popularScroll: { paddingHorizontal: 24 },
  popularCard: { width: 150, marginRight: 16 },
  popularImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#EAE6E1',
    marginBottom: 12,
    overflow: 'hidden',
  },
  popularImagePlaceholder: { flex: 1, backgroundColor: '#D4CDC4' },
  wishButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishIcon: { fontSize: 13 },
  popularInfo: { paddingHorizontal: 4 },
  popularCategory: { fontSize: 11, color: '#8A8077', marginBottom: 4, fontWeight: '500' },
  popularTitle: { fontSize: 14, fontWeight: 'bold', color: '#3B2B26', marginBottom: 4 },
  popularPrice: { fontSize: 14, fontWeight: '600', color: '#3B2B26' },
});
   