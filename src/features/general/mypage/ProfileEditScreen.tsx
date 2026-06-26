import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { MainLayout } from "@/features/general/home/MainLayout";
import { getCurrentProfile, updateProfile } from "@/features/auth/api/authApi";
import { uploadImage } from "@/features/files/api/filesApi";
import { UserProfile } from "@/features/auth/types";

const BG       = "#F7F4EF";
const BRAND    = "#3B2314";
const TEXT     = "#1C1410";
const TEXT_S   = "#7A6F65";
const BORDER   = "#E8E2D9";
const ICON_BG  = "#F0EBE4";

const CATEGORY_OPTIONS = ["도예", "한지공예", "목공", "염색", "매듭/자수", "전통음식", "기타"];

export function ProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const currentProfile = await getCurrentProfile();
        if (currentProfile) {
          setProfile(currentProfile);
          setName(currentProfile.name ?? "");
          setNickname(currentProfile.nickname ?? "");
          setPhone(currentProfile.phone ?? "");
          setProfileImageUrl(currentProfile.profileImageUrl ?? null);
          setPreferredCategories(currentProfile.preferredCategories ?? []);
        }
      } catch (e) {
        console.error("프로필 로드 실패:", e);
        Alert.alert("알림", "프로필 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleCategory = (category: string) => {
    setPreferredCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("알림", "사진을 변경하려면 카메라 롤 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    try {
      const asset = result.assets[0];
      const uploadedUrl = await uploadImage(
        { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType },
        "profile"
      );
      setProfileImageUrl(uploadedUrl);
    } catch (e) {
      console.error("이미지 업로드 실패:", e);
      Alert.alert("알림", "이미지 업로드에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !nickname.trim()) {
      Alert.alert("알림", "이름과 닉네임을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(name.trim(), nickname.trim(), phone.trim() || null, profileImageUrl, preferredCategories);
      navigation.goBack();
    } catch (e) {
      console.error("프로필 수정 실패:", e);
      Alert.alert("알림", "프로필 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={BRAND} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={8}>
          {saving ? (
            <ActivityIndicator size="small" color={BRAND} />
          ) : (
            <Text style={styles.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={TEXT_S} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
          placeholderTextColor={TEXT_S}
        />

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor={TEXT_S}
        />

        <Text style={styles.label}>이메일</Text>
        <View style={[styles.input, styles.inputDisabled]}>
          <Text style={styles.disabledText}>{profile?.email || ""}</Text>
        </View>

        <Text style={styles.label}>전화번호</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="전화번호를 입력하세요"
          placeholderTextColor={TEXT_S}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>관심 카테고리</Text>
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((category) => {
            const selected = preferredCategories.includes(category);
            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCategory(category)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: TEXT },
  saveText: { fontSize: 14, fontWeight: "700", color: BRAND },
  scroll: { padding: 24, paddingBottom: 60 },
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: ICON_BG, alignItems: "center", justifyContent: "center" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BG,
  },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_S, marginBottom: 8, marginTop: 18 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT,
    backgroundColor: "#FFFFFF",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
  },
  disabledText: {
    fontSize: 14,
    color: TEXT_S,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontSize: 13, fontWeight: "500", color: TEXT_S },
  chipTextSelected: { color: "#FFF" },
});
