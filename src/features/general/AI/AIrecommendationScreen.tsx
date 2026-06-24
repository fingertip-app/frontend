import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainLayout } from "@/features/general/home/MainLayout";
import { apiPost } from "@/services/api";
import { MainTabParamList } from "@/navigation/RootNavigator";
import { Experience } from "@/features/general/Search/SearchScreen";

// ─── 팔레트 (기존 유지) ────────────────────────────────────────────────────────
const BG        = "#F5F0EA";
const BRAND     = "#3B2314";
const BRAND_MID = "#92400E";
const CHIP_BG   = "#FFFFFF";
const CHIP_BD   = "#DDD8D0";
const TEXT_MAIN = "#1C1410";
const TEXT_SUB  = "#7A6F65";
const AI_BUBBLE = "#FFFFFF";
const USER_BUBBLE = BRAND;

// ─── 대화 흐름 정의 ────────────────────────────────────────────────────────────
type Step =
  | "companion"
  | "vibe"
  | "budget"
  | "duration"
  | "done";

interface ConversationNode {
  aiText: string;
  chips?: string[];
  nextStep: Step | null;
}

const FLOW: Record<Step, ConversationNode> = {
  companion: {
    aiText: "안녕하세요! 어떤 분과 함께 체험을 찾고 계신가요?",
    chips: ["혼자요", "연인과 함께", "친구와 함께", "가족과 함께", "아이와 함께"],
    nextStep: "vibe",
  },
  vibe: {
    aiText: "어떤 분위기를 원하세요? 같이 뭔가 만들면서 집중하는 타입인지, 아니면 가볍게 즐기면서 얘기도 나누는 타입인지요.",
    chips: ["같이 만드는 게 좋아요", "가볍게 즐기고 싶어요", "색다른 문화 체험", "조용히 쉬고 싶어요"],
    nextStep: "budget",
  },
  budget: {
    aiText: "손으로 직접 만드는 체험이 잘 맞겠네요.\n\n도자기 물레나 매듭 같은 게 후기에서도 \"같이 왔는데 둘 다 집중했다\"는 말이 많아요. 예산은 어느 정도 생각하세요?",
    chips: ["2만원대", "3~5만원대", "상관없어요"],
    nextStep: "duration",
  },
  duration: {
    aiText: "좋아요! 마지막으로 체험 시간은 어느 정도가 좋으세요?",
    chips: ["1시간 이내", "1~2시간", "2~3시간", "3시간 이상"],
    nextStep: "done",
  },
  done: {
    aiText: "완벽해요! 딱 맞는 체험을 찾았어요 ✨",
    nextStep: null,
  },
};

// ─── 추천 결과 ─────────────────────────────────────────────────────────────────
// TODO: 백엔드 AI 추천 API 연동 필요
const MOCK_RECOMMENDATIONS: any[] = [];

// ─── 타입 ──────────────────────────────────────────────────────────────────────
type CompanionType = "ALONE" | "FRIEND" | "FAMILY" | "COUPLE" | "KIDS" | "FOREIGN_GUEST" | "OTHER";
type ConversationRole = "USER" | "ASSISTANT";
type TimePreference = "MORNING" | "AFTERNOON" | "EVENING" | "WEEKDAY" | "WEEKEND" | "ANYTIME";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  chips?: string[];
  showResults?: boolean;
  isFallback?: boolean;
  recommendations?: RecommendationCard[];
  resultGuide?: string;
  sources?: AiRecommendationSource[];
}

interface AiRecommendationSource {
  id: number;
  name: string;
  source: string;
  category: string;
}

interface RecommendationCard {
  id: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  imageUri: string;
  reason: string;
}

interface AiRecommendationRequest {
  freeText: string;
  companionType: CompanionType;
  headCount: number;
  interests: string[];
  region?: string;
  timePreference: TimePreference;
  conversationHistory: {
    role: ConversationRole;
    content: string;
  }[];
  locale: string;
}

interface AiRecommendationResponse {
  answer: string;
  sources?: AiRecommendationSource[];
  matchingKeywords: string[];
  recommendedTags: string[];
  recommendedExperiences: {
    id: number;
    title: string;
    location: string;
    price: number | string;
    durationMinutes?: number;
    tags?: string[];
    matchReason?: string;
  }[];
  fallback: boolean;
  message?: string | null;
}

const FALLBACK_RESULT_GUIDE = "AI 추천이 원활하지 않아 인기 체험을 보여드려요.";

const getFallbackRecommendations = (): RecommendationCard[] => MOCK_RECOMMENDATIONS;

