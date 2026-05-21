import { Text, View } from "react-native";

export function CardNewsCarousel() {
  // TODO(예솔): 가로 캐러셀, 상세 전환, 공유 버튼을 구현한다.
  // TODO(영진): 카드뉴스 API와 개인화 정렬을 연결한다.
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>한물결 카드뉴스</Text>
      <View style={{ borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 14 }}>
        <Text style={{ fontWeight: "700" }}>K-콘텐츠 속 자수, 조선 왕실 기법입니다</Text>
        <Text style={{ marginTop: 4, color: "#666" }}>AI 해설과 전통 자수 체험으로 연결</Text>
      </View>
    </View>
  );
}
