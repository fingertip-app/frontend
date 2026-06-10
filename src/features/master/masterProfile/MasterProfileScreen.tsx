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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#3B2B26";
const BG = "#F5F4F0";
const CARD = "#FFFFFF";
const GRAY = "#8A8077";
const BORDER = "#EAE6E1";
const ACCENT = "#7C5C52";
const ACCENT_LIGHT = "#F2EBE8";
const GREEN = "#2D7D5A";
const GREEN_BG = "#E8F5EF";

// ── 섹션 헤더 ──────────────────────────────────────────
interface SectionHeaderProps {
  icon: any;
  title: string;
}
function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View style={sh.row}>
      <Ionicons name={icon as any} size={15} color={GRAY} style={{ marginRight: 6 }} />
      <Text style={sh.title}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14, marginTop: 4 },
  title: { fontSize: 12, fontWeight: "700", color: GRAY, letterSpacing: 0.8, textTransform: "uppercase" },
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
  return (
    <View style={f.wrap}>
      <View style={f.labelRow}>
        <Text style={f.label}>{label}</Text>
        {maxLength && editing && (
          <Text style={f.counter}>{value.length}/{maxLength}</Text>
        )}
      </View>
      {editing ? (
        <TextInput
          style={[f.input, multiline && f.textarea]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholder={placeholder}
          placeholderTextColor="#C2BAB3"
          maxLength={maxLength}
        />
      ) : (
        <Text style={[f.value, multiline && { lineHeight: 22 }]}>{value || <Text style={{ color: "#C2BAB3" }}>{placeholder}</Text>}</Text>
      )}
      {note && <Text style={f.note}>{note}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  label: { fontSize: 12, fontWeight: "600", color: GRAY, letterSpacing: 0.3 },
  counter: { fontSize: 11, color: "#C2BAB3" },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 15, color: BRAND, backgroundColor: "#FAF9F6" },
  textarea: { minHeight: 90, paddingTop: 12 },
  value: { fontSize: 15, color: BRAND, fontWeight: "400", paddingVertical: 2 },
  note: { fontSize: 11, color: "#C2BAB3", marginTop: 5 },
});

// ── 태그 입력 ────────────────────────────────────────────
interface TagFieldProps {
  tags: string[];
  editing: boolean;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}
