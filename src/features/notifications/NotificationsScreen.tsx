import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentProfile } from "@/features/auth/api/authApi";
import { useTheme } from "@/theme/ThemeContext";
import type { Notification } from "@/types/api";
import {
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./api/notificationsApi";

export function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const loadNotifications = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setNotifications([]);
        return;
      }
      setUserId(profile.id);
      const data = await getUnreadNotifications(profile.id);
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
    if (notification.isRead) return;

    try {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      Alert.alert("오류", "알림 읽음 처리에 실패했습니다.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    const unreadCount = notifications.filter((item) => !item.isRead).length;
    if (unreadCount === 0) {
      Alert.alert("안내", "읽지 않은 알림이 없습니다.");
      return;
    }

    try {
      await markAllNotificationsAsRead(userId);
      setNotifications([]);
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

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          isUnread && { borderColor: colors.accent },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Ionicons
              name={isUnread ? "notifications" : "notifications-outline"}
              size={18}
              color={isUnread ? colors.accent : colors.textSecondary}
            />
          </View>
          <View style={styles.notificationTextBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
            </View>
            <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="notifications-off-outline" size={34} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>알림이 없습니다</Text>
      <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
        예약 상태 변경 등의 알림을 여기서 확인할 수 있어요.
      </Text>
    </View>
  );

  const renderHeader = (showAction: boolean) => (
    <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>알림</Text>
      {showAction ? (
        <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={10}>
          <Text style={[styles.markAllText, { color: colors.accent }]}>전체 읽음</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 52 }} />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        {renderHeader(false)}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {renderHeader(true)}
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
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  markAllText: { fontSize: 13, fontWeight: "700" },
  listContent: { padding: 20, paddingBottom: 40 },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationTextBlock: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 9,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
