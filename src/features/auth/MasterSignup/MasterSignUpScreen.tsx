import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { Step3Region } from "./Step3Region";
import { Step4Portfolio } from "./Step4Portfolio";

// 종목 데이터 (추후 API로 받아오거나 아이콘 이미지를 변경할 수 있습니다)
const CATEGORIES = [
  { id: '1', name: '도자기', icon: '🏺' },
  { id: '2', name: '매듭/자수', icon: '🧵' },
  { id: '3', name: '목공예', icon: '🪑' },
  { id: '4', name: '한지공예', icon: '📜' },
  { id: '5', name: '나전칠기', icon: '🐚' },
  { id: '6', name: '금속공예', icon: '⚒️' },
  { id: '7', name: '전통회화', icon: '🖌️' },
  { id: '8', name: '전통음식', icon: '🍵' },
  { id: '9', name: '기타', icon: '✨' },
];

export function MasterSignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState(1);
  const [masterName, setMasterName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("서울"); // 초기 시/도 기본값
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [shortIntro, setShortIntro] = useState("");
  const [careerHistory, setCareerHistory] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [snsLink, setSnsLink] = useState("");
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
        
        {/* 상단 5단계 스텝 인디케이터 */}
        <View style={styles.stepContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={styles.stepWrapper}>
              <TouchableOpacity 
                style={[styles.stepCircle, currentStep >= step && styles.activeStepCircle]}
                onPress={() => setCurrentStep(step)}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepText, currentStep >= step && styles.activeStepText]}>{step}</Text>
              </TouchableOpacity>
              {step < 5 && <View style={[styles.stepLine, currentStep > step && styles.activeStepLine]} />}
            </View>
          ))}
        </View>

        {/* 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {currentStep === 1 ? "장인 파트너 가입" : `장인 파트너 가입 (${currentStep}/5)`}
          </Text>
          <Text style={styles.subtitle}>
            {currentStep === 1 ? "한국의 전통문화를 널리 알리고 체험을 공유해보세요." : "파트너 신청을 위한 상세 정보를 입력해주세요."}
          </Text>
        </View>

        {/* 스텝 1: 기본 정보 입력 */}
        {currentStep === 1 && (
          <View style={styles.formSection}>
          
          {/* 대표자명 입력 */}
          <Text style={styles.inputLabel}>대표자(장인) 이름</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="실명을 입력해주세요"
              placeholderTextColor="#A39B92"
              value={masterName}
              onChangeText={setMasterName}
            />
          </View>

          {/* 연락처 입력 */}
          <Text style={styles.inputLabel}>연락처</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="010-0000-0000"
              placeholderTextColor="#A39B92"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
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
        )}

        {/* 스텝 2: 종목 선택 */}
        {currentStep === 2 && (
          <View style={styles.formSection}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>어떤 전통 공예를 다루시나요?</Text>
              <Text style={styles.stepSubtitle}>전문으로 하시는 종목을 모두 선택해주세요.</Text>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                      } else {
                        setSelectedCategories([...selectedCategories, cat.name]);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 스텝 3: 지역 선택 */}
        {currentStep === 3 && (
          <Step3Region
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            onSelectCity={setSelectedCity}
            onSelectDistrict={setSelectedDistrict}
          />
        )}
        
        {/* 스텝 4: 포트폴리오 및 경력 */}
        {currentStep === 4 && (
          <Step4Portfolio
            shortIntro={shortIntro}
            setShortIntro={setShortIntro}
            careerHistory={careerHistory}
            setCareerHistory={setCareerHistory}
            portfolioImages={portfolioImages}
            setPortfolioImages={setPortfolioImages}
            snsLink={snsLink}
            setSnsLink={setSnsLink}
          />
        )}

        {/* 약관 동의 영역 (간이 버전) */}
        {currentStep === 5 && (
          <View style={styles.formSection}>
            <Text style={[styles.placeholderText, { marginBottom: 30 }]}>스텝 5: 최종 확인 및 제출</Text>
            <View style={styles.termsSection}>
              <TouchableOpacity style={styles.termsCheckbox} activeOpacity={0.8} onPress={() => setIsTermsAgreed(!isTermsAgreed)}>
                <View style={[styles.checkboxCircle, isTermsAgreed && styles.checkboxCircleActive]}>
                  {isTermsAgreed && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.termsText}><Text style={{fontWeight: 'bold'}}>[필수]</Text> 파트너 이용약관 및 개인정보 처리방침 동의</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 회원가입 버튼 */}
        <TouchableOpacity 
          style={styles.signupButton} 
          activeOpacity={0.8}
          onPress={() => {
            if (currentStep === 2 && selectedCategories.length === 0) {
              Alert.alert("알림", "최소 1개 이상의 종목을 선택해주세요.");
              return;
            }
            if (currentStep === 3 && !selectedDistrict) {
              Alert.alert("알림", "상세 지역(구/군)을 선택해주세요.");
              return;
            }
            if (currentStep === 4 && !shortIntro) {
              Alert.alert("알림", "한 줄 소개를 필수로 입력해주세요.");
              return;
            }
            if (currentStep < 5) setCurrentStep(currentStep + 1);
            else {
              if (!isTermsAgreed) return Alert.alert("알림", "필수 약관에 동의해주세요.");
              navigation.navigate("SignUpComplete");
            }
          }}
        >
          <Text style={styles.signupButtonText}>
            {currentStep < 5 ? "다음 단계" : "가입완료 및 파트너 신청"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4F0',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 60,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAE6E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: { backgroundColor: '#3B2B26' },
  stepText: { fontSize: 13, color: '#8A8077', fontWeight: 'bold' },
  activeStepText: { color: '#FFF' },
  stepLine: { width: 14, height: 2, backgroundColor: '#EAE6E1', marginHorizontal: 4 },
  activeStepLine: { backgroundColor: '#3B2B26' },
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
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B2B26',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6E665F',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1, // 가로세로 1:1 비율
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4CDC4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginBottom: 12,
  },
  selectedCategoryCard: {
    backgroundColor: '#3B2B26',
    borderColor: '#3B2B26',
  },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryName: { fontSize: 13, color: '#6E665F', fontWeight: '600', textAlign: 'center' },
  selectedCategoryName: { color: '#FFF' },
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
  termsSection: { marginBottom: 36, paddingHorizontal: 4 },
  termsCheckbox: { flexDirection: 'row', alignItems: 'center' },
  checkboxCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#A39B92', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxCircleActive: { backgroundColor: '#3B2B26', borderColor: '#3B2B26' },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  termsText: { fontSize: 13, color: '#6E665F' },
  signupButton: {
    backgroundColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  placeholderSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    color: '#8A8077',
    fontSize: 15,
    fontWeight: '600',
  },
});