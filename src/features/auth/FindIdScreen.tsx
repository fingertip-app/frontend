import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export function FindIdScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleFindId = () => {
    if (!name || !phone) {
      Alert.alert("알림", "이름과 휴대폰 번호를 모두 입력해주세요.");
      return;
    }
    // TODO: 백엔드 API 연동
    Alert.alert("아이디 찾기 결과", "회원님의 아이디는 test@email.com 입니다.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>아이디 찾기</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.description}>가입 시 등록한 이름과 휴대폰 번호를 입력해주세요.</Text>
        
        <Text style={styles.inputLabel}>이름</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#A39B92"
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.inputLabel}>휴대폰 번호</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="010-0000-0000"
            placeholderTextColor="#A39B92"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleFindId}>
          <Text style={styles.submitBtnText}>아이디 찾기</Text>
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
  description: { fontSize: 14, color: "#6E665F", marginBottom: 32, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#6E665F", marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#D4CDC4",
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 16, height: 52, backgroundColor: "#FAF9F6",
  },
  input: { flex: 1, fontSize: 14, color: "#3B2B26" },
  submitBtn: {
    backgroundColor: "#3B2B26",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});