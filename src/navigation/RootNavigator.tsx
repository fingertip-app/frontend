import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { BookingsScreen } from "../features/bookings/BookingsScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import { MyPageScreen } from "../features/mypage/MyPageScreen";

export type RootTabParamList = {
  Home: undefined;
  Bookings: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "홈" }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: "예약" }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이" }} />
    </Tab.Navigator>
  );
}
