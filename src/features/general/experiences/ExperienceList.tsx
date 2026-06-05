import { Text, View } from "react-native";

type ExperienceListProps = {
  title: string;
};

export function ExperienceList({ title }: ExperienceListProps) {
  // TODO(예솔): TanStack Query로 /experiences API를 연결하고 카드 컴포넌트로 분리한다.
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{title}</Text>
      <View style={{ borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 14 }}>
        <Text style={{ fontWeight: "700" }}>달항아리 물레 체험</Text>
        <Text style={{ marginTop: 4, color: "#666" }}>서울 · 도자기 · 65,000원</Text>
      </View>
    </View>
  );
}
