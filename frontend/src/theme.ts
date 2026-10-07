// Design tokens for this app ("Luxe" palette) — dark + light variants with a runtime theme switch.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

import { storage } from "./utils/storage";

export type ColorScheme = "light" | "dark";
export type ThemePreference = ColorScheme | "system";

const dark = {
  surface: "#0D110D",
  onSurface: "#F2F4F0",
  surfaceSecondary: "#182118",
  onSurfaceSecondary: "#D8DED5",
  surfaceTertiary: "#212C21",
  onSurfaceTertiary: "#B6C2B2",
  surfaceInverse: "#F2F4F0",
  onSurfaceInverse: "#0D110D",
  muted: "#889985",

  brand: "#C5A861",
  onBrand: "#0D110D",
  brandPrimary: "#C5A861",
  onBrandPrimary: "#0D110D",
  brandSecondary: "#34523B",
  onBrandSecondary: "#F2F4F0",
  brandTertiary: "#34523B",
  onBrandTertiary: "#C5A861",

  success: "#4CAF50",
  onSuccess: "#FFFFFF",
  warning: "#D99B41",
  onWarning: "#FFFFFF",
  error: "#CF5353",
  onError: "#FFFFFF",
  info: "#4B7A99",
  onInfo: "#FFFFFF",

  border: "#2E3D2E",
  borderStrong: "#455945",
  divider: "#1E291E",
};

export type ThemeColors = typeof dark;

const light: ThemeColors = {
  surface: "#F7F4EC",
  onSurface: "#141A14",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#2A332A",
  surfaceTertiary: "#ECE6D7",
  onSurfaceTertiary: "#4A564A",
  surfaceInverse: "#141A14",
  onSurfaceInverse: "#F7F4EC",
  muted: "#6E7A6E",

  brand: "#9A7B33",
  onBrand: "#FFFFFF",
  brandPrimary: "#9A7B33",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#34523B",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#DCEBDF",
  onBrandTertiary: "#34523B",

  success: "#2E7D32",
  onSuccess: "#FFFFFF",
  warning: "#B8782A",
  onWarning: "#FFFFFF",
  error: "#B93A3A",
  onError: "#FFFFFF",
  info: "#3A6B8C",
  onInfo: "#FFFFFF",

  border: "#DDD6C6",
  borderStrong: "#BFB6A2",
  divider: "#E9E3D5",
};

export const defaultScheme = "dark" satisfies ColorScheme;
export const themes: Record<ColorScheme, ThemeColors> = { light, dark };

// Static fallback (used before the provider mounts, e.g. splash background).
export const colors = dark;

const THEME_KEY = "tidhkar.theme";

type ThemeCtx = {
  scheme: ColorScheme;
  colors: ThemeColors;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeCtx>({ scheme: "dark", colors: dark, preference: "dark", setPreference: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>("dark");

  useEffect(() => {
    storage.getItem<ThemePreference>(THEME_KEY, "dark").then((p) => {
      if (p === "light" || p === "dark" || p === "system") setPref(p);
    });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    storage.setItem(THEME_KEY, p);
  }, []);

  const scheme: ColorScheme = preference === "system" ? (system === "light" ? "light" : "dark") : preference;

  useEffect(() => {
    Appearance.setColorScheme?.(scheme);
  }, [scheme]);

  const value = useMemo(
    () => ({ scheme, colors: themes[scheme], preference, setPreference }),
    [scheme, preference, setPreference],
  );
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
