import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ─── 팔레트 ────────────────────────────────────────────────────────────────────
const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

export function MasterExperienceCreateScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const CATEGORIES = ["도예", "목공", "한지", "염색", "전통음식", "기타"];

  const handleAddImage = () => {
    // TODO: 추후 expo-image-picker 등을 활용해 실제 기기 갤러리와 연동하세요.
    setMainImage("https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 체험 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 대표 이미지 업로드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>대표 이미지</Text>
          <TouchableOpacity 
            style={[styles.imageUploadBox, mainImage && styles.imageUploadBoxDone]} 
            onPress={handleAddImage}
            activeOpacity={0.8}
          >
            {mainImage ? (
              <>
                <Image source={{ uri: mainImage }} style={styles.uploadedImage} />
                <View style={styles.changeImageOverlay}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                  <Text style={styles.changeImageText}>사진 변경</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="image-outline" size={28} color={GRAY} />
                </View>
                <Text style={styles.uploadText}>터치하여 사진 업로드</Text>
                <Text style={styles.uploadSubText}>권장 크기: 1200 x 900 (4:3 비율)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 카테고리 선택 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>카테고리</Text>
          <TouchableOpacity
            style={styles.dropdownHeader}
            activeOpacity={0.8}
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <Text style={[styles.dropdownHeaderText, !category && { color: GRAY }]}>
              {category || "카테고리를 선택해주세요"}
            </Text>
            <Ionicons name={isCategoryOpen ? "chevron-up" : "chevron-down"} size={20} color={GRAY} />
          </TouchableOpacity>

          {isCategoryOpen && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.dropdownItem, idx === CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setCategory(cat);
                    setIsCategoryOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, category === cat && { color: BRAND, fontWeight: "700" }]}>
                    {cat}
                  </Text>
                  {category === cat && <Ionicons name="checkmark" size={18} color={BRAND} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 체험명 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>체험명</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 이천 도자기 물레 체험"
            placeholderTextColor={GRAY}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 가격 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>가격 (1인 기준)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 35000"
            placeholderTextColor={GRAY}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* 상세 설명 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>상세 설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="체험에 대한 상세한 설명을 적어주세요."
            placeholderTextColor={GRAY}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      {/* ── 하단 등록 버튼 ── */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitBtn} 
          activeOpacity={0.8}
          onPress={() => {
            alert("체험이 성공적으로 등록되었습니다!");
            navigation.goBack();
          }}
        >
          <Text style={styles.submitBtnText}>등록하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 17, fontWeight: "700", color: BRAND },
  
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND, marginBottom: 8 },
  input: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1C1107" },
  textArea: { height: 120, paddingTop: 12 },
  
  dropdownHeader: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownHeaderText: { fontSize: 15, color: "#1C1107" },
  dropdownList: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, marginTop: 8, overflow: "hidden" },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownItemText: { fontSize: 15, color: "#1C1107" },

  // 이미지 업로드
  imageUploadBox: { backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER, borderStyle: "dashed", borderRadius: 12, height: 180, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  imageUploadBoxDone: { borderStyle: "solid", borderWidth: 1 },
  uploadIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FAF9F6", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  uploadText: { fontSize: 14, fontWeight: "700", color: BRAND, marginBottom: 6 },
  uploadSubText: { fontSize: 12, color: GRAY },
  uploadedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  changeImageOverlay: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  changeImageText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  submitBtn: { backgroundColor: BRAND, borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});