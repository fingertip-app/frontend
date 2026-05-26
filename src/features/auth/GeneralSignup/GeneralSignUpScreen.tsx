import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";

export function GeneralSignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);

  const handleCheckEmailDuplicate = () => {
    if (!email) {
      Alert.alert("알림", "이메일을 먼저 입력해주세요.");
      return;
    }
    // TODO: 백엔드 API 연동 위치
    if (email === "test@email.com") {
      Alert.alert("중복확인", "이미 가입된 이메일입니다.\n다른 이메일을 사용해주세요.");
    } else {
      Alert.alert("중복확인", "사용 가능한 이메일입니다.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.title}>일반 회원가입</Text>
          <Text style={styles.subtitle}>장인과 하루의 다양한 체험을 즐겨보세요.</Text>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.formSection}>
          
          {/* 이름 입력 */}
          <Text style={styles.inputLabel}>이름</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              placeholderTextColor="#A39B92"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 이메일 입력 */}
          <Text style={styles.inputLabel}>아이디 (이메일)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#A39B92"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
        <TouchableOpacity style={styles.duplicateCheckBtn} onPress={handleCheckEmailDuplicate} activeOpacity={0.7}>
          <Text style={styles.duplicateCheckBtnText}>중복확인</Text>
        </TouchableOpacity>
          </View>

          {/* 비밀번호 입력 */}
          <Text style={styles.inputLabel}>비밀번호</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor="#A39B92"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Text style={styles.inputIcon}>{isPasswordVisible ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          {/* 비밀번호 확인 입력 */}
          <Text style={styles.inputLabel}>비밀번호 확인</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#A39B92"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry={!isPasswordVisible}
            />
          </View>
        </View>

        {/* 약관 동의 영역 (간이 버전) */}
        <View style={styles.termsSection}>
          <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsTermsAgreed(!isTermsAgreed)}>
            <View style={[styles.checkboxCircle, isTermsAgreed && styles.checkboxCircleActive]}>
              {isTermsAgreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}><Text style={{fontWeight: 'bold'}}>[필수]</Text> 이용약관 및 개인정보 처리방침 동의</Text>
          </TouchableOpacity>
        </View>

        {/* 회원가입 버튼 */}
        <TouchableOpacity 
          style={styles.signupButton} 
          activeOpacity={0.8}
          onPress={() => {
            if (!isTermsAgreed) return Alert.alert("알림", "필수 약관에 동의해주세요.");
            navigation.navigate("SignUpComplete");
          }}
        >
          <Text style={styles.signupButtonText}>가입완료</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4F0', // 로그인 화면과 동일한 베이지 톤 배경
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 60,
  },
  
  // Header
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3B2B26',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E665F',
  },

  // Input Forms
  formSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E665F',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#FAF9F6',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#8A8077',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#3B2B26',
  },
  eyeIcon: {
    padding: 4,
  },
  duplicateCheckBtn: {
    backgroundColor: '#EAE6E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  duplicateCheckBtnText: {
    fontSize: 12,
    color: '#3B2B26',
    fontWeight: '600',
  },

  // Terms Section
  termsSection: {
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#A39B92', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxCircleActive: { backgroundColor: '#3B2B26', borderColor: '#3B2B26' },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  termsText: {
    fontSize: 13,
    color: '#6E665F',
  },

  // Button
  signupButton: {
    backgroundColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});