import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Experience } from "./SearchScreen";
import { RootStackParamList } from "@/navigation/RootNavigator";

const BRAND = "#3D1F0D";
const BRAND_BUTTON = "#3D1F0D";
const BRAND_BG = "#F5F0EB";
const ICON_BG = "#EDE8E2";

type Props = {
  exp: Experience;
  onClose: () => void;
};

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        gap: 6,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: ICON_BG,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 12, color: "#6B5E52", textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

function IncludeItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1, gap: 8 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: ICON_BG,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 12, color: "#6B5E52", textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

export function DetailBottomSheet({ exp, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const shortDesc =
    "흙을 만지고, 나만의 그릇을 만들어보는 시간. 장인의 친절한 지도로 누구나 쉽게 즐길 수 있습니다. 이천의 고요한 공방에서 전통 물레의 리듬을 느끼며 일상의 복잡함을 잊어보세요.";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
      }}
    >
      {/* 딤드 배경 */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* 시트 콘텐츠 */}
      <View
        style={{
          backgroundColor: "#FAFAF8",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: "90%",
          overflow: "hidden",
        }}
      >
        {/* 드래그 핸들 */}
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#D6CFC8",
            alignSelf: "center",
            marginTop: 12,
            marginBottom: 0,
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* 썸네일 이미지 */}
          <Image
            source={{ uri: exp.imageUri }}
            style={{ width: "100%", height: 240 }}
            resizeMode="cover"
          />

          {/* 메인 콘텐츠 */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {/* 제목 */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#1C1107",
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              {exp.title}
            </Text>

            {/* 위치 · 장인 · 별점 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: "#8C7B6E" }}>
                {exp.location} · {exp.artisan}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1107" }}>
                  4.9
                </Text>
                <Text style={{ fontSize: 13, color: "#8C7B6E" }}>(128)</Text>
              </View>
            </View>

            {/* 정보 칩 4개 */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <InfoChip
                icon={<Ionicons name="time-outline" size={20} color={BRAND} />}
                label="2시간"
              />
              <InfoChip
                icon={<Ionicons name="construct-outline" size={20} color={BRAND} />}
                label="초급"
              />
              <InfoChip
                icon={<Ionicons name="people-outline" size={20} color={BRAND} />}
                label="1~6명"
              />
              <InfoChip
                icon={<Ionicons name="language-outline" size={20} color={BRAND} />}
                label="한국어, 영어"
              />
            </View>

            {/* 구분선 */}
            <View style={{ height: 1, backgroundColor: "#EDE8E2", marginBottom: 24 }} />

            {/* 체험 소개 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#1C1107",
                marginBottom: 12,
              }}
            >
              체험 소개
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#4B3D33",
                lineHeight: 22,
                marginBottom: 8,
              }}
              numberOfLines={expanded ? undefined : 4}
            >
              {shortDesc}
            </Text>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 14, color: BRAND, fontWeight: "600" }}>
                {expanded ? "접기" : "더보기"}
              </Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={BRAND}
              />
            </TouchableOpacity>

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: "#EDE8E2", marginTop: 24, marginBottom: 24 }}
            />

            {/* 장인 소개 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#1C1107",
                marginBottom: 14,
              }}
            >
              장인 소개
            </Text>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
                marginBottom: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: ICON_BG,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 28 }}>🧑‍🎨</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: "#1C1107" }}
                  >
                    {exp.artisan}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#8C7B6E", marginTop: 2 }}>
                    국가무형유산 제105호 사기장 이수자
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B3D33",
                  lineHeight: 20,
                  marginTop: 12,
                }}
                numberOfLines={2}
              >
                30년간 도자기의 길을 걸어왔습니다. 전통의 가치를 현대적으로 풀어내는 즈
              </Text>
            </View>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 14, color: BRAND, fontWeight: "600" }}>
                장인 이야기 보기
              </Text>
              <Ionicons name="chevron-forward" size={14} color={BRAND} />
            </TouchableOpacity>

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: "#EDE8E2", marginTop: 24, marginBottom: 24 }}
            />

            {/* 포함 사항 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#1C1107",
                marginBottom: 16,
              }}
            >
              포함 사항
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 4,
              }}
            >
              <IncludeItem
                icon={<Ionicons name="construct-outline" size={22} color={BRAND} />}
                label="재료 및 도구"
              />
              <IncludeItem
                icon={<Ionicons name="shirt-outline" size={22} color={BRAND} />}
                label="앞치마"
              />
              <IncludeItem
                icon={<Ionicons name="cube-outline" size={22} color={BRAND} />}
                label="완성품 소성"
              />
              <IncludeItem
                icon={<Ionicons name="cafe-outline" size={22} color={BRAND} />}
                label="음료 제공"
              />
            </View>

            {/* 구분선 */}
            <View
              style={{ height: 1, backgroundColor: "#EDE8E2", marginTop: 24, marginBottom: 24 }}
            />

            {/* 위치 안내 */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#1C1107",
                marginBottom: 14,
              }}
            >
              위치 안내
            </Text>
            <View
              style={{
                height: 160,
                backgroundColor: "#E8E2D9",
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* 지도 플레이스홀더 — 실제 MapView로 교체 가능 */}
              <Ionicons name="map-outline" size={40} color="#A09080" />
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
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#1C1107" }}
                >
                  📍 {exp.location}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 하단 고정 버튼 */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === "ios" ? 34 : 20,
            backgroundColor: "#FAFAF8",
            borderTopWidth: 1,
            borderTopColor: "#EDE8E2",
          }}
        >
          {/* 가격 + 버튼 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View>
              <Text style={{ fontSize: 11, color: "#8C7B6E" }}>1인 기준</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1C1107",
                  letterSpacing: -0.5,
                }}
              >
                35,000{" "}
                <Text style={{ fontSize: 14, fontWeight: "500" }}>원~</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                onClose(); // 팝업 닫기
                // 예약 화면으로 이동하며 데이터 전달 (RootNavigator에 스크린 등록 필요)
                navigation.navigate("BookingCreate", { exp });
              }}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: BRAND_BUTTON,
                borderRadius: 50,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                날짜 선택하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}