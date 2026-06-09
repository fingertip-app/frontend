import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
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
  
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  submitBtn: { backgroundColor: BRAND, borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});