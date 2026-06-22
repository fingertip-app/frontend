import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import Svg, { Path, Circle } from "react-native-svg";
import { signUp, checkEmailAvailable, checkNicknameAvailable } from "@/features/auth/api/authApi";

export function GeneralSignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  const isAllAgreed = isTermsAgreed && isPrivacyAgreed && isMarketingAgreed;

  const handleAllAgree = () => {
    const newValue = !isAllAgreed;
    setIsTermsAgreed(newValue);
    setIsPrivacyAgreed(newValue);
    setIsMarketingAgreed(newValue);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length > 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handleCheckNicknameDuplicate = async () => {
    if (!nickname) return Alert.alert("알림", "닉네임을 먼저 입력해주세요.");
    if (nickname.length < 2) return Alert.alert("알림", "닉네임은 2자 이상 입력해주세요.");
    try {
      const available = await checkNicknameAvailable(nickname);
      if (available) {
        setIsNicknameChecked(true);
        Alert.alert("중복확인", "사용 가능한 닉네임입니다.");
      } else {
        setIsNicknameChecked(false);
        Alert.alert("중복확인", "이미 사용 중인 닉네임입니다.\n다른 닉네임을 사용해주세요.");
      }
    } catch (e) {
      console.log("닉네임 확인 실패:", e);
      Alert.alert("오류", `닉네임 확인에 실패했습니다. ${String(e)}`);
    }
  };

  const handleCheckEmailDuplicate = async () => {
    if (!email) return Alert.alert("알림", "이메일을 먼저 입력해주세요.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return Alert.alert("알림", "올바른 이메일 형식을 입력해주세요.");
    try {
      const available = await checkEmailAvailable(email);
      if (available) {
        setIsEmailChecked(true);
        Alert.alert("중복확인", "사용 가능한 이메일입니다.");
      } else {
        setIsEmailChecked(false);
        Alert.alert("중복확인", "이미 가입된 이메일입니다.\n다른 이메일을 사용해주세요.");
      }
    } catch {
      Alert.alert("오류", "이메일 확인에 실패했습니다. 다시 시도해주세요.");
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
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              placeholderTextColor="#A39B92"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 닉네임 입력 */}
          <Text style={styles.inputLabel}>닉네임</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="사용하실 닉네임을 입력해주세요"
              placeholderTextColor="#A39B92"
              value={nickname}
              onChangeText={(v) => { setNickname(v); setIsNicknameChecked(false); }}
            />
            <TouchableOpacity style={styles.duplicateCheckBtn} onPress={handleCheckNicknameDuplicate} activeOpacity={0.7}>
              <Text style={styles.duplicateCheckBtnText}>중복확인</Text>
            </TouchableOpacity>
          </View>

          {/* 휴대폰 번호 입력 */}
          <Text style={styles.inputLabel}>휴대폰 번호</Text>
          <View style={styles.inputContainer}>
           
            <TextInput
              style={styles.input}
              placeholder="010-0000-0000"
              placeholderTextColor="#A39B92"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="numeric"
              maxLength={13}
            />
          </View>

          {/* 이메일 입력 */}
          <Text style={styles.inputLabel}>아이디 (이메일)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#A39B92"
              value={email}
              onChangeText={(v) => { setEmail(v); setIsEmailChecked(false); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
        <TouchableOpacity style={styles.duplicateCheckBtn} onPress={handleCheckEmailDuplicate} activeOpacity={0.7}>
          <Text style={styles.duplicateCheckBtnText}>중복확인</Text>
        </TouchableOpacity>
          </View>

          {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <Text style={styles.errorText}>올바른 이메일 형식이 아닙니다.</Text>
          )}

          {/* 비밀번호 입력 */}
          <Text style={styles.inputLabel}>비밀번호</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor="#A39B92"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  {isPasswordVisible ? (
                    // 눈 뜬 상태
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      <Circle cx={12} cy={12} r={3} stroke="#8A8077" strokeWidth={1.8}/>
                    </Svg>
                  ) : (
                    // 눈 감은 상태 (사선)
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M1 1l22 22" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round"/>
                    </Svg>
                  )}
          </TouchableOpacity>
          </View>

          {password.length > 0 && !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/.test(password) && (
            <Text style={styles.errorText}>영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.</Text>
          )}

          {/* 비밀번호 확인 입력 */}
          <Text style={styles.inputLabel}>비밀번호 확인</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#A39B92"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry={!isPasswordConfirmVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordConfirmVisible(!isPasswordConfirmVisible)} style={styles.eyeIcon}>
              {isPasswordConfirmVisible ? (
                // 눈 뜬 상태
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                  <Circle cx={12} cy={12} r={3} stroke="#8A8077" strokeWidth={1.8}/>
                </Svg>
              ) : (
                // 눈 감은 상태 (사선)
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M1 1l22 22" stroke="#8A8077" strokeWidth={1.8} strokeLinecap="round"/>
                </Svg>
              )}
            </TouchableOpacity>
          </View>
          
          {passwordConfirm.length > 0 && password !== passwordConfirm && (
            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
          )}
        </View>

        {/* 약관 동의 영역 */}
        <View style={styles.termsSection}>
          <TouchableOpacity style={[styles.termsCheckbox, { marginBottom: 16 }]} activeOpacity={0.8} onPress={handleAllAgree}>
            <View style={[styles.checkboxCircle, isAllAgreed && styles.checkboxCircleActive]}>
              {isAllAgreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.termsText, { fontWeight: 'bold', fontSize: 15 }]}>전체 약관 동의하기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsTermsAgreed(!isTermsAgreed)}>
            <View style={[styles.checkboxCircle, isTermsAgreed && styles.checkboxCircleActive]}>
              {isTermsAgreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}><Text style={{fontWeight: 'bold'}}>[필수]</Text> 이용약관 동의</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsPrivacyAgreed(!isPrivacyAgreed)}>
            <View style={[styles.checkboxCircle, isPrivacyAgreed && styles.checkboxCircleActive]}>
              {isPrivacyAgreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}><Text style={{fontWeight: 'bold'}}>[필수]</Text> 개인정보 처리방침 동의</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsMarketingAgreed(!isMarketingAgreed)}>
            <View style={[styles.checkboxCircle, isMarketingAgreed && styles.checkboxCircleActive]}>
              {isMarketingAgreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>[선택] 마케팅 수신 동의</Text>
          </TouchableOpacity>
        </View>

        {/* 회원가입 버튼 */}
        <TouchableOpacity
          style={[styles.signupButton, isLoading && { opacity: 0.6 }]}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={async () => {
            if (!name) return Alert.alert("알림", "이름을 입력해주세요.");
            if (!nickname) return Alert.alert("알림", "닉네임을 입력해주세요.");
            if (!isNicknameChecked) return Alert.alert("알림", "닉네임 중복확인을 해주세요.");
            if (!phone) return Alert.alert("알림", "휴대폰 번호를 입력해주세요.");
            if (phone.length < 12) return Alert.alert("알림", "올바른 휴대폰 번호를 입력해주세요.");
            if (!email) return Alert.alert("알림", "아이디(이메일)를 입력해주세요.");
            if (!isEmailChecked) return Alert.alert("알림", "이메일 중복확인을 해주세요.");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return Alert.alert("알림", "올바른 이메일 형식을 입력해주세요.");
            if (!password) return Alert.alert("알림", "비밀번호를 입력해주세요.");
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
            if (!passwordRegex.test(password)) return Alert.alert("알림", "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
            if (password !== passwordConfirm) return Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
            if (!isTermsAgreed || !isPrivacyAgreed) return Alert.alert("알림", "필수 약관에 동의해주세요.");

            setIsLoading(true);
            try {
              const { needsEmailVerification } = await signUp(email, password, nickname, name);
              if (needsEmailVerification) {
                Alert.alert(
                  "이메일 인증 필요",
                  "가입하신 이메일로 인증 메일을 발송했습니다.\n인증 후 로그인해주세요.",
                  [{ text: "확인", onPress: () => navigation.navigate("SignUpComplete") }]
                );
              } else {
                navigation.navigate("SignUpComplete");
              }
            } catch (e) {
              Alert.alert("회원가입 실패", e instanceof Error ? e.message : "회원가입에 실패했습니다.");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          {isLoading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.signupButtonText}>가입완료</Text>
          }
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
  errorText: {
    color: '#D04040',
    fontSize: 12,
    marginLeft: 4,
    marginTop: -12,
    marginBottom: 16,
  },

  // Terms Section
  termsSection: {
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE6E1',
    marginBottom: 16,
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