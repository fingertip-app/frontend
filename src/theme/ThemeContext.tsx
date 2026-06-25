import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { darkColors, lightColors, ThemeColors } from "./colors";

export type ThemeMode = "light" | "dark" | "auto";

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: "light" | "dark";
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "theme_mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("auto");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "auto") {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const scheme = mode === "auto" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const colors = scheme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, scheme, colors, setMode }),
    [mode, scheme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
