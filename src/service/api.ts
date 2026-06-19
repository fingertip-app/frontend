import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Android 에뮬레이터는 localhost 대신 10.0.2.2 IP를 사용해야 호스트 PC의 서버와 통신할 수 있습니다.
const localApiHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${localApiHost}:8080/api`;

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  // Supabase 로그인 후 저장된 JWT 토큰 가져오기
  const token = await SecureStore.getItemAsync("access_token") || "";

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// 토큰 저장 (로그인 성공 후 호출)
export const saveTokens = async (access_token: string, refresh_token: string) => {
  await SecureStore.setItemAsync("access_token", access_token);
  await SecureStore.setItemAsync("refresh_token", refresh_token);
};

// 토큰 삭제 (로그아웃 후 호출)
export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
};