const parsePrice = (price: number | string): number => {
  if (typeof price === "number") {
    return price;
  }

  const parsed = Number(price);
  return Number.isFinite(parsed) ? parsed : 0;
};

const inferCompanion = (text: string): { companionType: CompanionType; headCount: number } => {
  if (text.includes("혼자")) {
    return { companionType: "ALONE", headCount: 1 };
  }
  if (text.includes("연인")) {
    return { companionType: "COUPLE", headCount: 2 };
  }
  if (text.includes("친구")) {
    return { companionType: "FRIEND", headCount: 2 };
  }
  if (text.includes("가족")) {
    return { companionType: "FAMILY", headCount: 4 };
  }
  if (text.includes("아이")) {
    return { companionType: "KIDS", headCount: 2 };
  }
  return { companionType: "OTHER", headCount: 2 };
};

const inferInterests = (answers: string[]): string[] => {
  const combined = answers.join(" ");
  const interests = new Set<string>();

  if (/도자기|도예|물레|만들/.test(combined)) {
    interests.add("도예");
  }
  if (/매듭|공예|손/.test(combined)) {
    interests.add("공예");
  }
  if (/한지|문화|색다른/.test(combined)) {
    interests.add("전통문화");
  }
  if (/조용|쉬고/.test(combined)) {
    interests.add("힐링");
  }
  if (/가볍|즐기/.test(combined)) {
    interests.add("원데이클래스");
  }

  if (interests.size === 0) {
    interests.add("공예");
  }

  return Array.from(interests).slice(0, 5);
};

const inferTimePreference = (answers: string[]): TimePreference => {
  const combined = answers.join(" ");
  if (/주말/.test(combined)) {
    return "WEEKEND";
  }
  if (/평일/.test(combined)) {
    return "WEEKDAY";
  }
  if (/오전|아침/.test(combined)) {
    return "MORNING";
  }
  if (/오후|낮/.test(combined)) {
    return "AFTERNOON";
  }
  if (/저녁|밤/.test(combined)) {
    return "EVENING";
  }
  return "ANYTIME";
};

const buildRecommendationRequest = (messages: Message[]): AiRecommendationRequest => {
  const userAnswers = messages.filter((m) => m.role === "user").map((m) => m.text);
  const companion = inferCompanion(userAnswers[0] ?? "");
  const history = [
    ...messages.map((m) => ({
      role: m.role === "user" ? "USER" as const : "ASSISTANT" as const,
      content: m.text,
    })),
  ].slice(-10);

  return {
    freeText: userAnswers.join(" / ").slice(0, 500),
    companionType: companion.companionType,
    headCount: companion.headCount,
    interests: inferInterests(userAnswers),
    timePreference: inferTimePreference(userAnswers),
    conversationHistory: history,
    locale: "ko",
  };
};

const mapRecommendationResponse = (response: AiRecommendationResponse): RecommendationCard[] => {
  if (!response.recommendedExperiences?.length) {
    return getFallbackRecommendations();
  }

  return response.recommendedExperiences.map((item, index) => ({
    id: String(item.id),
    title: item.title,
    category: item.tags?.[0] ?? response.recommendedTags?.[0] ?? "전통 체험",
    location: item.location,
    rating: 4.8,
    reviewCount: 0,
    price: parsePrice(item.price),
    imageUri: `https://picsum.photos/seed/experience-${item.id || index}/300/200`,
    reason: item.matchReason ?? response.matchingKeywords?.join(", ") ?? "선택하신 취향과 잘 맞는 체험이에요.",
  }));
};

// ─── 결과 카드 ─────────────────────────────────────────────────────────────────
function ResultCard({ item, onPress }: { item: RecommendationCard; onPress: () => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <TouchableOpacity style={s.resultCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: item.imageUri }} style={s.resultImage} resizeMode="cover" />
      <View style={s.reasonBadge}>
        <Text style={s.reasonText}>✨ {item.reason}</Text>
      </View>
      <View style={s.resultInfo}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={s.resultCategory}>{item.category}</Text>
            <Text style={s.resultTitle} numberOfLines={2}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => setLiked((p) => !p)} hitSlop={8} style={{ marginLeft: 8 }}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#EF4444" : "#D1D5DB"}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT_MAIN }}>{item.rating}</Text>
          <Text style={{ fontSize: 12, color: TEXT_SUB }}>({item.reviewCount})</Text>
          <Text style={{ color: "#DDD8D0", marginHorizontal: 4 }}>·</Text>
          <Ionicons name="location-outline" size={12} color={TEXT_SUB} />
          <Text style={{ fontSize: 12, color: TEXT_SUB }}>{item.location}</Text>
        </View>
        <Text style={s.resultPrice}>{item.price.toLocaleString()}원~</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── AI 아바타 ─────────────────────────────────────────────────────────────────
