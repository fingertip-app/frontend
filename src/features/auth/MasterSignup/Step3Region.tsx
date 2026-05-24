import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

// 시/도 및 구/군 하드코딩 데이터 (필요시 확장 가능)
const REGIONS: Record<string, string[]> = {
  "서울": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  "경기": ["가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
  "인천": ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  "강원": ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"],
  "대전": ["대덕구", "동구", "서구", "유성구", "중구"],
  "세종": ["세종시"],
  "충남": ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"],
  "충북": ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"],
  "부산": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
  "대구": ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  "울산": ["남구", "동구", "북구", "울주군", "중구"],
  "경북": ["경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"],
  "경남": ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"],
  "광주": ["광산구", "남구", "동구", "북구", "서구"],
  "전북": ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"],
  "전남": ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
  "제주": ["서귀포시", "제주시"],
};

interface Step3RegionProps {
  selectedCity: string;
  selectedDistrict: string;
  onSelectCity: (city: string) => void;
  onSelectDistrict: (district: string) => void;
}

export function Step3Region({ selectedCity, selectedDistrict, onSelectCity, onSelectDistrict }: Step3RegionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>주로 활동하시는 지역은 어디인가요?</Text>
        <Text style={styles.subtitle}>공방 위치나 클래스를 주로 진행하는 지역을 선택해주세요.</Text>
      </View>

      <View style={styles.selectionBox}>
        {/* 좌측: 시/도 (City) */}
        <View style={styles.cityList}>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {Object.keys(REGIONS).map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityItem, selectedCity === city && styles.activeCityItem]}
                onPress={() => {
                  onSelectCity(city);
                  onSelectDistrict(""); // 시/도 변경 시 구/군 초기화
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.cityText, selectedCity === city && styles.activeCityText]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 우측: 구/군 (District) */}
        <View style={styles.districtList}>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {selectedCity ? (
              REGIONS[selectedCity].map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[styles.districtItem, selectedDistrict === district && styles.activeDistrictItem]}
                  onPress={() => onSelectDistrict(district)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.districtText, selectedDistrict === district && styles.activeDistrictText]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyDistrict}>
                <Text style={styles.emptyDistrictText}>먼저 시/도를 선택해주세요.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B2B26",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E665F",
  },
  selectionBox: {
    flexDirection: "row",
    height: 380, // 내부 스크롤을 위해 고정 높이 지정
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 16,
    overflow: "hidden",
  },
  cityList: {
    flex: 1,
    backgroundColor: "#EAE6E1", // 살짝 어두운 베이지 배경
  },
  cityItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  activeCityItem: {
    backgroundColor: "#FAF9F6", // 우측 리스트와 이어지는 배경색
  },
  cityText: {
    fontSize: 15,
    color: "#6E665F",
    fontWeight: "600",
  },
  activeCityText: {
    color: "#3B2B26",
    fontWeight: "bold",
  },
  districtList: {
    flex: 1.5, // 우측 비율을 조금 더 넓게
    backgroundColor: "#FAF9F6",
  },
  districtItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  activeDistrictItem: {
    backgroundColor: "#3B2B26",
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  districtText: { fontSize: 15, color: "#3B2B26" },
  activeDistrictText: { color: "#FFF", fontWeight: "bold" },
  emptyDistrict: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyDistrictText: { color: "#A39B92", fontSize: 14 },
});