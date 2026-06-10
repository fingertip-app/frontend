import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export function FindPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  const handleFindPassword = () => {
    if (!email) {
      Alert.alert("알림", "가입하신 아이디(이메일)를 입력해주세요.");
      return;
    }
    // TODO: 백엔드 API 연동
    Alert.alert("임시 비밀번호 발송", "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 찾기</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.description}>
          가입하신 아이디(이메일)를 입력해주시면{"\n"}비밀번호 재설정 링크를 보내드립니다.
        </Text>
        
        <Text style={styles.inputLabel}>아이디 (이메일)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#A39B92"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleFindPassword}>
          <Text style={styles.submitBtnText}>재설정 링크 받기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F0' },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F4F0',
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#3B2B26" },
  container: { padding: 24 },
  description: { fontSize: 14, color: "#6E665F", marginBottom: 32, lineHeight: 22 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#6E665F", marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#D4CDC4",
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 16, height: 52, backgroundColor: "#FAF9F6",
  },
  input: { flex: 1, fontSize: 14, color: "#3B2B26" },
  submitBtn: {
    backgroundColor: "#3B2B26", borderRadius: 26, height: 52,
    justifyContent: "center", alignItems: "center", marginTop: 12,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});