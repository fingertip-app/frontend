import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MainLayout } from "@/features/general/home/MainLayout";

// ─── 타입 및 더미 데이터 ─────────────────────────────────────────────────────────

type TabType = "upcoming" | "pending" | "past" | "cancelled";

export interface Booking {
  id: string;
  status: TabType;
  title: string;
  artisan: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  imageUri?: string;
  orderNo?: string;
  paidAt?: string;
  payMethod?: string;
  totalPrice?: number;
  // 장인 승인은 끝났지만 아직 결제 전인 예약 (결제는 승인 후에만 가능)
  paymentRequired?: boolean;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "upcoming", label: "예정된 체험" },
  { id: "pending", label: "승인 대기" },
  { id: "past", label: "지난 체험" },
  { id: "cancelled", label: "취소 내역" },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    status: "upcoming",
    title: "이천 도자기 물레 체험",
    artisan: "김도예 장인",
    date: "2026.06.15 (토)",
    time: "오후 2:00 - 4:00",
    guests: 2,
    location: "경기 이천시 신둔면 도자예술로 12",
    imageUri: "https://picsum.photos/seed/pottery/300/200",
  },
  {
    id: "2",
    status: "upcoming",
    title: "전주 한지 등 만들기",
    artisan: "한지마을",
    date: "2026.06.20 (목)",
    time: "오전 10:30 - 12:00",
    guests: 4,
    location: "전북 전주시 완산구 한지길 24",
    imageUri: "https://picsum.photos/seed/hanji/300/200",
    paymentRequired: true,
    totalPrice: 112000,
  },
  {
    id: "3",
    status: "pending",
    title: "나전칠기 자개 소품 제작",
    artisan: "이영희 장인",
    date: "2026.06.25 (화)",
    time: "오후 1:00 - 3:30",
    guests: 1,
    location: "서울 종로구 북촌로 5길",
    imageUri: "https://picsum.photos/seed/craft/300/200",
  },
  {
    id: "4",
    status: "past",
    title: "가평 목공예 트레이 만들기",
    artisan: "목공방 하루",
    date: "2026.05.10 (일)",
    time: "오후 3:00 - 5:00",
    guests: 2,
    location: "경기 가평군 청평면",
    imageUri: "https://picsum.photos/seed/wood/300/200",
  },
  {
    id: "5",
    status: "cancelled",
    title: "전통 매듭 팔찌 체험",
    artisan: "김매수 장인",
    date: "2026.05.01 (금)",
    time: "오전 11:00 - 12:00",
    guests: 3,
    location: "서울 종로구 인사동",
    imageUri: "https://picsum.photos/seed/knot/300/200",
  },
];

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 현재 탭에 맞는 예약 내역 필터링
  const filteredBookings = MOCK_BOOKINGS.filter(
    (booking) => booking.status === activeTab
  );

  // 예약 카드 렌더링 함수
  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      {/* 상단 (날짜, 시간, 상태) */}
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#3B2B26" />
          <Text style={styles.dateText}>
            {item.date} · {item.time}
          </Text>
        </View>
        {item.paymentRequired && (
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentBadgeText}>결제 필요</Text>
          </View>
        )}
      </View>

      {/* 본문 (정보) */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText}>장인 : {item.artisan}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText}>예약 인원 : {item.guests}명</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#8A8077" />
          <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.detailButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate("BookingDetail", { booking: item })}
        >
          <Text style={styles.detailButtonText}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout>
      {/* 탭 네비게이션 (가로 스크롤) */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 예약 목록 */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#D4CDC4" />
            <Text style={styles.emptyText}>해당하는 예약 내역이 없습니다.</Text>
          </View>
        }
      />
    </MainLayout>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // 탭
  tabContainer: { borderBottomWidth: 1, borderBottomColor: "#EAE6E1", paddingBottom: 12 },
  tabScrollContent: { paddingHorizontal: 20, gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#EAE6E1" },
  activeTabButton: { backgroundColor: "#3B2B26" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8A8077" },
  activeTabText: { color: "#FFFFFF" },
  
  // 리스트
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: "#8A8077" },
  
  // 예약 카드
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE6E1",
    // 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F5F4F0" },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 14, fontWeight: "700", color: "#3B2B26", marginLeft: 6 },
  paymentBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paymentBadgeText: { fontSize: 12, fontWeight: "700", color: "#E65100" },
  
  cardBody: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#3B2B26", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#6E665F", marginLeft: 8, flex: 1 },
  
  cardFooter: { marginTop: 4 },
  detailButton: {
    width: "100%", backgroundColor: "#FAF9F6", paddingVertical: 12, borderRadius: 10,
    alignItems: "center", borderWidth: 1, borderColor: "#D4CDC4",
  },
  detailButtonText: { fontSize: 14, fontWeight: "600", color: "#3B2B26" },
});
