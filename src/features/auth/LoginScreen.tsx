import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";

export function LoginScreen() {
  const [isGeneralMember, setIsGeneralMember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* 헤더 및 로고 영역 */}
        <View style={styles.header}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner} />
            <View style={styles.logoCore} />
          </View>
          <Text style={styles.title}>장인과 하루</Text>
          <Text style={styles.subtitle}>TRADITION EXPERIENCED DAILY</Text>
        </View>

        {/* 환영 메시지 영역 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>환영합니다!</Text>
          <Text style={styles.welcomeDesc}>로그인하고 다양한 전통 공예 체험을 만나보세요.</Text>
        </View>

        {/* 회원 타입 탭(토글) */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <TouchableOpacity
              style={[styles.tabButton, isGeneralMember && styles.activeTab]}
              onPress={() => setIsGeneralMember(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isGeneralMember && styles.activeTabText]}>일반 회원</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isGeneralMember && styles.activeTab]}
              onPress={() => setIsGeneralMember(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, !isGeneralMember && styles.activeTabText]}>장인 회원</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.formSection}>
          {/* 아이디 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="아이디(이메일)"
              placeholderTextColor="#A39B92"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#A39B92"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Text style={styles.inputIcon}>{isPasswordVisible ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          {/* 아이디/비밀번호 찾기 */}
          <View style={styles.findInfoContainer}>
            <TouchableOpacity>
              <Text style={styles.findInfoText}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.findInfoDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.findInfoText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 소셜 로그인 영역 */}
        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는 간편 로그인</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.socialButtonsRow}>
            {/* 카카오 */}
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#FEE500', borderColor: '#FEE500' }]} activeOpacity={0.7}>
              <Text style={{fontWeight: '900', color: '#3B2B26', fontSize: 18}}>K</Text>
            </TouchableOpacity>
            {/* 네이버 */}
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#03C75A', borderColor: '#03C75A' }]} activeOpacity={0.7}>
              <Text style={{fontWeight: '900', color: '#FFF', fontSize: 18}}>N</Text>
            </TouchableOpacity>
            {/* 기타/구글 */}
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#FFF', borderColor: '#E2DDD6' }]} activeOpacity={0.7}>
              <Text style={{fontWeight: '900', color: '#4285F4', fontSize: 18}}>G</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 회원가입 버튼 영역 */}
        <View style={styles.signupSection}>
          <Text style={styles.signupPrompt}>계정이 없으신가요?</Text>
          
          <TouchableOpacity
            style={styles.primarySignupBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("GeneralSignUp")}
          >
            <Text style={styles.primarySignupText}>일반 회원가입</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondarySignupBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MasterSignUp")}
          >
            <Text style={styles.secondarySignupText}>장인 파트너 가입</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4F0', // 전체 베이지 톤 배경
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
  logoOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EACCA5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#3B2B26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B2B26',
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B2B26',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#8A8077',
    letterSpacing: 1,
    fontWeight: '600',
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B2B26',
    marginBottom: 8,
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#6E665F',
  },

  // Tabs (일반 회원 / 장인 회원)
  tabContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#EAE6E1',
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
  activeTab: {
    backgroundColor: '#3B2B26',
  },
  tabText: {
    fontSize: 13,
    color: '#8A8077',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },

  // Input Forms
  formSection: {
    marginBottom: 36,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 12,
    marginBottom: 16,
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
  loginButton: {
    backgroundColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFF',
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
    color: '#8A8077',
  },
  findInfoDot: {
    fontSize: 12,
    color: '#D4CDC4',
    marginHorizontal: 16,
  },

  // Social Login Section
  socialSection: {
    marginBottom: 44,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DDD6',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#8A8077',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Signup Buttons
  signupSection: {
    alignItems: 'center',
  },
  signupPrompt: {
    fontSize: 13,
    color: '#6E665F',
    marginBottom: 20,
  },
  primarySignupBtn: {
    width: '100%',
    backgroundColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primarySignupText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondarySignupBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondarySignupText: {
    color: '#3B2B26',
    fontSize: 15,
    fontWeight: '600',
  },
});