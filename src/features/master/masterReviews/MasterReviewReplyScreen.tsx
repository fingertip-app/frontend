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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme/ThemeContext";
import { createReviewReply, updateReviewReply } from "./masterReviewsApi";

export function MasterReviewReplyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MasterReviewReply">>();
  const { colors } = useTheme();
  const { review } = route.params;

  const [replyContent, setReplyContent] = useState(review.replyContent || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!review.replyContent;

  const handleSubmit = async () => {
    if (!replyContent.trim()) {
      Alert.alert("알림", "답글 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateReviewReply(review.id, replyContent.trim());
      } else {
        await createReviewReply(review.id, replyContent.trim());
      }

      // 성공 시 즉시 뒤로가기 (Alert 없이)
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error ? error.message : "답글 처리에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── 헤더 ── */}
        <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? "답글 수정" : "답글 작성"}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* ── 원본 후기 정보 ── */}
          <View style={[styles.originalReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>작성된 후기</Text>
            <View style={styles.userInfo}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="person" size={16} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={[styles.userName, { color: colors.text }]}>{review.userName}</Text>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{review.date}</Text>
                </View>
                {/* 별점 */}
                <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={14}
                      color={star <= review.rating ? colors.gold : colors.border}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={[styles.classInfoBox, { backgroundColor: colors.bg }]}>
              <Text style={[styles.classText, { color: colors.textSecondary }]}>체험: {review.className}</Text>
            </View>
            <Text style={[styles.reviewContent, { color: colors.text }]}>{review.content}</Text>
          </View>

          {/* ── 답글 입력창 ── */}
          <View style={styles.replySection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{isEditing ? "답글 수정" : "답글 작성"}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="고객님께 따뜻한 감사 인사나 답글을 남겨주세요."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={replyContent}
              onChangeText={setReplyContent}
            />
          </View>
        </ScrollView>

        {/* ── 하단 등록 버튼 ── */}
        <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.text }, (!replyContent.trim() || isSubmitting) && styles.submitBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!replyContent.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.bg }]}>{isEditing ? "수정하기" : "등록하기"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  content: { padding: 20 },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 12 },

  originalReviewCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700" },
  dateText: { fontSize: 12 },
  classInfoBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  classText: { fontSize: 13, fontWeight: "500" },
  reviewContent: { fontSize: 15, lineHeight: 22 },

  replySection: { marginBottom: 20 },
  textInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15, minHeight: 180, lineHeight: 24 },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20, borderTopWidth: 1 },
  submitBtn: { borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#C4BDB5" },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
});
