import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";

export function MasterReviewReplyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MasterReviewReply">>();
  const { review } = route.params;

  const [replyContent, setReplyContent] = useState(review.replyContent || "");
  const isEditing = !!review.replyContent;

  const handleSubmit = () => {
    if (!replyContent.trim()) {
      Alert.alert("알림", "답글 내용을 입력해주세요.");
      return;
    }
    
    // TODO: 실제 서버로 답글 내용 전송 API 연동
    Alert.alert(isEditing ? "수정 완료" : "등록 완료", isEditing ? "답글이 성공적으로 수정되었습니다." : "답글이 성공적으로 등록되었습니다.", [
      { 
        text: "확인", 
        onPress: () => navigation.navigate({
          name: "MasterReviews",
          params: { repliedReviewId: review.id, replyContent },
          merge: true,
        })
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={BRAND} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "답글 수정" : "답글 작성"}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* ── 원본 후기 정보 ── */}
          <View style={styles.originalReviewCard}>
            <Text style={styles.sectionLabel}>작성된 후기</Text>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color="#A39B92" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.userName}>{review.userName}</Text>
                  <Text style={styles.dateText}>{review.date}</Text>
                </View>
                {/* 별점 */}
                <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={14}
                      color={star <= review.rating ? "#F59E0B" : "#D4CDC4"}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.classInfoBox}>
              <Text style={styles.classText}>체험: {review.className}</Text>
            </View>
            <Text style={styles.reviewContent}>{review.content}</Text>
          </View>

          {/* ── 답글 입력창 ── */}
          <View style={styles.replySection}>
            <Text style={styles.sectionLabel}>{isEditing ? "답글 수정" : "답글 작성"}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="고객님께 따뜻한 감사 인사나 답글을 남겨주세요."
              placeholderTextColor="#A39B92"
              multiline
              textAlignVertical="top"
              value={replyContent}
              onChangeText={setReplyContent}
            />
          </View>
        </ScrollView>

        {/* ── 하단 등록 버튼 ── */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, !replyContent.trim() && styles.submitBtnDisabled]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!replyContent.trim()}
          >
            <Text style={styles.submitBtnText}>{isEditing ? "수정하기" : "등록하기"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 17, fontWeight: "700", color: BRAND },
  
  content: { padding: 20 },
  
  sectionLabel: { fontSize: 13, fontWeight: "700", color: GRAY, marginBottom: 12 },
  
  originalReviewCard: { backgroundColor: CARD, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 24 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EAE6E1", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700", color: BRAND },
  dateText: { fontSize: 12, color: GRAY },
  classInfoBox: { backgroundColor: "#FAF9F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  classText: { fontSize: 13, color: GRAY, fontWeight: "500" },
  reviewContent: { fontSize: 15, color: "#3B2B26", lineHeight: 22 },

  replySection: { marginBottom: 20 },
  textInput: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 16, fontSize: 15, color: BRAND, minHeight: 180, lineHeight: 24 },
  
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  submitBtn: { backgroundColor: BRAND, borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#C4BDB5" },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});