function AIAvatar() {
  return (
    <View style={s.avatar}>
      <Text style={s.avatarText}>AI</Text>
    </View>
  );
}

// ─── 타이핑 인디케이터 ─────────────────────────────────────────────────────────
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={s.messageRow}>
      <AIAvatar />
      <View style={[s.aiBubble, { paddingHorizontal: 16, paddingVertical: 14 }]}>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[s.typingDot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const toExperience = (item: RecommendationCard): Experience => ({
  id: item.id,
  title: item.title,
  category: item.category,
  location: item.location,
  artisan: "",
  rating: item.rating,
  reviewCount: item.reviewCount,
  duration: "",
  price: item.price,
  tags: [item.category],
  imageUri: item.imageUri,
  difficulty: "초급",
});

// ─── 메인 스크린 ───────────────────────────────────────────────────────────────
export function AIrecommendationScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, "AIRecommend">>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      text: FLOW.companion.aiText,
      chips: FLOW.companion.chips,
    },
  ]);
  const [currentStep, setCurrentStep] = useState<Step>("companion");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chipsDisabled, setChipsDisabled] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const fetchRecommendations = async (updatedMessages: Message[]): Promise<Message> => {
    const request = buildRecommendationRequest(updatedMessages);

    try {
      const response = await apiPost<AiRecommendationRequest, AiRecommendationResponse>(
        "/v1/ai/recommendations",
        request,
      );

      return {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: response.answer || FLOW.done.aiText,
        showResults: true,
        isFallback: response.fallback,
        resultGuide: response.fallback
          ? response.message ?? FALLBACK_RESULT_GUIDE
          : "선택하신 취향을 바탕으로 가장 적합한 체험을 찾았어요.",
        recommendations: mapRecommendationResponse(response),
        sources: response.sources,
      };
    } catch {
      return {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "현재 AI 서버와의 연결이 원활하지 않아요. 우선 인기 체험을 보여드릴게요.",
        showResults: true,
        isFallback: true,
        resultGuide: FALLBACK_RESULT_GUIDE,
        recommendations: getFallbackRecommendations(),
      };
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // 현재 단계의 칩 비활성화
    setChipsDisabled(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };

    // 마지막 AI 메시지의 칩 제거 (선택 완료)
    const updatedMessages = messages.map((m, i) =>
      i === messages.length - 1 && m.role === "ai" ? { ...m, chips: undefined } : m
    );
    const nextMessages = [...updatedMessages, userMsg];
    setMessages(nextMessages);

    setInputText("");
    setIsTyping(true);
    scrollToBottom();

    // [추가] 서버 오류 시뮬레이션 (API 연동 전 테스트용)
    if (trimmed === "에러" || trimmed === "오류") {
      setTimeout(() => {
        setIsTyping(false);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "현재 AI 서버와의 연결이 원활하지 않아요. 우선 인기 체험을 보여드릴게요.",
          showResults: true,
          isFallback: true,
          resultGuide: FALLBACK_RESULT_GUIDE,
          recommendations: getFallbackRecommendations(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setCurrentStep("done");
        setChipsDisabled(false);
        scrollToBottom();
      }, 1200);
      return;
    }

    const nextStep = FLOW[currentStep]?.nextStep;

    setTimeout(() => {
      if (nextStep && nextStep !== "done") {
        const node = FLOW[nextStep];
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: node.aiText,
          chips: node.chips,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setCurrentStep(nextStep);
        setIsTyping(false);
        setChipsDisabled(false);
      } else {
        fetchRecommendations(nextMessages).then((finalMsg) => {
          setMessages((prev) => [...prev, finalMsg]);
          setCurrentStep("done");
          setIsTyping(false);
          setChipsDisabled(false);
          scrollToBottom();
        });
      }
      scrollToBottom();
    }, 1200);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "init",
        role: "ai",
        text: FLOW.companion.aiText,
        chips: FLOW.companion.chips,
      },
    ]);
    setCurrentStep("companion");
    setInputText("");
    setIsTyping(false);
    setChipsDisabled(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === "user") {
      return (
        <View style={[s.messageRow, s.userRow]}>
          <View style={s.userBubble}>
            <Text style={s.userBubbleText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        <View style={s.messageRow}>
          <AIAvatar />
          <View style={{ flex: 1 }}>
            <View style={s.aiBubble}>
              <Text style={s.aiBubbleText}>{item.text}</Text>
            </View>
            {/* 추천 결과 카드 */}
            {item.showResults && (
              <View style={{ marginTop: 14 }}>
                <Text style={[s.resultGuideText, item.isFallback && s.fallbackGuideText]}>
                  {item.resultGuide ?? (
                    item.isFallback
                      ? FALLBACK_RESULT_GUIDE
                      : "선택하신 취향을 바탕으로 가장 적합한 체험을 찾았어요."
                  )}
                </Text>
                {(item.recommendations ?? getFallbackRecommendations()).map((rec) => (
                  <ResultCard
                    key={rec.id}
                    item={rec}
                    onPress={() => navigation.navigate("Explore", { exp: toExperience(rec) })}
                  />
                ))}
                {!!item.sources?.length && (
                  <View style={s.sourcesBox}>
                    <Text style={s.sourcesTitle}>출처</Text>
                    {item.sources.map((src) => (
                      <Text key={src.id} style={s.sourceText}>
                        · {src.name} ({src.category}) — {src.source}
                      </Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity style={s.resetButton} onPress={handleReset} activeOpacity={0.8}>
                  <Ionicons name="refresh" size={15} color={TEXT_MAIN} />
                  <Text style={s.resetButtonText}>다시 추천받기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {/* 칩 선택지 */}
        {item.chips && !chipsDisabled && (
          <View style={s.chipsContainer}>
            {item.chips.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={s.chipOption}
                onPress={() => sendMessage(chip)}
                activeOpacity={0.75}
              >
                <Text style={s.chipOptionText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <MainLayout activeItem="AI추천">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: BG }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* 헤더 */}
        <View style={s.header}>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={TEXT_MAIN} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={s.headerDot} />
            <Text style={s.headerTitle}>AI 추천</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>

        {/* 채팅 영역 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={scrollToBottom}
        />

        {/* 입력창 */}
        <View style={s.inputContainer}>
          <TextInput
            style={s.textInput}
            placeholder="답변하거나 자유롭게 입력..."
            placeholderTextColor={TEXT_SUB}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!inputText.trim() || isTyping) && s.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 4 : 12,
    paddingBottom: 12,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D9",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_MAIN,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  // 채팅 콘텐츠
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  // 메시지 행
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 10,
  },
  userRow: {
    justifyContent: "flex-end",
  },

  // AI 아바타
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // AI 말풍선
  aiBubble: {
    backgroundColor: AI_BUBBLE,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  aiBubbleText: {
    fontSize: 15,
    color: TEXT_MAIN,
    lineHeight: 22,
  },

  // 유저 말풍선
  userBubble: {
    backgroundColor: USER_BUBBLE,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "72%",
  },
  userBubbleText: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
  },

  // 칩 선택지
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingLeft: 44,
    marginBottom: 14,
    marginTop: -4,
  },
  chipOption: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    borderWidth: 1,
    borderColor: CHIP_BD,
  },
  chipOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_MAIN,
  },

  // 타이핑 인디케이터
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C4BDB5",
  },

  // 입력창
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: "#E8E2D9",
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: CHIP_BD,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_MAIN,
    lineHeight: 20,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: "#C4BDB5",
  },
  
  // 결과 안내 텍스트
  resultGuideText: {
    fontSize: 13,
    color: TEXT_SUB,
    marginBottom: 10,
    marginLeft: 2,
  },
  fallbackGuideText: {
    color: "#D97706",
    fontWeight: "600",
  },

  // 결과 카드
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  resultImage: {
    width: "100%",
    height: 160,
  },
  reasonBadge: {
    position: "absolute",
    top: 126,
    left: 12,
    right: 12,
    backgroundColor: "rgba(59,35,20,0.82)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  reasonText: {
    fontSize: 12,
    color: "#FEF3E2",
    fontWeight: "600",
    lineHeight: 17,
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  resultCategory: {
    fontSize: 12,
    color: BRAND_MID,
    fontWeight: "600",
    marginBottom: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_MAIN,
    lineHeight: 23,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND_MID,
    marginTop: 8,
    textAlign: "right",
  },

  // 출처 목록
  sourcesBox: {
    backgroundColor: "#EFEAE2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_SUB,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: TEXT_SUB,
    lineHeight: 18,
  },

  // 다시 추천
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4DC",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 14,
    color: TEXT_MAIN,
    fontWeight: "700",
  },
});
