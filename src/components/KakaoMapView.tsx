import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Platform, TouchableOpacity, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

// 웹 환경에서 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapViewProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: number;
  markerTitle?: string;
}

export function KakaoMapView({
  latitude,
  longitude,
  address,
  height = 160,
  markerTitle = "위치",
}: KakaoMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY;

  // 카카오맵 앱/웹 열기
  const openKakaoMap = () => {
    const url = `https://map.kakao.com/link/map/${encodeURIComponent(markerTitle)},${latitude},${longitude}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      // 모바일: 카카오맵 앱 우선, 없으면 웹
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://map.kakao.com/?q=${latitude},${longitude}`);
      });
    }
  };

  // 웹 플랫폼에서는 카카오맵 SDK 직접 사용
  useEffect(() => {
    if (Platform.OS === "web" && mapContainerRef.current) {
      // 카카오맵 SDK 스크립트 로드
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            const container = mapContainerRef.current;
            if (!container) return;

            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: 3,
            };

            const map = new window.kakao.maps.Map(container, options);

            // 마커 생성
            const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
            });
            marker.setMap(map);

            // 인포윈도우 생성 (주소 표시)
            if (address) {
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:8px 12px;font-size:12px;white-space:nowrap;">${address}</div>`,
              });
              infowindow.open(map, marker);
            }
          });
        }
      };

      document.head.appendChild(script);

      return () => {
        // cleanup: 스크립트 제거
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [Platform.OS, latitude, longitude, address, apiKey]);

  // 웹 플랫폼 렌더링
  if (Platform.OS === "web") {
    if (!apiKey || apiKey === "YOUR_KAKAO_API_KEY_HERE") {
      return (
        <View style={[styles.container, { height }, styles.placeholder]}>
          <Ionicons name="map-outline" size={40} color="#A09080" />
          <Text style={styles.placeholderText}>카카오맵 API 키 필요</Text>
          <Text style={styles.placeholderSubtext}>KAKAO_MAP_SETUP.md 참고</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.container, { height }]}
        activeOpacity={0.9}
        onPress={openKakaoMap}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
            pointerEvents: "none", // 터치가 부모로 전달되도록
          }}
        />
        {address && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: "rgba(255,255,255,0.55)",
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
              <Ionicons name="location-outline" size={13} color="#1C1107" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1C1107" }}>
                {address}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 12, color: "#1C1107" }}>카카오맵 열기</Text>
              <Ionicons name="chevron-forward" size={14} color="#1C1107" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // API 키가 없거나 기본값인 경우 플레이스홀더 표시
  if (!apiKey || apiKey === "YOUR_KAKAO_API_KEY_HERE") {
    return (
      <View style={[styles.container, { height }, styles.placeholder]}>
        <Ionicons name="map-outline" size={40} color="#A09080" />
        <Text style={styles.placeholderText}>카카오맵 API 키 필요</Text>
        <Text style={styles.placeholderSubtext}>KAKAO_MAP_SETUP.md 참고</Text>
      </View>
    );
  }

  // 카카오맵 HTML 생성
  const kakaoMapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        window.kakao.maps.load(() => {
          const container = document.getElementById('map');
          const options = {
            center: new window.kakao.maps.LatLng(${latitude}, ${longitude}),
            level: 3
          };

          const map = new window.kakao.maps.Map(container, options);

          // 마커 생성
          const markerPosition = new window.kakao.maps.LatLng(${latitude}, ${longitude});
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: "${markerTitle}"
          });

          marker.setMap(map);

          // 인포윈도우 생성 (주소 표시)
          ${address ? `
          const infowindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:8px 12px;font-size:12px;white-space:nowrap;">${address}</div>'
          });
          infowindow.open(map, marker);
          ` : ''}
        });
      </script>
    </body>
    </html>
  `;

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      activeOpacity={0.9}
      onPress={openKakaoMap}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: kakaoMapHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#8B6F5E" />
          </View>
        )}
        scrollEnabled={false}
        pointerEvents="none"
      />
      {address && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: "rgba(255,255,255,0.55)",
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
            <Ionicons name="location-outline" size={13} color="#1C1107" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1C1107" }}>
              {address}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12, color: "#1C1107" }}>카카오맵 열기</Text>
            <Ionicons name="chevron-forward" size={14} color="#1C1107" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E8E2D9",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E2D9",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B2B26",
    marginTop: 8,
  },
  placeholderSubtext: {
    fontSize: 11,
    color: "#A09080",
  },
});
