import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ARTISAN_DATA = {
  name: "김영수 장인",
  badge: "국가무형유산 매듭장",
  image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80",
  quote: "매듭에는 사람의 마음을 잇는 힘이 있습니다.",
  story: "50년이 넘는 세월 동안 오직 매듭만을 바라보며 살아온 김영수 장인. 처음 매듭을 접했던 열다섯 소녀는 어느덧 대한민국을 대표하는 국가무형유산 매듭장이 되었습니다.\n\n전통 매듭은 단순한 장식을 넘어, 끈 하나에 염원과 정성을 담아내는 예술입니다. 장인의 손끝에서 탄생하는 수만 가지의 매듭은 각기 다른 의미와 아름다움을 지니고 있습니다.\n\n이번 장인과 하루 체험에서는 장인의 작업실에서 직접 명주실을 고르고, 기본 매듭인 '도래매듭'부터 시작하여 나만의 특별한 장신구를 만들어보는 시간을 가집니다.",
  experiences: [
    {
      id: "1",
      title: "전통 매듭 팔찌 만들기",
      price: "30,000원",
      duration: "1시간",
      image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=400&q=80",
    },
    {
      id: "2",
      title: "왕실 노리개 제작 체험",
      price: "120,000원",
      duration: "3시간",
      image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&q=80",
    }
  ]
};

export function ArtisanDetailScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장인 스토리</Text>
        {/* 타이틀 가운데 정렬을 위한 여백 */}
        <View style={{ width: 24 }} />
      </View>

      {/* 상세 내용 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: ARTISAN_DATA.image }} style={styles.heroImage} />
        
        <View style={styles.content}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badge}>{ARTISAN_DATA.badge}</Text>
          </View>
          <Text style={styles.title}>{ARTISAN_DATA.name}</Text>
          <Text style={styles.quote}>"{ARTISAN_DATA.quote}"</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>장인의 이야기</Text>
          <Text style={styles.description}>{ARTISAN_DATA.story}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>진행 중인 체험</Text>
          {ARTISAN_DATA.experiences.map((exp) => (
            <TouchableOpacity key={exp.id} style={styles.expCard} activeOpacity={0.9}>
              <Image source={{ uri: exp.image }} style={styles.expImage} />
              <View style={styles.expInfo}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <Ionicons name="time-outline" size={14} color="#8B6F5E" />
                  <Text style={styles.expMeta}>{exp.duration}</Text>
                </View>
                <Text style={styles.expPrice}>{exp.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  
  expCard: { 
    flexDirection: "row", 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: "#EAE6E1", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2 
  },
  expImage: { width: 90, height: 90, borderRadius: 10, marginRight: 16, backgroundColor: "#EAE6E1" },
  expInfo: { flex: 1, justifyContent: "center" },
  expTitle: { fontSize: 16, fontWeight: "700", color: "#3B2B26", marginBottom: 6 },
  expMeta: { fontSize: 13, color: "#8B6F5E" },
  expPrice: { fontSize: 16, fontWeight: "800", color: "#3B2B26" }
});