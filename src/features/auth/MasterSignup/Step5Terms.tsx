import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert, Platform } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/theme/ThemeContext";

interface Step5TermsProps {
  isTermsAgreed: boolean;
  setIsTermsAgreed: (val: boolean) => void;
  isPrivacyAgreed: boolean;
  setIsPrivacyAgreed: (val: boolean) => void;
  isMarketingAgreed: boolean;
  setIsMarketingAgreed: (val: boolean) => void;
  uploadedFile: { name: string; uri: string } | null;
  setUploadedFile: (file: { name: string; uri: string } | null) => void;
  bio: string;
  setBio: (bio: string) => void;
}

export function Step5Terms({
  isTermsAgreed, setIsTermsAgreed,
  isPrivacyAgreed, setIsPrivacyAgreed,
  isMarketingAgreed, setIsMarketingAgreed,
  uploadedFile, setUploadedFile,
  bio, setBio,
}: Step5TermsProps) {
  const { colors } = useTheme();
  const isAllAgreed = isTermsAgreed && isPrivacyAgreed && isMarketingAgreed;
  const MAX_BIO = 1000;

  const handleAllAgree = () => {
    const newValue = !isAllAgreed;
    setIsTermsAgreed(newValue);
    setIsPrivacyAgreed(newValue);
    setIsMarketingAgreed(newValue);
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        // 10MB 체크
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert("알림", "파일 크기는 10MB 이하만 업로드 가능합니다.");
          return;
        }
        setUploadedFile({ name: file.name, uri: file.uri });
      }
    } catch {
      Alert.alert("알림", "파일 선택 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.formSection}>

      {/* ── 자격 증빙 섹션 ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>자격 증빙 및 약력</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        무형문화재 지정서나 전문 자격증 등 장인임을 증명할 수 있는 서류를 등록해주세요.
      </Text>

      {/* 파일 업로드 */}
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>자격 증명 서류 <Text style={[styles.required, { color: colors.text }]}>(필수)</Text></Text>
      <TouchableOpacity
        style={[
          styles.uploadBox,
          { borderColor: colors.border, backgroundColor: colors.card },
          uploadedFile && { borderStyle: "solid", borderColor: colors.text, paddingVertical: 16, paddingHorizontal: 16 },
        ]}
        onPress={handleFilePick}
        activeOpacity={0.8}
      >
        {uploadedFile ? (
          <View style={styles.uploadedRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={colors.text} strokeWidth={1.6} strokeLinejoin="round"/>
              <Path d="M14 2v6h6M9 13l2 2 4-4" stroke={colors.text} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={[styles.uploadedName, { color: colors.text }]} numberOfLines={1}>{uploadedFile.name}</Text>
            <TouchableOpacity onPress={() => setUploadedFile(null)} style={styles.removeFile}>
              <Text style={[styles.removeFileText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.uploadIconWrap, { backgroundColor: colors.border }]}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="18" height="18" rx="3" stroke={colors.textSecondary} strokeWidth={1.4}/>
                <Path d="M12 16V8M9 11l3-3 3 3" stroke={colors.textSecondary} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={[styles.uploadMainText, { color: colors.text }]}>파일 선택 또는 드래그</Text>
            <Text style={[styles.uploadSubText, { color: colors.textSecondary }]}>PDF, JPG, PNG (최대 10MB)</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 약력 입력 */}
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>약력 및 주요 활동</Text>
      <View style={[styles.bioBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.bioInput, { color: colors.text }]}
          placeholder={"전통 공예 경력, 수상 실적, 전시회 참여 등 장인으로서의 활동 내용을 자유롭게 기재해주세요."}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={MAX_BIO}
          value={bio}
          onChangeText={setBio}
          textAlignVertical="top"
        />
        <Text style={[styles.bioCount, { color: colors.textSecondary }]}>{bio.length} / {MAX_BIO}</Text>
      </View>

      {/* 구분선 */}
      <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

      {/* ── 약관 동의 섹션 ── */}
      <View style={styles.termsSection}>
        <TouchableOpacity style={[styles.termsCheckbox, { marginBottom: 16 }]} activeOpacity={0.8} onPress={handleAllAgree}>
          <View style={[styles.checkboxCircle, { borderColor: colors.textSecondary }, isAllAgreed && { backgroundColor: colors.text, borderColor: colors.text }]}>
            {isAllAgreed && <Text style={[styles.checkMark, { color: colors.bg }]}>✓</Text>}
          </View>
          <Text style={[styles.termsText, { color: colors.textSecondary, fontWeight: "bold", fontSize: 15 }]}>전체 약관 동의하기</Text>
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsTermsAgreed(!isTermsAgreed)}>
          <View style={[styles.checkboxCircle, { borderColor: colors.textSecondary }, isTermsAgreed && { backgroundColor: colors.text, borderColor: colors.text }]}>
            {isTermsAgreed && <Text style={[styles.checkMark, { color: colors.bg }]}>✓</Text>}
          </View>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}><Text style={{ fontWeight: "bold" }}>[필수]</Text> 파트너 이용약관 동의</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsPrivacyAgreed(!isPrivacyAgreed)}>
          <View style={[styles.checkboxCircle, { borderColor: colors.textSecondary }, isPrivacyAgreed && { backgroundColor: colors.text, borderColor: colors.text }]}>
            {isPrivacyAgreed && <Text style={[styles.checkMark, { color: colors.bg }]}>✓</Text>}
          </View>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}><Text style={{ fontWeight: "bold" }}>[필수]</Text> 개인정보 처리방침 동의</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsMarketingAgreed(!isMarketingAgreed)}>
          <View style={[styles.checkboxCircle, { borderColor: colors.textSecondary }, isMarketingAgreed && { backgroundColor: colors.text, borderColor: colors.text }]}>
            {isMarketingAgreed && <Text style={[styles.checkMark, { color: colors.bg }]}>✓</Text>}
          </View>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>[선택] 마케팅 수신 동의</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  formSection: { marginBottom: 24 },

  // 섹션 헤더
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, lineHeight: 20, marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 10, marginLeft: 2 },
  required: {},

  // 파일 업로드
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadMainText: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  uploadSubText: { fontSize: 12 },
  uploadedRow: { flexDirection: "row", alignItems: "center", flex: 1, width: "100%" },
  uploadedName: { flex: 1, fontSize: 13, fontWeight: "600", marginLeft: 10 },
  removeFile: { padding: 4 },
  removeFileText: { fontSize: 14 },

  // 약력 입력
  bioBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 140,
  },
  bioInput: { fontSize: 14, lineHeight: 22, minHeight: 100 },
  bioCount: { fontSize: 12, textAlign: "right", marginTop: 8 },

  // 구분선
  sectionDivider: { height: 1, marginBottom: 24 },

  // 약관
  termsSection: { marginBottom: 36, paddingHorizontal: 4 },
  termsCheckbox: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  divider: { height: 1, marginBottom: 16 },
  checkboxCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, marginRight: 10, justifyContent: "center", alignItems: "center" },
  checkMark: { fontSize: 12, fontWeight: "bold" },
  termsText: { fontSize: 13 },
});