function TagField({ tags, editing, onAdd, onRemove }: TagFieldProps) {
  const [draft, setDraft] = useState("");
  return (
    <View style={t.wrap}>
      <View style={t.tags}>
        {tags.map((tag) => (
          <View key={tag} style={t.tag}>
            <Text style={t.tagText}>{tag}</Text>
            {editing && (
              <TouchableOpacity onPress={() => onRemove(tag)} hitSlop={8}>
                <Ionicons name="close" size={12} color={ACCENT} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {editing && (
          <View style={t.inputWrap}>
            <TextInput
              style={t.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="+ 태그 추가"
              placeholderTextColor="#C2BAB3"
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
  tag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: ACCENT_LIGHT, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, color: ACCENT, fontWeight: "500" },
  inputWrap: { borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  input: { fontSize: 13, color: BRAND, minWidth: 80 },
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
  return (
    <View style={sn.row}>
      <Ionicons name={icon as any} size={18} color={GRAY} style={{ marginRight: 10 }} />
      {editing ? (
        <TextInput
          style={sn.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#C2BAB3"
          autoCapitalize="none"
        />
      ) : (
        <Text style={[sn.value, !value && { color: "#C2BAB3" }]}>{value || placeholder}</Text>
      )}
    </View>
  );
}
const sn = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: BORDER },
  input: { flex: 1, fontSize: 14, color: BRAND },
  value: { flex: 1, fontSize: 14, color: BRAND },
});

// ── 설정 토글 행 ─────────────────────────────────────────
interface ToggleRowProps {
  icon: any;
  label: string;
  sub?: string;
  value: boolean;
  onChange: (val: boolean) => void;
}
function ToggleRow({ icon, label, sub, value, onChange }: ToggleRowProps) {
  return (
    <View style={tr.row}>
      <View style={tr.icon}>
        <Ionicons name={icon as any} size={17} color={ACCENT} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={tr.label}>{label}</Text>
        {sub && <Text style={tr.sub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: BORDER, true: ACCENT }}
        thumbColor={CARD}
        ios_backgroundColor={BORDER}
      />
    </View>
  );
}
const tr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: ACCENT_LIGHT, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 14, fontWeight: "500", color: BRAND },
  sub: { fontSize: 12, color: GRAY, marginTop: 2 },
});

// ── 메인 화면 ────────────────────────────────────────────
export function MasterProfileScreen() {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("김도예 장인");
  const [desc, setDesc] = useState("국가무형문화재 제105호 도예");
  const [location, setLocation] = useState("경기도 이천시");
  const [career, setCareer] = useState("25년 경력");
  const [intro, setIntro] = useState(
    "3대째 이어오는 이천 도자기 공방입니다. 전통 물레 기법을 활용하여 일상에 스며드는 따뜻한 도자기를 빚고 있습니다."
  );
  const [tags, setTags] = useState(["도자기", "물레성형", "전통유약", "이천도자기"]);
  const [instagram, setInstagram] = useState("@kimdo.craft");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("www.kimdoye.com");
  const [openToBooking, setOpenToBooking] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [acceptNewcomer, setAcceptNewcomer] = useState(true);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("저장 완료", "프로필이 업데이트되었습니다.");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={s.headerSide}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>장인 프로필</Text>
        <View style={s.headerSide}>
          {isEditing ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={handleCancel} hitSlop={8}>
                <Text style={s.cancelBtn}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} hitSlop={8}>
                <Text style={s.saveBtn}>저장</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              hitSlop={10}
              style={s.editBtnWrap}
            >
              <Ionicons name="pencil" size={14} color={ACCENT} />
              <Text style={s.editBtn}>수정</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 프로필 이미지 + 뱃지 ── */}
        <View style={s.heroSection}>
          <View style={s.imageWrap}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&q=80" }}
              style={s.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={s.cameraBtn} activeOpacity={0.8}>
                <Ionicons name="camera" size={16} color={CARD} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ alignItems: "center", marginTop: 14 }}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroDesc}>{desc}</Text>
            <View style={s.heroBadgeRow}>
              <View style={s.badge}>
                <Ionicons name="shield-checkmark" size={12} color={GREEN} />
                <Text style={s.badgeText}>인증완료</Text>
              </View>
              <View style={[s.badge, { backgroundColor: ACCENT_LIGHT }]}>
                <Ionicons name="location" size={12} color={ACCENT} />
                <Text style={[s.badgeText, { color: ACCENT }]}>{location}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: "#F0EBE8" }]}>
                <Ionicons name="time" size={12} color={GRAY} />
                <Text style={[s.badgeText, { color: GRAY }]}>{career}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 기본 정보 ── */}
        <View style={s.card}>
          <SectionHeader icon="person-outline" title="기본 정보" />
          <Field label="이름 (또는 공방명)" value={name} onChange={setName} editing={isEditing} placeholder="이름을 입력하세요" maxLength={20} />
          <Field label="타이틀 (분야 및 자격)" value={desc} onChange={setDesc} editing={isEditing} placeholder="예: 국가무형문화재 제105호 도예" maxLength={40} />
          <Field label="활동 지역" value={location} onChange={setLocation} editing={isEditing} placeholder="예: 경기도 이천시" />
          <Field label="경력" value={career} onChange={setCareer} editing={isEditing} placeholder="예: 25년 경력" />
          <View style={{ marginBottom: 4 }}>
            <View style={f.labelRow}>
              <Text style={f.label}>전문 분야 태그</Text>
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
        <View style={s.card}>
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
        <View style={s.card}>
          <SectionHeader icon="link-outline" title="SNS / 링크" />
          <SnsRow icon="logo-instagram" placeholder="인스타그램 계정" value={instagram} onChange={setInstagram} editing={isEditing} />
          <SnsRow icon="logo-youtube" placeholder="유튜브 채널 링크" value={youtube} onChange={setYoutube} editing={isEditing} />
          <SnsRow icon="globe-outline" placeholder="웹사이트 주소" value={website} onChange={setWebsite} editing={isEditing} />
        </View>

        {/* ── 예약 설정 ── */}
        <View style={s.card}>
          <SectionHeader icon="settings-outline" title="예약 설정" />
          <ToggleRow
            icon="calendar-outline"
            label="예약 받기"
            sub="비활성화 시 새 예약이 차단됩니다"
            value={openToBooking}
            onChange={setOpenToBooking}
          />
          <View style={s.divider} />
          <ToggleRow
            icon="star-outline"
            label="후기 공개"
            sub="프로필에서 후기 노출 여부"
            value={showReviews}
            onChange={setShowReviews}
          />
          <View style={s.divider} />
          <ToggleRow
            icon="people-outline"
            label="초보자 환영"
            sub="프로필에 초보자 환영 뱃지 표시"
            value={acceptNewcomer}
            onChange={setAcceptNewcomer}
          />
        </View>

        {/* ── 통계 (읽기 전용) ── */}
        <View style={s.card}>
          <SectionHeader icon="bar-chart-outline" title="내 활동 통계" />
          <View style={s.statGrid}>
            {[
              { label: "누적 예약", value: "312건" },
              { label: "누적 후기", value: "127개" },
              { label: "평균 평점", value: "★ 4.9" },
              { label: "응답률", value: "98%" },
            ].map((item) => (
              <View key={item.label} style={s.statItem}>
                <Text style={s.statValue}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 계정 관리 ── */}
        <View style={s.card}>
          <SectionHeader icon="shield-outline" title="계정" />
          {[
            { icon: "lock-closed-outline", label: "비밀번호 변경" },
            { icon: "notifications-outline", label: "알림 설정" },
            { icon: "help-circle-outline", label: "고객센터 문의" },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.6}>
                <View style={s.menuIcon}>
                  <Ionicons name={item.icon} size={17} color={ACCENT} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={BORDER} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.7}>
          <Text style={s.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 13,
    backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: BRAND },
  headerSide: { minWidth: 60, alignItems: "flex-end" },
  editBtnWrap: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: ACCENT_LIGHT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtn: { fontSize: 13, fontWeight: "600", color: ACCENT },
  saveBtn: { fontSize: 14, fontWeight: "700", color: GREEN },
  cancelBtn: { fontSize: 14, fontWeight: "500", color: GRAY },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  heroSection: { alignItems: "center", paddingVertical: 28 },
  imageWrap: { position: "relative" },
  profileImage: { width: 96, height: 96, borderRadius: 48, backgroundColor: BORDER, borderWidth: 3, borderColor: CARD },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: BRAND, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: BG,
  },
  heroName: { fontSize: 20, fontWeight: "700", color: BRAND, marginBottom: 4 },
  heroDesc: { fontSize: 13, color: GRAY, marginBottom: 10 },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: GREEN_BG, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600", color: GREEN },

  card: {
    backgroundColor: CARD, borderRadius: 16, padding: 20,
    marginBottom: 12, borderWidth: 1, borderColor: BORDER,
  },

  divider: { height: 1, backgroundColor: BORDER, marginVertical: 2 },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: {
    flex: 1, minWidth: "44%", backgroundColor: BG,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "700", color: BRAND, marginBottom: 4 },
  statLabel: { fontSize: 12, color: GRAY },

  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: ACCENT_LIGHT, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: BRAND },

  logoutBtn: { alignSelf: "center", marginTop: 8, paddingVertical: 10, paddingHorizontal: 32 },
  logoutText: { fontSize: 14, color: "#D97706", fontWeight: "500" },
});