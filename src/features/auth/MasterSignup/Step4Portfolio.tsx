import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

interface Step4PortfolioProps {
  shortIntro: string;
  setShortIntro: (val: string) => void;
  careerHistory: string;
  setCareerHistory: (val: string) => void;
  portfolioImages: string[];
  setPortfolioImages: (images: string[]) => void;
  snsLink: string;
  setSnsLink: (val: string) => void;
}

export function Step4Portfolio({
  shortIntro,
  setShortIntro,
  careerHistory,
  setCareerHistory,
  portfolioImages,
  setPortfolioImages,
  snsLink,
  setSnsLink,
}: Step4PortfolioProps) {
  
  // 임시 사진 첨부 핸들러 (실제 기기에서는 expo-image-picker 사용 필요)
  const handleAddImage = () => {
    if (portfolioImages.length >= 5) {
      Alert.alert("알림", "사진은 최대 5장까지 첨부할 수 있습니다.");
      return;
    }
    // 가짜 이미지 URI 추가 (UI 확인용)
    setPortfolioImages([...portfolioImages, `mock_image_${Date.now()}`]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPortfolioImages(portfolioImages.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장인님의 이야기를 들려주세요</Text>
        <Text style={styles.subtitle}>경력과 대표 작품을 등록하여 프로필을 완성하세요.</Text>
      </View>

      {/* 한 줄 소개 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>한 줄 소개</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="예) 3대째 이어오는 나전칠기 공방입니다."
            placeholderTextColor="#A39B92"
            value={shortIntro}
            onChangeText={setShortIntro}
            maxLength={50}
          />
        </View>
      </View>

      {/* 주요 경력 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>주요 이력 및 경력 사항</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="주요 전시, 수상 내역, 클래스 운영 경력 등을 자유롭게 적어주세요."
            placeholderTextColor="#A39B92"
            value={careerHistory}
            onChangeText={setCareerHistory}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* 대표 작품 사진 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>대표 작품 사진 (최대 5장)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContainer}>
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage} activeOpacity={0.7}>
            <Text style={styles.addImagePlus}>+</Text>
            <Text style={styles.addImageText}>{portfolioImages.length}/5</Text>
          </TouchableOpacity>
          
          {portfolioImages.map((uri, index) => (
            <View key={uri} style={styles.imagePreviewWrapper}>
              <View style={styles.imagePreviewDummy}>
                <Text style={styles.imagePreviewText}>사진 {index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* SNS 링크 (선택) */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>SNS 또는 웹사이트 (선택)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔗</Text>
          <TextInput
            style={styles.input}
            placeholder="인스타그램, 블로그 등의 링크"
            placeholderTextColor="#A39B92"
            value={snsLink}
            onChangeText={setSnsLink}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: "bold", color: "#3B2B26", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6E665F" },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#6E665F", marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4CDC4",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: "#FAF9F6",
  },
  textAreaContainer: { height: 120, paddingVertical: 12 },
  inputIcon: { fontSize: 18, marginRight: 10, color: "#8A8077" },
  input: { flex: 1, fontSize: 14, color: "#3B2B26" },
  textArea: { minHeight: 96 },
  imageScrollContainer: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  addImageButton: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: "#A39B92", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#FAF9F6", marginRight: 12 },
  addImagePlus: { fontSize: 24, color: "#8A8077", fontWeight: "300" },
  addImageText: { fontSize: 12, color: "#8A8077", marginTop: 4 },
  imagePreviewWrapper: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
  imagePreviewDummy: { flex: 1, backgroundColor: "#EAE6E1", borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#D4CDC4" },
  imagePreviewText: { fontSize: 12, color: "#8A8077" },
  removeImageButton: { position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: "#3B2B26", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  removeImageText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
});