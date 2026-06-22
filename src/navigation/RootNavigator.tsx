import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { NavigatorScreenParams } from "@react-navigation/native";
import { getCurrentProfile } from "@/features/auth/api/authApi";

import { OnboardingScreen, ONBOARDING_SEEN_KEY } from "@/features/onboarding/OnboardingScreen";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { GeneralSignUpScreen } from "@/features/auth/GeneralSignup/GeneralSignUpScreen";
import { MasterSignUpScreen } from "@/features/auth/MasterSignup/MasterSignUpScreen";
import { SignUpCompleteScreen } from "@/features/auth/SignUpCompleteScreen";
import { FindIdScreen } from "@/features/auth/FindIdScreen";
import { FindPasswordScreen } from "@/features/auth/FindPasswordScreen";
import { HomeScreen } from "@/features/general/home/HomeScreen";
import { SearchScreen } from "@/features/general/Search/SearchScreen";
import { AIrecommendationScreen } from "@/features/general/AI/AIrecommendationScreen";
import { BookingsScreen } from "@/features/general/bookings/BookingsScreen";
import { MyPageScreen } from "@/features/general/mypage/MyPageScreen";
import { BookingCreateScreen } from "@/features/general/bookings/BookingCreateScreen";
import type { Experience as BackendExperience } from "@/types/api";
import type { Experience as ExperienceViewModel } from "@/features/general/Search/SearchScreen";
import { BookingDetailScreen } from "@/features/general/bookings/BookingDetailScreen";
import { PaymentScreen } from "@/features/general/bookings/PaymentScreen";
import { BookingRequestCompleteScreen } from "@/features/general/bookings/BookingRequestCompleteScreen";
import { QRConfirmationScreen } from "@/features/general/bookings/QRConfirmationScreen";
import { Booking } from "@/features/general/bookings/BookingsScreen";
import { WishlistScreen } from "@/features/general/mypage/WishlistScreen";
import { ReviewScreen } from "@/features/general/review/ReviewScreen";
import { MyReviewsScreen } from "@/features/general/mypage/MyReviewsScreen";
import { SettingScreen } from "@/features/general/setting/SettingScreen";
import { MasterHomeScreen } from "@/features/master/masterHome/MasterHomeScreen";
import { MasterExperienceScreen } from "@/features/master/experienceManagement/MasterExperienceScreen";
import { MasterBookingsScreen } from "@/features/master/masterBookings/MasterBookingsScreen";
import { MasterBookingDetailScreen } from "@/features/master/masterBookings/MasterBookingDetailScreen";
import { MasterReviewsScreen } from "@/features/master/masterReviews/MasterReviewsScreen";
import { MasterReviewReplyScreen } from "@/features/master/masterReviews/MasterReviewReplyScreen";
import { MasterMyPageScreen } from "@/features/master/masterMypage/MasterMyPageScreen";
import { MasterExperienceCreateScreen } from "@/features/master/experienceManagement/MasterExperienceCreateScreen";
import { Step1BasicInfo } from "@/features/master/experienceManagement/experienceRegistration/Step1BasicInfo";
import { Step2Photos } from "@/features/master/experienceManagement/experienceRegistration/Step2Photos";
import { Step3Schedule } from "@/features/master/experienceManagement/experienceRegistration/Step3Schedule";
import { Step4Pricing } from "@/features/master/experienceManagement/experienceRegistration/Step4Pricing";
import { Step5Location } from "@/features/master/experienceManagement/experienceRegistration/Step5Location";
import { CardNewsListScreen } from "@/features/general/cardnews/CardNewsListScreen";
import { CardNewsDetailScreen } from "@/features/general/cardnews/CardNewsDetailScreen";
import { AIChatScreen } from "@/features/general/AI/AIChatScreen";
import { ArtisanDetailScreen } from "@/features/general/home/ArtisanDetailScreen";
import { MasterTodayStatusScreen } from "@/features/master/todayStatus/MasterTodayStatusScreen";
import { MasterProfileScreen } from "@/features/master/masterProfile/MasterProfileScreen";

