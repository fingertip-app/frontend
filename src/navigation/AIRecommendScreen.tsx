import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function AIRecommendScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI 추천 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F4F0" },
  text: { fontSize: 20, fontWeight: "bold", color: "#3B2B26" },
});