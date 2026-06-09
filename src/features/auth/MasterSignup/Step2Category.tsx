import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, Polyline, Line } from "react-native-svg";

// 종목 데이터 (항목 그대로 유지)
const CATEGORIES = [
  { 
    id: '1', name: '도자기', icon: 'pottery',
    desc: '청자, 백자, 분청사기 등'
  },
  { 
    id: '2', name: '목공예', icon: 'wood',
    desc: '전통가구, 소반, 창호'
  },
  { 
    id: '3', name: '한지공예', icon: 'hanji',
    desc: '지승공예, 색지공예'
  },
  { 
    id: '4', name: '매듭/자수', icon: 'needle',
    desc: '매듭, 자수, 침선'
  },
  { 
    id: '5', name: '나전칠기', icon: 'lacquer',
    desc: '나전, 칠기, 螺鈿'
  },
  { 
    id: '6', name: '금속공예', icon: 'metal',
    desc: '금속, 자수, 매듭, 칠기 등'
  },
  { 
    id: '7', name: '전통음식', icon: 'food',
    desc: '전통주, 다도, 떡, 한과류 장인'
  },
  { 
    id: '8', name: '전통회화', icon: 'paint',
    desc: '민화, 한국화, 서예'
  },
  { 
    id: '9', name: '기타 예술 및 공예', icon: 'etc',
    desc: '금속, 자수, 매듭, 칠기 등'
  },
];

// SVG 아이콘 컴포넌트
function CategoryIcon({ type, selected }: { type: string; selected: boolean }) {
  const color = selected ? '#FAF9F6' : '#6E665F';
  const size = 28;
  switch (type) {
    case 'pottery':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M8 3h8l2 6c0 4-2 7-6 9-4-2-6-5-6-9l2-6z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
          <Path d="M8 3c0 0 1.5 2 4 2s4-2 4-2" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
        </Svg>
      );
    case 'wood':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 7h18M3 12h18M3 17h18" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
          <Rect x="5" y="4" width="14" height="16" rx="2" stroke={color} strokeWidth={1.6}/>
        </Svg>
      );
    case 'hanji':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="3" width="13" height="17" rx="2" stroke={color} strokeWidth={1.6}/>
          <Path d="M7 7h7M7 11h7M7 15h4" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
          <Path d="M17 3l3 3v15H8" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
        </Svg>
      );
    case 'needle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3c-4 0-7 3-7 7 0 3 2 5 5 6l2 5 2-5c3-1 5-3 5-6 0-4-3-7-7-7z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
          <Circle cx="12" cy="10" r="2" stroke={color} strokeWidth={1.4}/>
        </Svg>
      );
    case 'lacquer':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 6h14l-1 12H6L5 6z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
          <Path d="M3 6h18" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
          <Path d="M9 6V4h6v2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M9 11c1 1 5 1 6 0" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
        </Svg>
      );
    case 'metal':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M14 3l7 7-10 11L4 14 14 3z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
          <Path d="M4 14l-1 7 7-1" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M10 7l7 7" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
        </Svg>
      );
    case 'food':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M8 3v4c0 2 1.5 3 4 3s4-1 4-3V3" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
          <Path d="M6 10h12l-1 10H7L6 10z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
          <Path d="M12 3v4" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
        </Svg>
      );
    case 'paint':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.6}/>
          <Path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
          <Path d="M12 8c2 0 4 1.8 4 4" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.6}/>
          <Circle cx="4" cy="12" r="2" stroke={color} strokeWidth={1.6}/>
          <Circle cx="20" cy="12" r="2" stroke={color} strokeWidth={1.6}/>
        </Svg>
      );
  }
}

interface Step2CategoryProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export function Step2Category({ selectedCategories, setSelectedCategories }: Step2CategoryProps) {
  // 2열 그리드용으로 마지막 항목 분리
  const gridItems = CATEGORIES.slice(0, 6);   // 2열 그리드 (6개)
  const wideItems = CATEGORIES.slice(6);       // 가로 넓은 카드 (나머지)

  const toggleCategory = (name: string) => {
    if (selectedCategories.includes(name)) {
      setSelectedCategories(selectedCategories.filter(c => c !== name));
    } else {
      setSelectedCategories([...selectedCategories, name]);
    }
  };

  const renderCard = (cat: typeof CATEGORIES[0], wide = false) => {
    const isSelected = selectedCategories.includes(cat.name);
    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          wide ? styles.wideCategoryCard : styles.categoryCard,
          isSelected && styles.selectedCategoryCard,
        ]}
        onPress={() => toggleCategory(cat.name)}
        activeOpacity={0.8}
      >
        <View style={wide ? styles.wideInner : styles.cardInner}>
          <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
            <CategoryIcon type={cat.icon} selected={isSelected} />
          </View>
          <View style={wide ? styles.wideTextWrap : undefined}>
            <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
              {cat.name}
            </Text>
            <Text style={[styles.categoryDesc, isSelected && styles.selectedCategoryDesc]}>
              {cat.desc}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.formSection}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>전문 분야를 선택해주세요</Text>
        <Text style={styles.stepSubtitle}>장인님께서 활동하시는 공예 및 예술 분야를 중복 선택하실 수 있습니다.</Text>
      </View>

      {/* 2열 그리드 */}
      <View style={styles.categoryGrid}>
        {gridItems.map(cat => renderCard(cat))}
      </View>

      {/* 넓은 카드 */}
      {wideItems.map(cat => renderCard(cat, true))}
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: { marginBottom: 24 },
  stepHeader: { marginBottom: 24 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#3B2B26', marginBottom: 8 },
  stepSubtitle: { fontSize: 13, color: '#6E665F', lineHeight: 20 },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },

  // 2열 카드
  categoryCard: {
    width: '48%',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardInner: {
    alignItems: 'flex-start',
  },

  // 넓은 카드 (가로 전체)
  wideCategoryCard: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  wideInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wideTextWrap: {
    marginLeft: 16,
    flex: 1,
  },

  // 선택 상태
  selectedCategoryCard: {
    backgroundColor: '#3B2B26',
    borderColor: '#3B2B26',
  },

  // 아이콘 배경
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEE9E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // 텍스트
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B2B26',
    marginBottom: 4,
  },
  selectedCategoryName: { color: '#FAF9F6' },

  categoryDesc: {
    fontSize: 12,
    color: '#A39B92',
    lineHeight: 17,
  },
  selectedCategoryDesc: { color: 'rgba(250,249,246,0.7)' },
});