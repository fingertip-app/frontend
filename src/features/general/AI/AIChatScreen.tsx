import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { explainCulture } from "@/features/ai/api/aiApi";
import { ApiError } from "@/services/api";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sources?: Array<{ name: string; source: string }>;
}

export function AIChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "AIChat">>();
  const { news } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 초기 진입 시 카드뉴스 제목으로 자동 질문
  useEffect(() => {
    if (!news.title || news.title.trim().length === 0) {
      console.warn('⚠️ news.title is empty, skipping initial question');
      return;
    }
    const initQuestion = `${news.title}에 대해 알려주세요`;
    handleAskQuestion(initQuestion, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // news는 route params로 불변, handleAskQuestion은 재생성되므로 의도적으로 빈 배열

  const handleAskQuestion = async (question: string, isInitial: boolean = false) => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length === 0) {
      console.warn('⚠️ Question is empty, skipping');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedQuestion,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    if (!isInitial) setInputText("");
    setIsLoading(true);

    try {
      const response = await explainCulture(trimmedQuestion);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.fallback
          ? response.message || "AI 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요."
          : response.answer,
        sender: 'ai',
        sources: response.sources?.map(s => ({ name: s.name, source: s.source })),
      };

      setMessages(prev => [...prev, aiMessage]);

      // 스크롤을 맨 아래로
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      let errorMsg = "AI 서비스에 연결할 수 없습니다.";
      if (error instanceof ApiError) {
        if (error.status === 503 || error.status === 504) {
          errorMsg = "AI 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMsg = error.message || errorMsg;
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    handleAskQuestion(inputText);
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
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === 'ai' ? styles.aiBubble : styles.userBubble]}>
              <Text style={item.sender === 'ai' ? styles.aiText : styles.userText}>{item.text}</Text>
              {item.sender === 'ai' && item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesContainer}>
                  <Text style={styles.sourcesLabel}>출처</Text>
                  {item.sources.map((source: { name: string; source: string }, idx: number) => (
                    <Text key={idx} style={styles.sourceText}>
                      • {source.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B2B26" />
            <Text style={styles.loadingText}>AI가 답변을 생성하고 있어요...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="AI에게 질문해보세요..."
            placeholderTextColor="#A39B92"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
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
  chatContainer: { padding: 20, paddingBottom: 10 },
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
  sourcesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAE6E1',
  },
  sourcesLabel: {
    fontSize: 12,
    color: '#7A6F65',
    fontWeight: '600',
    marginBottom: 6,
  },
  sourceText: {
    fontSize: 12,
    color: '#7A6F65',
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7A6F65',
  },
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
});