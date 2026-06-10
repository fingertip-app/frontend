import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";

// Dummy messages
const DUMMY_MESSAGES = [
  { id: '1', text: '안녕하세요! 무엇이 궁금하신가요? "K-콘텐츠 속 자수"에 대해 설명해드릴게요.', sender: 'ai' },
  { id: '2', text: '조선 왕실에서 사용된 자수 기법에 대해 더 자세히 알려주세요.', sender: 'user' },
  { id: '3', text: '네, 조선 왕실에서는 주로 궁중의 수요를 충족시키기 위한 자수, 즉 궁수(宮繡)가 발달했습니다. 궁수는 전문적인 수방(繡房)에 소속된 자수장(刺繡匠)들에 의해 제작되었으며, 왕과 왕비의 용포(龍袍)나 각종 의례복, 그리고 생활용품에 정교하고 화려하게 수놓아졌습니다.', sender: 'ai' },
];

export function AIChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "AIChat">>();
  const { news } = route.params;
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    const newMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    // TODO: AI 응답 로직 추가
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#3B2B26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 문화 해설</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === 'ai' ? styles.aiBubble : styles.userBubble]}>
              <Text style={item.sender === 'ai' ? styles.aiText : styles.userText}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="AI에게 질문해보세요..."
            placeholderTextColor="#A39B92"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F0' },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F4F0',
    borderBottomWidth: 1, borderBottomColor: '#EAE6E1'
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#3B2B26" },
  chatContainer: { padding: 20 },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EAE6E1',
  },
  userBubble: {
    backgroundColor: '#3B2B26',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiText: { fontSize: 15, color: '#3B2B26', lineHeight: 22 },
  userText: { fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderTopWidth: 1, borderTopColor: '#EAE6E1', backgroundColor: '#F5F4F0',
  },
  input: {
    flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE6E1',
    borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, maxHeight: 100,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B2B26',
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
});