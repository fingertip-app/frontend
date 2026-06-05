import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MainLayout } from "@/features/home/MainLayout";

export function ExploreScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.text}>탐색 화면</Text>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold", color: "#3B2B26" },
});