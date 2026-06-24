import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./RootNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 세션 만료(401) 등으로 강제 로그아웃되었을 때 어디서든 로그인 화면으로 보내기 위한 헬퍼.
export function redirectToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
  }
}
