import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { logout } from "@/features/auth/api/authApi";
import { useMasterAccount } from "@/features/master/hooks/useMasterAccount";
import { useTheme } from "@/theme/ThemeContext";

const GREEN = "#2D7D5A";
const GREEN_BG = "#E8F5EF";

const ACCOUNT_MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "lock-closed-outline", label: "비밀번호 변경" },
  { icon: "notifications-outline", label: "알림 설정" },
  { icon: "help-circle-outline", label: "고객센터 문의" },
];

// ── 섹션 헤더 ──────────────────────────────────────────
interface SectionHeaderProps {
  icon: any;
  title: string;
}
function SectionHeader({ icon, title }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={sh.row}>
      <Ionicons name={icon as any} size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
      <Text style={[sh.title, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14, marginTop: 4 },
  title: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
});

// ── 인풋 필드 ───────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
  note?: string;
}
function Field({ label, value, onChange, editing, multiline, placeholder, maxLength, note }: FieldProps) {
  const { colors } = useTheme();
  return (
    <View style={f.wrap}>
      <View style={f.labelRow}>
        <Text style={[f.label, { color: colors.textSecondary }]}>{label}</Text>
        {maxLength && editing && (
          <Text style={[f.counter, { color: colors.textSecondary }]}>{value.length}/{maxLength}</Text>
        )}
      </View>
      {editing ? (
        <TextInput
          style={[f.input, multiline && f.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bg }]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          maxLength={maxLength}
        />
      ) : (
        <Text style={[f.value, { color: colors.text }, multiline && { lineHeight: 22 }]}>{value || <Text style={{ color: colors.textSecondary }}>{placeholder}</Text>}</Text>
      )}
      {note && <Text style={[f.note, { color: colors.textSecondary }]}>{note}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  counter: { fontSize: 11 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 15 },
  textarea: { minHeight: 90, paddingTop: 12 },
  value: { fontSize: 15, fontWeight: "400", paddingVertical: 2 },
  note: { fontSize: 11, marginTop: 5 },
});

// ── 태그 입력 ────────────────────────────────────────────
interface TagFieldProps {
  tags: string[];
  editing: boolean;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}
function TagField({ tags, editing, onAdd, onRemove }: TagFieldProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState("");
  return (
    <View style={t.wrap}>
      <View style={t.tags}>
        {tags.map((tag) => (
          <View key={tag} style={[t.tag, { backgroundColor: colors.border }]}>
            <Text style={[t.tagText, { color: colors.accent }]}>{tag}</Text>
            {editing && (
              <TouchableOpacity onPress={() => onRemove(tag)} hitSlop={8}>
                <Ionicons name="close" size={12} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {editing && (
          <View style={[t.inputWrap, { borderColor: colors.border }]}>
            <TextInput
              style={[t.input, { color: colors.text }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="+ 태그 추가"
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={() => {
                if (draft.trim()) { onAdd(draft.trim()); setDraft(""); }
              }}
              returnKeyType="done"
            />
          </View>
        )}
      </View>
    </View>
  );
}
const t = StyleSheet.create({
  wrap: { marginBottom: 20 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "500" },
  inputWrap: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  input: { fontSize: 13, minWidth: 80 },
});

// ── SNS 링크 행 ──────────────────────────────────────────
interface SnsRowProps {
  icon: any;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  editing: boolean;
}
function SnsRow({ icon, placeholder, value, onChange, editing }: SnsRowProps) {
  const { colors } = useTheme();
  return (
    <View style={[sn.row, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
      {editing ? (
        <TextInput
          style={[sn.input, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      ) : (
        <Text style={[sn.value, { color: value ? colors.text : colors.textSecondary }]}>{value || placeholder}</Text>
      )}
    </View>
  );
}
const sn = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1 },
  input: { flex: 1, fontSize: 14 },
  value: { flex: 1, fontSize: 14 },
});

// ── 설정 토글 행 ─────────────────────────────────────────
interface ToggleRowProps {
  icon: any;
  label: string;
  sub?: string;
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}
function ToggleRow({ icon, label, sub, value, onChange, disabled }: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <View style={tr.row}>
      <View style={[tr.icon, { backgroundColor: colors.border }]}>
        <Ionicons name={icon as any} size={17} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tr.label, { color: colors.text }]}>{label}</Text>
        {sub && <Text style={[tr.sub, { color: colors.textSecondary }]}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.card}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}
const tr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 14, fontWeight: "500" },
  sub: { fontSize: 12, marginTop: 2 },
});

// ── 메인 화면 ────────────────────────────────────────────
export function MasterProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const { data, error, reload } = useMasterAccount();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [career, setCareer] = useState("");
  const [intro, setIntro] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");
  const [openToBooking, setOpenToBooking] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [acceptNewcomer, setAcceptNewcomer] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      void reload();
    }, [reload])
  );

  React.useEffect(() => {
    if (!data) return;
    const certification = data.profile.certificationNumber
      ? ` · ${data.profile.certificationNumber}`
      : "";
    setName(data.profile.name);
    setDesc(`${data.profile.heritageCategory}${certification}`);
    setIntro(data.profile.bio ?? "");
    setTags(data.profile.heritageCategory ? [data.profile.heritageCategory] : []);
  }, [data]);

  React.useEffect(() => {
    if (error) Alert.alert("오류", error.message);
  }, [error]);

  const handleSave = () => {
    Alert.alert("알림", "장인 프로필 수정 API 구현이 필요합니다.");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch {
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  const handleComingSoon = () => {
    Alert.alert("알림", "준비 중인 기능입니다.");
  };

  const handleUnsupportedEdit = () => {
    Alert.alert("알림", "장인 프로필 수정 API 구현이 필요합니다.");
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bg }]}>
      {/* ── 헤더 ── */}
      <View style={[s.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={s.headerSide}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>장인 프로필</Text>
        <View style={s.headerSide}>
          {isEditing ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={handleCancel} hitSlop={8}>
                <Text style={[s.cancelBtn, { color: colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} hitSlop={8}>
                <Text style={s.saveBtn}>저장</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleUnsupportedEdit}
              hitSlop={10}
              style={[s.editBtnWrap, { backgroundColor: colors.border }]}
            >
              <Ionicons name="pencil" size={14} color={colors.accent} />
              <Text style={[s.editBtn, { color: colors.accent }]}>수정</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 프로필 이미지 + 뱃지 ── */}
        <View style={s.heroSection}>
          <View style={s.imageWrap}>
            <Image
              source={{ uri: data?.profile.imageUrl }}
              style={[s.profileImage, { backgroundColor: colors.border, borderColor: colors.card }]}
            />
            {isEditing && (
              <TouchableOpacity style={[s.cameraBtn, { backgroundColor: colors.text, borderColor: colors.bg }]} activeOpacity={0.8} onPress={handleComingSoon}>
                <Ionicons name="camera" size={16} color={colors.bg} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ alignItems: "center", marginTop: 14 }}>
            <Text style={[s.heroName, { color: colors.text }]}>{name}</Text>
            <Text style={[s.heroDesc, { color: colors.textSecondary }]}>{desc}</Text>
            <View style={s.heroBadgeRow}>
              <View style={s.badge}>
                <Ionicons name="shield-checkmark" size={12} color={GREEN} />
                <Text style={s.badgeText}>
                  {data?.profile.isVerified ? "인증완료" : "인증대기"}
                </Text>
              </View>
              {location ? (
                <View style={[s.badge, { backgroundColor: colors.border }]}>
                  <Ionicons name="location" size={12} color={colors.accent} />
                  <Text style={[s.badgeText, { color: colors.accent }]}>{location}</Text>
                </View>
              ) : null}
              {career ? (
                <View style={[s.badge, { backgroundColor: colors.border }]}>
                  <Ionicons name="time" size={12} color={colors.textSecondary} />
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>{career}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── 기본 정보 ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="person-outline" title="기본 정보" />
          <Field label="이름 (또는 공방명)" value={name} onChange={setName} editing={isEditing} placeholder="이름을 입력하세요" maxLength={20} />
          <Field label="타이틀 (분야 및 자격)" value={desc} onChange={setDesc} editing={isEditing} placeholder="예: 국가무형문화재 제105호 도예" maxLength={40} />
          <Field label="활동 지역" value={location} onChange={setLocation} editing={isEditing} placeholder="예: 경기도 이천시" />
          <Field label="경력" value={career} onChange={setCareer} editing={isEditing} placeholder="예: 25년 경력" />
          <View style={{ marginBottom: 4 }}>
            <View style={f.labelRow}>
              <Text style={[f.label, { color: colors.textSecondary }]}>전문 분야 태그</Text>
            </View>
            <TagField
              tags={tags}
              editing={isEditing}
              onAdd={(t) => setTags((prev) => [...prev, t])}
              onRemove={(t) => setTags((prev) => prev.filter((x) => x !== t))}
            />
          </View>
        </View>

        {/* ── 소개글 ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="document-text-outline" title="소개글" />
          <Field
            label="나의 공방 소개"
            value={intro}
            onChange={setIntro}
            editing={isEditing}
            multiline
            placeholder="공방 소개를 작성해 주세요"
            maxLength={300}
            note="체험 신청 전 예약자에게 표시됩니다."
          />
        </View>

        {/* ── SNS / 링크 ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="link-outline" title="SNS / 링크" />
          <SnsRow icon="logo-instagram" placeholder="인스타그램 계정" value={instagram} onChange={setInstagram} editing={isEditing} />
          <SnsRow icon="logo-youtube" placeholder="유튜브 채널 링크" value={youtube} onChange={setYoutube} editing={isEditing} />
          <SnsRow icon="globe-outline" placeholder="웹사이트 주소" value={website} onChange={setWebsite} editing={isEditing} />
        </View>

        {/* ── 예약 설정 ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="settings-outline" title="예약 설정" />
          <ToggleRow
            icon="calendar-outline"
            label="예약 받기"
            sub="비활성화 시 새 예약이 차단됩니다"
            value={openToBooking}
            onChange={setOpenToBooking}
            disabled
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            icon="star-outline"
            label="후기 공개"
            sub="프로필에서 후기 노출 여부"
            value={showReviews}
            onChange={setShowReviews}
            disabled
          />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ToggleRow
            icon="people-outline"
            label="초보자 환영"
            sub="프로필에 초보자 환영 뱃지 표시"
            value={acceptNewcomer}
            onChange={setAcceptNewcomer}
            disabled
          />
        </View>

        {/* ── 통계 (읽기 전용) ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="bar-chart-outline" title="내 활동 통계" />
          <View style={s.statGrid}>
            {[
              { label: "누적 예약", value: `${data?.stats.totalReservationCount ?? 0}건` },
              { label: "누적 후기", value: `${data?.stats.reviewCount ?? 0}개` },
              { label: "평균 평점", value: `★ ${(data?.stats.averageRating ?? 0).toFixed(1)}` },
              { label: "응답률", value: "-" },
            ].map((item) => (
              <View key={item.label} style={[s.statItem, { backgroundColor: colors.bg }]}>
                <Text style={[s.statValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 계정 관리 ── */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="shield-outline" title="계정" />
          {ACCOUNT_MENU_ITEMS.map((item, i, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={handleComingSoon}>
                <View style={[s.menuIcon, { backgroundColor: colors.border }]}>
                  <Ionicons name={item.icon} size={17} color={colors.accent} />
                </View>
                <Text style={[s.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={s.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 13,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSide: { minWidth: 60, alignItems: "flex-end" },
  editBtnWrap: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtn: { fontSize: 13, fontWeight: "600" },
  saveBtn: { fontSize: 14, fontWeight: "700", color: GREEN },
  cancelBtn: { fontSize: 14, fontWeight: "500" },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  heroSection: { alignItems: "center", paddingVertical: 28 },
  imageWrap: { position: "relative" },
  profileImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 3 },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2,
  },
  heroName: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  heroDesc: { fontSize: 13, marginBottom: 10 },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: GREEN_BG, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600", color: GREEN },

  card: {
    borderRadius: 16, padding: 20,
    marginBottom: 12, borderWidth: 1,
  },

  divider: { height: 1, marginVertical: 2 },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: {
    flex: 1, minWidth: "44%",
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12 },

  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500" },

  logoutBtn: { alignSelf: "center", marginTop: 8, paddingVertical: 10, paddingHorizontal: 32 },
  logoutText: { fontSize: 14, color: "#D97706", fontWeight: "500" },
});
