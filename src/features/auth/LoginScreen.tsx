import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import Svg, { Path, Circle } from "react-native-svg";
import { login } from "@/features/auth/api/authApi";
import { LogoMark } from "@/components/Logo";
import { useTheme } from "@/theme/ThemeContext";

type LoginMode = "USER" | "ARTISAN";

export function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginMode, setLoginMode] = useState<LoginMode>("USER");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToHomeByRole = (role: string) => {
    if (role === "ARTISAN") {
      navigation.reset({ index: 0, routes: [{ name: "MasterHome" }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const { profile } = await login(email, password);
      const isMismatch =
        (loginMode === "ARTISAN" && profile.role !== "ARTISAN") ||
        (loginMode === "USER" && profile.role === "ARTISAN");

      if (isMismatch) {
        const actualModeLabel = profile.role === "ARTISAN" ? "장인" : "일반";
        Alert.alert(
          "계정 유형이 달라요",
          `선택하신 모드와 다른 계정이에요. 이 계정은 '${actualModeLabel}' 계정입니다. 다시 선택해주세요.`,
          [{ text: "확인" }]
        );
      } else {
        goToHomeByRole(profile.role);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* 헤더 및 로고 영역 */}
        <View style={styles.header}>
          <View style={{ marginBottom: 16 }}>
            <LogoMark size={64} radius={32} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>손끝</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>TRADITION EXPERIENCED DAILY</Text>
        </View>

        {/* 환영 메시지 영역 */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>환영합니다!</Text>
          <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>로그인하고 다양한 전통 공예 체험을 만나보세요.</Text>
        </View>

        {/* 일반 / 장인 로그인 모드 토글 */}
        <View style={styles.tabContainer}>
          <View style={[styles.tabBackground, { backgroundColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tabButton, loginMode === "USER" && { backgroundColor: colors.text }]}
              activeOpacity={0.8}
              onPress={() => setLoginMode("USER")}
            >
              <Text style={[styles.tabText, { color: loginMode === "USER" ? colors.bg : colors.textSecondary }]}>일반</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, loginMode === "ARTISAN" && { backgroundColor: colors.text }]}
              activeOpacity={0.8}
              onPress={() => setLoginMode("ARTISAN")}
            >
              <Text style={[styles.tabText, { color: loginMode === "ARTISAN" ? colors.bg : colors.textSecondary }]}>장인</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.formSection}>
          {/* 아이디 입력 */}
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="아이디(이메일)"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="비밀번호"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
                       <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                              {isPasswordVisible ? (
                                // 눈 뜬 상태
                                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                                  <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8}/>
                                </Svg>
                              ) : (
                                // 눈 감은 상태 (사선)
                                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                  <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                                  <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                                  <Path d="M1 1l22 22" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round"/>
                                </Svg>
                              )}
                      </TouchableOpacity>
          </View>

          {/* 에러 메시지 */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.text }, isLoading && styles.loginButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={colors.bg} />
              : <Text style={[styles.loginButtonText, { color: colors.bg }]}>로그인</Text>
            }
          </TouchableOpacity>

          {/* 아이디/비밀번호 찾기 */}
          <View style={styles.findInfoContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("FindId" as never)}>
              <Text style={[styles.findInfoText, { color: colors.textSecondary }]}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={[styles.findInfoDot, { color: colors.border }]}>•</Text>
            <TouchableOpacity onPress={() => navigation.navigate("FindPassword" as never)}>
              <Text style={[styles.findInfoText, { color: colors.textSecondary }]}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 회원가입 버튼 영역 */}
        <View style={styles.signupSection}>
          <Text style={[styles.signupPrompt, { color: colors.textSecondary }]}>계정이 없으신가요?</Text>

          <TouchableOpacity
            style={[styles.primarySignupBtn, { backgroundColor: colors.text }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("GeneralSignUp")}
          >
            <Text style={[styles.primarySignupText, { color: colors.bg }]}>일반 회원가입</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondarySignupBtn, { borderColor: colors.text }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MasterSignUp")}
          >
            <Text style={[styles.secondarySignupText, { color: colors.text }]}>장인 파트너 가입</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 60,
  },

  // Header & Logo
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 13,
    textAlign: 'center',
  },

  // Tabs (일반 회원 / 장인 회원)
  tabContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tabBackground: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    width: 240,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Input Forms
  formSection: {
    marginBottom: 36,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#D04040',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  findInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  findInfoText: {
    fontSize: 13,
  },
  findInfoDot: {
    fontSize: 12,
    marginHorizontal: 16,
  },

  // Signup Buttons
  signupSection: {
    alignItems: 'center',
  },
  signupPrompt: {
    fontSize: 13,
    marginBottom: 20,
  },
  primarySignupBtn: {
    width: '100%',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primarySignupText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondarySignupBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondarySignupText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
