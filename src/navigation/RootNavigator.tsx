import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { LoginScreen } from "../features/auth/LoginScreen";
import { GeneralSignUpScreen } from "../features/auth/GeneralSignup/GeneralSignUpScreen";
import { MasterSignUpScreen } from "../features/auth/MasterSignup/MasterSignUpScreen";
import { SignUpCompleteScreen } from "../features/auth/SignUpCompleteScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import { SearchScreen } from "../features/Search/SearchScreen";
import { AIrecommendationScreen } from "../features/AI/AIrecommendationScreen";
import { BookingsScreen } from "../features/bookings/BookingsScreen";
import { MyPageScreen } from "../features/mypage/MyPageScreen";

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  AIRecommend: undefined;
  Bookings: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  GeneralSignUp: undefined;
  MasterSignUp: undefined;
  SignUpComplete: undefined;
  MainTabs: undefined;
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
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GeneralSignUp" component={GeneralSignUpScreen} />
      <Stack.Screen name="MasterSignUp" component={MasterSignUpScreen} />
      <Stack.Screen name="SignUpComplete" component={SignUpCompleteScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
