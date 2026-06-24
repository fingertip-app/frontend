import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ArtisanMapProps {
  latitude: number;
  longitude: number;
  artisanName: string;
  address?: string;
}

// 지도 플레이스홀더 — Expo Go에서는 react-native-maps 네이티브 모듈을 사용할 수 없어
// 커스텀 dev client 빌드 전까지는 다른 화면(DetailBottomSheet)과 동일하게 플레이스홀더로 표시
export function ArtisanMap({ latitude, longitude, artisanName, address }: ArtisanMapProps) {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="map-outline" size={40} color="#A09080" />
      <Text style={styles.label}>{artisanName}</Text>
      {address && <Text style={styles.address}>{address}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EBE4",
  },
  label: { fontSize: 13, fontWeight: "600", color: "#3B2B26", marginTop: 8 },
  address: { fontSize: 12, color: "#8A8077", marginTop: 2 },
});
