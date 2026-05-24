import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>탐색 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F4F0" },
  text: { fontSize: 20, fontWeight: "bold", color: "#3B2B26" },
});