export type CardNews = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  imageUri: string;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: { filter?: string; exp?: ExperienceViewModel } | undefined;
  AIRecommend: undefined;
  Bookings: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  GeneralSignUp: undefined;
  MasterSignUp: undefined;
  SignUpComplete: undefined;
  FindId: undefined;
  FindPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BookingCreate: { exp: ExperienceViewModel; experience: BackendExperience };
  BookingDetail: { booking: Booking };
  Payment: { exp: ExperienceViewModel; dateLabel: string; time: string; headcount: number; totalPrice: number; reservationId?: number };
  BookingRequestComplete: {
    reservationId: number;
    exp?: ExperienceViewModel;
    dateLabel?: string;
    time?: string;
    headcount?: number;
    totalPrice?: number;
    requestMessage?: string;
  };
  QRConfirmation: { booking: Booking };
  Wishlist: undefined;
  Review: { booking: Booking };
  MyReviews: undefined;
  Settings: undefined;
  MasterHome: undefined;
  MasterExperience: undefined;
  MasterBookings: undefined;
  MasterBookingDetail: { booking: any };
  MasterReviews: { repliedReviewId?: string; replyContent?: string } | undefined;
  MasterReviewReply: { review: any };
  MasterMyPage: undefined;
  MasterProfile: undefined;
  MasterExperienceCreate: undefined;
  Step1BasicInfo: undefined;
  Step2Photos: { title: string; shortDesc: string; detail: string } | undefined;
  Step3Schedule: { title: string; shortDesc: string; detail: string } | undefined;
  Step4Pricing: {
    title: string;
    shortDesc: string;
    detail: string;
    selectedDays: string[];
    timeSlots: { id: string; startTime: string; endTime: string }[];
  } | undefined;
  Step5Location: {
    title: string;
    shortDesc: string;
    detail: string;
    selectedDays: string[];
    timeSlots: { id: string; startTime: string; endTime: string }[];
    price: string;
    minGuests: number;
    maxGuests: number;
  } | undefined;
  CardNewsList: undefined;
  CardNewsDetail: { news: CardNews };
  AIChat: { news: CardNews };
  ArtisanDetail: undefined;
  MasterTodayStatus: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3B2B26",
        tabBarInactiveTintColor: "#A39B92",
        tabBarStyle: {
          backgroundColor: "#FAF9F6",
          borderTopColor: "#EAE6E1",
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Explore") iconName = focused ? "compass" : "compass-outline";
          else if (route.name === "AIRecommend") iconName = focused ? "sparkles" : "sparkles-outline";
          else if (route.name === "Bookings") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "MyPage") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "홈" }} />
      <Tab.Screen name="Explore" component={SearchScreen} options={{ title: "탐색" }} />
      <Tab.Screen name="AIRecommend" component={AIrecommendationScreen} options={{ title: "AI 추천" }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: "예약" }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Login");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getCurrentProfile().then(async (profile) => {
      if (profile) {
        setInitialRoute(profile.role === "ARTISAN" ? "MasterHome" : "MainTabs");
      } else {
        const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        if (!onboardingSeen) {
          setInitialRoute("Onboarding");
        }
      }
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F4F0" }}>
        <ActivityIndicator size="large" color="#3B2B26" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GeneralSignUp" component={GeneralSignUpScreen} />
      <Stack.Screen name="MasterSignUp" component={MasterSignUpScreen} />
      <Stack.Screen name="SignUpComplete" component={SignUpCompleteScreen} />
      <Stack.Screen name="FindId" component={FindIdScreen} />
      <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="BookingCreate" component={BookingCreateScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingRequestComplete" component={BookingRequestCompleteScreen} />
      <Stack.Screen name="QRConfirmation" component={QRConfirmationScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="Settings" component={SettingScreen} />
      <Stack.Screen name="MasterHome" component={MasterHomeScreen} options={{ animation: "none" }} />
      <Stack.Screen name="MasterExperience" component={MasterExperienceScreen} options={{ animation: "none" }} />
      <Stack.Screen name="MasterBookings" component={MasterBookingsScreen} options={{ animation: "none" }} />
      <Stack.Screen name="MasterBookingDetail" component={MasterBookingDetailScreen} />
      <Stack.Screen name="MasterReviews" component={MasterReviewsScreen} options={{ animation: "none" }} />
      <Stack.Screen name="MasterReviewReply" component={MasterReviewReplyScreen} />
      <Stack.Screen name="MasterMyPage" component={MasterMyPageScreen} options={{ animation: "none" }} />
      <Stack.Screen name="MasterProfile" component={MasterProfileScreen} />
      <Stack.Screen name="MasterExperienceCreate" component={MasterExperienceCreateScreen} />
      <Stack.Screen name="Step1BasicInfo" component={Step1BasicInfo} />
      <Stack.Screen name="Step2Photos" component={Step2Photos} />
      <Stack.Screen name="Step3Schedule" component={Step3Schedule} />
      <Stack.Screen name="Step4Pricing" component={Step4Pricing} />
      <Stack.Screen name="Step5Location" component={Step5Location} />
      <Stack.Screen name="CardNewsList" component={CardNewsListScreen} />
      <Stack.Screen name="CardNewsDetail" component={CardNewsDetailScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="ArtisanDetail" component={ArtisanDetailScreen} />
      <Stack.Screen name="MasterTodayStatus" component={MasterTodayStatusScreen} />
    </Stack.Navigator>
  );
}
