import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { checkEmailAvailable, checkNicknameAvailable } from "@/features/auth/api/authApi";
import { useTheme } from "@/theme/ThemeContext";

interface Step1BasicInfoProps {
  masterName: string;
  setMasterName: (val: string) => void;
  nickname: string;
  setNickname: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (val: string) => void;
  isNicknameChecked: boolean;
  setIsNicknameChecked: (val: boolean) => void;
  isEmailChecked: boolean;
  setIsEmailChecked: (val: boolean) => void;
  onSkipTest?: () => void;
}

export function Step1BasicInfo({
  masterName, setMasterName,
  nickname, setNickname,
  phoneNumber, setPhoneNumber,
  email, setEmail,
  password, setPassword,
  passwordConfirm, setPasswordConfirm,
  isNicknameChecked, setIsNicknameChecked,
  isEmailChecked, setIsEmailChecked,
  onSkipTest
}: Step1BasicInfoProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const { colors } = useTheme();

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length > 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    setPhoneNumber(formatted);
  };

  const handleCheckNicknameDuplicate = async () => {
    if (!nickname) {
      setNicknameCheckMessage("닉네임을 먼저 입력해주세요.");
      return;
    }
    if (nickname.length < 2) {
      setNicknameCheckMessage("닉네임은 2자 이상 입력해주세요.");
      return;
    }
    try {
      const available = await checkNicknameAvailable(nickname);
      if (available) {
        setIsNicknameChecked(true);
        setNicknameCheckMessage("✓ 사용 가능한 닉네임입니다.");
      } else {
        setIsNicknameChecked(false);
        setNicknameCheckMessage("이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.");
      }
    } catch {
      setIsNicknameChecked(false);
      setNicknameCheckMessage("닉네임 확인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCheckEmailDuplicate = async () => {
    if (!email) {
      setEmailCheckMessage("이메일을 먼저 입력해주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailCheckMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    try {
      const available = await checkEmailAvailable(email);
      if (available) {
        setIsEmailChecked(true);
        setEmailCheckMessage("✓ 사용 가능한 이메일입니다.");
      } else {
        setIsEmailChecked(false);
        setEmailCheckMessage("이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.");
      }
    } catch {
      setIsEmailChecked(false);
      setEmailCheckMessage("이메일 확인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <View style={styles.formSection}>
      {/* 테스트 편의를 위한 자동 입력 & 스킵 버튼 (개발 환경에서만 표시됨) */}
      {__DEV__ && (
        <View style={styles.testBtnContainer}>
          <TouchableOpacity
            style={styles.testBtn}
            activeOpacity={0.7}
            onPress={() => {
              setMasterName("김장인");
              setNickname("테스트공방");
              setPhoneNumber("010-1234-5678");
              setEmail("test@email.com");
              setPassword("Test1234!");
              setPasswordConfirm("Test1234!");
            }}
          >
            <Text style={styles.testBtnText}>자동 입력</Text>
          </TouchableOpacity>
          {onSkipTest && (
            <TouchableOpacity style={styles.testBtn} activeOpacity={0.7} onPress={onSkipTest}>
              <Text style={styles.testBtnText}>Step 2 건너뛰기 ⏭️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>대표자(장인) 이름</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput style={[styles.input, { color: colors.text }]} placeholder="실명을 입력해주세요" placeholderTextColor={colors.textSecondary} value={masterName} onChangeText={setMasterName} />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>닉네임 (또는 공방/상호명)</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="사용하실 닉네임을 입력해주세요"
          placeholderTextColor={colors.textSecondary}
          value={nickname}
          onChangeText={(v) => { setNickname(v); setIsNicknameChecked(false); setNicknameCheckMessage(""); }}
        />
        <TouchableOpacity style={[styles.duplicateCheckBtn, { backgroundColor: colors.border }]} onPress={handleCheckNicknameDuplicate} activeOpacity={0.7}>
          <Text style={[styles.duplicateCheckBtnText, { color: colors.text }]}>중복확인</Text>
        </TouchableOpacity>
      </View>
      {nicknameCheckMessage ? (
        <Text style={isNicknameChecked ? styles.successText : styles.errorText}>{nicknameCheckMessage}</Text>
      ) : null}

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>연락처</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput style={[styles.input, { color: colors.text }]} placeholder="010-0000-0000" placeholderTextColor={colors.textSecondary} value={phoneNumber} onChangeText={handlePhoneChange} keyboardType="numeric" maxLength={13} />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>아이디 (이메일)</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="example@email.com"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={(v) => { setEmail(v); setIsEmailChecked(false); setEmailCheckMessage(""); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={[styles.duplicateCheckBtn, { backgroundColor: colors.border }]} onPress={handleCheckEmailDuplicate} activeOpacity={0.7}>
          <Text style={[styles.duplicateCheckBtnText, { color: colors.text }]}>중복확인</Text>
        </TouchableOpacity>
      </View>
      {emailCheckMessage ? (
        <Text style={isEmailChecked ? styles.successText : styles.errorText}>{emailCheckMessage}</Text>
      ) : null}
      {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <Text style={styles.errorText}>올바른 이메일 형식이 아닙니다.</Text>}

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>비밀번호</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput style={[styles.input, { color: colors.text }]} placeholder="비밀번호 (8자 이상)" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          {isPasswordVisible ? (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8}/>
            </Svg>
          ) : (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M1 1l22 22" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round"/>
            </Svg>
          )}
        </TouchableOpacity>
      </View>
      {password.length > 0 && !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/.test(password) && <Text style={styles.errorText}>영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.</Text>}

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>비밀번호 확인</Text>
      <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput style={[styles.input, { color: colors.text }]} placeholder="비밀번호를 다시 입력해주세요" placeholderTextColor={colors.textSecondary} value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry={!isPasswordConfirmVisible} />
        <TouchableOpacity onPress={() => setIsPasswordConfirmVisible(!isPasswordConfirmVisible)} style={styles.eyeIcon}>
          {isPasswordConfirmVisible ? (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8}/>
            </Svg>
          ) : (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M1 1l22 22" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round"/>
            </Svg>
          )}
        </TouchableOpacity>
      </View>
      {passwordConfirm.length > 0 && password !== passwordConfirm && <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginBottom: 20, paddingHorizontal: 16, height: 52 },
  input: { flex: 1, fontSize: 14 },
  eyeIcon: { padding: 4 },
  duplicateCheckBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  duplicateCheckBtnText: { fontSize: 12, fontWeight: '600' },
  errorText: { color: '#D04040', fontSize: 12, marginLeft: 4, marginTop: -12, marginBottom: 16 },
  successText: { color: '#2E7D32', fontSize: 12, marginLeft: 4, marginTop: -12, marginBottom: 16 },
  testBtnContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 16 },
  testBtn: { backgroundColor: '#EAE6E1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  testBtnText: { fontSize: 11, color: '#3B2B26', fontWeight: 'bold' },
});