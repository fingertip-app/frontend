import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Path } from "react-native-svg";

type LogoMarkProps = {
  size?: number;
  radius?: number;
};

/** 손끝 아이콘 마크 — 달/해와 산세 능선을 담은 칠흑 타일. */
export function LogoMark({ size = 36, radius }: LogoMarkProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size * 0.28,
        overflow: "hidden",
      }}
    >
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Rect width={100} height={100} fill="#0A0A0E" />
        <Circle cx={67} cy={29} r={12.5} fill="#EAD3BE" />
        <Circle cx={71} cy={26} r={12.5} fill="#0A0A0E" opacity={0.18} />
        <Path
          d="M0 70 L18 48 L30 60 L46 35 L60 56 L74 44 L100 63 L100 100 L0 100 Z"
          fill="#CBBCC2"
        />
        <Path
          d="M0 81 L22 61 L40 78 L58 59 L78 76 L100 67 L100 100 L0 100 Z"
          fill="#D49C88"
        />
        <Path
          d="M0 92 L30 79 L52 90 L74 80 L100 89 L100 100 L0 100 Z"
          fill="#46414F"
        />
        <Path
          d="M0 70 L18 48 L30 60 L46 35 L60 56 L74 44 L100 63"
          fill="none"
          stroke="#C9A24B"
          strokeWidth={1}
          opacity={0.55}
        />
        <Path
          d="M0 81 L22 61 L40 78 L58 59 L78 76 L100 67"
          fill="none"
          stroke="#C9A24B"
          strokeWidth={1}
          opacity={0.45}
        />
      </Svg>
    </View>
  );
}

type WordmarkProps = {
  size?: number;
  color?: string;
  captionColor?: string;
  showCaption?: boolean;
};

/** "손끝 · FINGERTIP" 워드마크 — 헤더/로그인 화면 등에서 마크와 함께 사용. */
export function Wordmark({
  size = 22,
  color = "#3B2B26",
  captionColor = "#9C8F77",
  showCaption = false,
}: WordmarkProps) {
  return (
    <View style={styles.wordmark}>
      <Text style={[styles.title, { fontSize: size, color }]}>손끝</Text>
      {showCaption && (
        <Text style={[styles.caption, { color: captionColor }]}>FINGERTIP</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { alignItems: "center" },
  title: { fontWeight: "900", letterSpacing: 0.4 },
  caption: { fontSize: 11, letterSpacing: 2, marginTop: 2, fontStyle: "italic" },
});
