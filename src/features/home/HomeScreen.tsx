import { ScrollView, Text, TextInput, View } from "react-native";

import { CardNewsCarousel } from "../cardnews/CardNewsCarousel";
import { ExperienceList } from "../experiences/ExperienceList";

export function HomeScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 20, gap: 20 }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: "700" }}>장인과 하루</Text>
          <Text style={{ marginTop: 6, color: "#666" }}>K-콘텐츠 속 전통문화를 직접 체험하세요</Text>
        </View>

        <TextInput
          placeholder="장인 이름, 종목, 지역을 자연어로 검색"
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14 }}
        />

        <ExperienceList title="AI 추천 장인 체험" />
        <ExperienceList title="인기 체험" />
        <CardNewsCarousel />
      </View>
    </ScrollView>
  );
}
