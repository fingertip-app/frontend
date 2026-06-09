import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

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

// 인기 지역 데이터
const POPULAR_REGIONS = [
  { label: "서울특별시 종로구", desc: "북촌, 인사동 공방 밀집 지역" },
  { label: "경기도 이천시", desc: "사기막골 도예촌 중심" },
  { label: "전라북도 전주시", desc: "전주 한옥마을 장인 지구" },
];

interface Step3RegionProps {
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
}

export function Step3Region({ selectedRegions, setSelectedRegions }: Step3RegionProps) {
  const [searchText, setSearchText] = useState("");
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [directInput, setDirectInput] = useState("");

  // 검색 필터링
  const searchResults: { city: string; district: string }[] = [];
  if (searchText.length > 0) {
    Object.entries(REGIONS).forEach(([city, districts]) => {
      districts.forEach((district) => {
        if (district.includes(searchText) || city.includes(searchText)) {
          searchResults.push({ city, district });
        }
      });
    });
  }

  const addRegion = (label: string) => {
    if (!selectedRegions.includes(label)) {
      setSelectedRegions([...selectedRegions, label]);
    }
  };

  const removeRegion = (label: string) => {
    setSelectedRegions(selectedRegions.filter((r) => r !== label));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>활동 지역 선택</Text>
        <Text style={styles.subtitle}>주로 활동하시는 지역을 지도에서 선택하거나 검색해주세요.</Text>
      </View>

      {/* 검색창 */}
      <View style={styles.searchBox}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <Circle cx="11" cy="11" r="7" stroke="#A39B92" strokeWidth={1.8} />
          <Path d="M16.5 16.5l4 4" stroke="#A39B92" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="시/군/구 검색 (예: 종로구, 이천시)"
          placeholderTextColor="#A39B92"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 검색 결과 */}
      {searchText.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.length > 0 ? (
            searchResults.slice(0, 6).map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.searchResultItem}
                onPress={() => {
                  addRegion(`${r.city} ${r.district}`);
                  setSearchText("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.searchResultText}>{r.city} {r.district}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultText}>검색 결과가 없습니다.</Text>
          )}
        </View>
      )}

      {/* 인기 지역 */}
      <Text style={styles.sectionLabel}>인기 지역</Text>
      <View style={styles.popularList}>
        {POPULAR_REGIONS.map((region) => {
          const isSelected = selectedRegions.includes(region.label);
          return (
            <TouchableOpacity
              key={region.label}
              style={[styles.popularItem, isSelected && styles.popularItemSelected]}
              onPress={() => isSelected ? removeRegion(region.label) : addRegion(region.label)}
              activeOpacity={0.8}
            >
              <View style={styles.popularItemInner}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.popularItemTitle, isSelected && styles.popularItemTitleSelected]}>
                    {region.label}
                  </Text>
                  <Text style={[styles.popularItemDesc, isSelected && styles.popularItemDescSelected]}>
                    {region.desc}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 기타 지역 직접 입력 */}
      <TouchableOpacity
        style={styles.directInputBtn}
        onPress={() => setShowDirectInput(!showDirectInput)}
        activeOpacity={0.7}
      >
        <Text style={styles.directInputBtnText}>기타 지역 직접 입력하기</Text>
      </TouchableOpacity>

      {showDirectInput && (
        <View style={styles.directInputBox}>
          <TextInput
            style={styles.directInputField}
            placeholder="지역명을 직접 입력해주세요"
            placeholderTextColor="#A39B92"
            value={directInput}
            onChangeText={setDirectInput}
          />
          <TouchableOpacity
            style={styles.directInputConfirm}
            onPress={() => {
              if (directInput.trim()) {
                addRegion(directInput.trim());
                setDirectInput("");
                setShowDirectInput(false);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.directInputConfirmText}>추가</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 선택된 활동 지역 태그 */}
      {selectedRegions.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionLabel}>선택된 활동 지역</Text>
          <View style={styles.selectedTags}>
            {selectedRegions.map((region) => (
              <TouchableOpacity
                key={region}
                style={styles.selectedTag}
                onPress={() => removeRegion(region)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectedTagText}>{region}</Text>
                <Text style={styles.selectedTagRemove}> ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "bold", color: "#3B2B26", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#6E665F", lineHeight: 20 },

  // 검색창
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: "#FAF9F6",
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#3B2B26" },
  clearBtn: { color: "#A39B92", fontSize: 14, paddingLeft: 8 },

  // 검색 결과
  searchResults: {
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 12,
    backgroundColor: "#FAF9F6",
    marginBottom: 16,
    overflow: "hidden",
  },
  searchResultItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE6E1",
  },
  searchResultText: { fontSize: 14, color: "#3B2B26" },
  noResultText: { padding: 16, color: "#A39B92", fontSize: 14 },

  // 섹션 라벨
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B2B26",
    marginBottom: 12,
    marginTop: 8,
  },

  // 인기 지역
  popularList: { marginBottom: 16 },
  popularItem: {
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#FAF9F6",
  },
  popularItemSelected: {
    borderColor: "#3B2B26",
    backgroundColor: "#FAF9F6",
  },
  popularItemInner: { flexDirection: "row", alignItems: "center" },
  popularItemTitle: { fontSize: 15, fontWeight: "700", color: "#3B2B26", marginBottom: 3 },
  popularItemTitleSelected: { color: "#3B2B26" },
  popularItemDesc: { fontSize: 12, color: "#A39B92" },
  popularItemDescSelected: { color: "#6E665F" },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3B2B26",
    justifyContent: "center",
    alignItems: "center",
  },
  checkBadgeText: { color: "#FFF", fontSize: 13, fontWeight: "bold" },

  // 직접 입력
  directInputBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  directInputBtnText: { fontSize: 14, color: "#6E665F", textDecorationLine: "underline" },
  directInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: "#FAF9F6",
    marginBottom: 16,
    gap: 8,
  },
  directInputField: { flex: 1, fontSize: 14, color: "#3B2B26" },
  directInputConfirm: {
    backgroundColor: "#3B2B26",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directInputConfirmText: { color: "#FFF", fontSize: 13, fontWeight: "600" },

  // 선택된 태그
  selectedSection: { marginTop: 8 },
  selectedTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B2B26",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  selectedTagText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  selectedTagRemove: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
});