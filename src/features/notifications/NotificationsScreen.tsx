import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "./api/notificationsApi";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import type { Notification } from "@/types/api";

const BRAND = "#3D1F0D";
const GRAY = "#8C7B6E";
const BORDER = "#EDE8E2";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";
const UNREAD_BG = "#FFF9F0";

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const loadNotifications = async (isRefresh: boolean = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setNotifications([]);
        return;
      }
      setUserId(profile.id);
      const data = await getUserNotifications(profile.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      Alert.alert("오류", "알림을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        // API 성공 후 UI 업데이트
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
        Alert.alert("오류", "알림 읽음 처리에 실패했습니다.");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) {
      Alert.alert("안내", "읽지 않은 알림이 없습니다.");
      return;
    }

    try {
      await markAllNotificationsAsRead(userId);
      // API 성공 후 UI 업데이트
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      Alert.alert("오류", "알림 읽음 처리에 실패했습니다.");
    }
  };

  const formatRelativeTime = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return created.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.isRead && <View style={styles.unreadBadge} />}
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationTime}>{formatRelativeTime(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={GRAY} />
      <Text style={styles.emptyTitle}>알림이 없습니다</Text>
      <Text style={styles.emptyDesc}>예약 상태 변경 등의 알림을 여기서 확인할 수 있어요.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#1C1107" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>알림</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1C1107" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={10}>
          <Text style={styles.markAllText}>전체 읽음</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={BRAND}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1107" },
  markAllText: { fontSize: 14, color: BRAND, fontWeight: "600" },
  listContent: { padding: 16 },
  notificationCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  notificationCardUnread: {
    backgroundColor: UNREAD_BG,
    borderColor: "#FFE4B5",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND,
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: "#3B2B26",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: GRAY,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: GRAY,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
