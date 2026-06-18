import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Category } from "./Step2Category";
import { Step3Region } from "./Step3Region";
import { Step4Portfolio } from "./Step4Portfolio";
import { Step5Terms } from "./Step5Terms";
import { applyArtisan, signUp } from "@/features/auth/api/authApi";

export function MasterSignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [masterName, setMasterName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [shortIntro, setShortIntro] = useState("");
  const [careerHistory, setCareerHistory] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [snsLink, setSnsLink] = useState("");
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; uri: string } | null>(null);
  const [bio, setBio] = useState("");

  const buildApplicationBio = () => {
    const lines = [
      shortIntro.trim(),
      "",
      "[전문 분야]",
      selectedCategories.join(", "),
      "",
      "[활동 지역]",
      selectedRegions.join(", "),
      "",
      "[주요 이력 및 경력]",
      careerHistory.trim() || "미입력",
      "",
      "[약력 및 주요 활동]",
      bio.trim() || "미입력",
      "",
      "[SNS/웹사이트]",
      snsLink.trim() || "미입력",
      "",
      "[대표 작품 사진]",
      portfolioImages.length > 0
        ? `${portfolioImages.length}장 선택됨 - 파일 업로드 API 연동 후 별도 저장 필요`
        : "미첨부",
      "",
      "[자격 증명 서류]",
      uploadedFile?.name
        ? `${uploadedFile.name} - 파일 업로드 API 연동 후 별도 저장 필요`
        : "미첨부",
    ];

    return lines.join("\n").trim();
  };

  const submitMasterApplication = async () => {
    if (!uploadedFile) return Alert.alert("알림", "자격 증명 서류(파일)를 첨부해주세요.");
    if (!isTermsAgreed || !isPrivacyAgreed) return Alert.alert("알림", "필수 약관에 동의해주세요.");

    setIsLoading(true);
    try {
      const { needsEmailVerification, accessToken } = await signUp(email, password, nickname, masterName);

      if (needsEmailVerification) {
        Alert.alert(
          "이메일 인증 필요",
          "가입하신 이메일로 인증 메일을 발송했습니다.\n인증 후 로그인하면 장인 신청을 이어서 제출해야 합니다.",
          [{ text: "확인", onPress: () => navigation.navigate("SignUpComplete") }]
        );
        return;
      }

      if (!accessToken) {
        throw new Error("가입 세션을 확인할 수 없어 장인 신청을 제출하지 못했습니다. 로그인 후 다시 시도해주세요.");
      }

      await applyArtisan({
        name: masterName.trim(),
        heritageCategory: selectedCategories[0],
        bio: buildApplicationBio(),
      }, accessToken);

      navigation.navigate("SignUpComplete");
    } catch (e) {
      Alert.alert("파트너 신청 실패", e instanceof Error ? e.message : "파트너 신청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* 상단 5단계 스텝 인디케이터 */}
        <View style={styles.stepContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={styles.stepWrapper}>
              <View style={[styles.stepCircle, currentStep >= step && styles.activeStepCircle]}>
                <Text style={[styles.stepText, currentStep >= step && styles.activeStepText]}>{step}</Text>
              </View>
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
          <Step1BasicInfo
            masterName={masterName} setMasterName={setMasterName}
            nickname={nickname} setNickname={setNickname}
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
            onSkipTest={() => setCurrentStep(2)}
          />
        )}

        {/* 스텝 2: 종목 선택 */}
        {currentStep === 2 && (
          <Step2Category
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        )}

        {/* 스텝 3: 지역 선택 */}
        {currentStep === 3 && (
          <Step3Region
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
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
          <Step5Terms
            isTermsAgreed={isTermsAgreed} setIsTermsAgreed={setIsTermsAgreed}
            isPrivacyAgreed={isPrivacyAgreed} setIsPrivacyAgreed={setIsPrivacyAgreed}
            isMarketingAgreed={isMarketingAgreed} setIsMarketingAgreed={setIsMarketingAgreed}
            uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
            bio={bio} setBio={setBio}
          />
        )}

        {/* 회원가입 버튼 */}
        <TouchableOpacity 
          style={[styles.signupButton, isLoading && { opacity: 0.6 }]} 
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={async () => {
            if (currentStep === 1) {
              if (!masterName) return Alert.alert("알림", "대표자(장인) 이름을 입력해주세요.");
              if (!nickname) return Alert.alert("알림", "닉네임을 입력해주세요.");
              if (!phoneNumber) return Alert.alert("알림", "연락처를 입력해주세요.");
              if (phoneNumber.length < 12) return Alert.alert("알림", "올바른 연락처를 입력해주세요.");
              if (!email) return Alert.alert("알림", "아이디(이메일)를 입력해주세요.");
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) return Alert.alert("알림", "올바른 이메일 형식을 입력해주세요.");
              if (!password) return Alert.alert("알림", "비밀번호를 입력해주세요.");
              const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
              if (!passwordRegex.test(password)) return Alert.alert("알림", "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
              if (password !== passwordConfirm) return Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
            }
            if (currentStep === 2 && selectedCategories.length === 0) {
              Alert.alert("알림", "최소 1개 이상의 종목을 선택해주세요.");
              return;
            }
            if (currentStep === 3 && selectedRegions.length === 0) {
              Alert.alert("알림", "활동 지역을 하나 이상 선택해주세요.");
              return;
            }
            if (currentStep === 4 && !shortIntro) {
              Alert.alert("알림", "한 줄 소개를 필수로 입력해주세요.");
              return;
            }
            if (currentStep < 5) setCurrentStep(currentStep + 1);
            else {
              await submitMasterApplication();
            }
          }}
        >
          {isLoading
            ? <ActivityIndicator color="#FFF" />
            : (
              <Text style={styles.signupButtonText}>
                {currentStep < 5 ? "다음 단계" : "가입완료 및 파트너 신청"}
              </Text>
            )
          }
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
  signupButton: {
    backgroundColor: '#3B2B26',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
