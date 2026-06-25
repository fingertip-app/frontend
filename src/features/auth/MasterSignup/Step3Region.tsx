import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@/theme/ThemeContext";
import { REGIONS } from "@/lib/koreanRegions";

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
  const { colors } = useTheme();
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
        <Text style={[styles.title, { color: colors.text }]}>활동 지역 선택</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>주로 활동하시는 지역을 지도에서 선택하거나 검색해주세요.</Text>
      </View>

      {/* 검색창 */}
      <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <Circle cx="11" cy="11" r="7" stroke={colors.textSecondary} strokeWidth={1.8} />
          <Path d="M16.5 16.5l4 4" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="시/군/구 검색 (예: 종로구, 이천시)"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Text style={[styles.clearBtn, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 검색 결과 */}
      {searchText.length > 0 && (
        <View style={[styles.searchResults, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {searchResults.length > 0 ? (
            searchResults.slice(0, 6).map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  addRegion(`${r.city} ${r.district}`);
                  setSearchText("");
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.searchResultText, { color: colors.text }]}>{r.city} {r.district}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noResultText, { color: colors.textSecondary }]}>검색 결과가 없습니다.</Text>
          )}
        </View>
      )}

      {/* 인기 지역 */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>인기 지역</Text>
      <View style={styles.popularList}>
        {POPULAR_REGIONS.map((region) => {
          const isSelected = selectedRegions.includes(region.label);
          return (
            <TouchableOpacity
              key={region.label}
              style={[
                styles.popularItem,
                { borderColor: colors.border, backgroundColor: colors.card },
                isSelected && { borderColor: colors.text },
              ]}
              onPress={() => isSelected ? removeRegion(region.label) : addRegion(region.label)}
              activeOpacity={0.8}
            >
              <View style={styles.popularItemInner}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.popularItemTitle, { color: colors.text }]}>
                    {region.label}
                  </Text>
                  <Text style={[styles.popularItemDesc, { color: isSelected ? colors.textSecondary : colors.textSecondary }]}>
                    {region.desc}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.text }]}>
                    <Text style={[styles.checkBadgeText, { color: colors.bg }]}>✓</Text>
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
        <Text style={[styles.directInputBtnText, { color: colors.textSecondary }]}>기타 지역 직접 입력하기</Text>
      </TouchableOpacity>

      {showDirectInput && (
        <View style={[styles.directInputBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.directInputField, { color: colors.text }]}
            placeholder="지역명을 직접 입력해주세요"
            placeholderTextColor={colors.textSecondary}
            value={directInput}
            onChangeText={setDirectInput}
          />
          <TouchableOpacity
            style={[styles.directInputConfirm, { backgroundColor: colors.text }]}
            onPress={() => {
              if (directInput.trim()) {
                addRegion(directInput.trim());
                setDirectInput("");
                setShowDirectInput(false);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.directInputConfirmText, { color: colors.bg }]}>추가</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 선택된 활동 지역 태그 */}
      {selectedRegions.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>선택된 활동 지역</Text>
          <View style={styles.selectedTags}>
            {selectedRegions.map((region) => (
              <TouchableOpacity
                key={region}
                style={[styles.selectedTag, { backgroundColor: colors.text }]}
                onPress={() => removeRegion(region)}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectedTagText, { color: colors.bg }]}>{region}</Text>
                <Text style={[styles.selectedTagRemove, { color: colors.bg }]}> ✕</Text>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 13, lineHeight: 20 },

  // 검색창
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  clearBtn: { fontSize: 14, paddingLeft: 8 },

  // 검색 결과
  searchResults: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  searchResultItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  searchResultText: { fontSize: 14 },
  noResultText: { padding: 16, fontSize: 14 },

  // 섹션 라벨
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },

  // 인기 지역
  popularList: { marginBottom: 16 },
  popularItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  popularItemInner: { flexDirection: "row", alignItems: "center" },
  popularItemTitle: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  popularItemDesc: { fontSize: 12 },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBadgeText: { fontSize: 13, fontWeight: "bold" },

  // 직접 입력
  directInputBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  directInputBtnText: { fontSize: 14, textDecorationLine: "underline" },
  directInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 16,
    gap: 8,
  },
  directInputField: { flex: 1, fontSize: 14 },
  directInputConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directInputConfirmText: { fontSize: 13, fontWeight: "600" },

  // 선택된 태그
  selectedSection: { marginTop: 8 },
  selectedTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  selectedTagText: { fontSize: 13, fontWeight: "600" },
  selectedTagRemove: { fontSize: 12 },
});