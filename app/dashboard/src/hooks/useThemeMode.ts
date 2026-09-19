import { useColorMode } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import {
  ACCENT_PALETTES,
  ACCENT_STORAGE_KEY,
  AccentColor,
  applyAccentColorToDom,
  applyThemeModeToDom,
  getInitialAccentColor,
  ThemeMode,
} from "utils/themeColor";
import { create } from "zustand";

export const THEME_STORAGE_KEY = "marzdar-theme-mode";

export const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "black") {
    return saved;
  }
  const chakraMode = localStorage.getItem("chakra-ui-color-mode");
  if (chakraMode === "dark") return "dark";
  return "light";
};

interface ThemeStore {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeModeState: (mode: ThemeMode) => void;
  setAccentColorState: (accent: AccentColor) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: getInitialThemeMode(),
  accentColor: getInitialAccentColor(),
  setThemeModeState: (mode: ThemeMode) => set({ themeMode: mode }),
  setAccentColorState: (accent: AccentColor) => set({ accentColor: accent }),
}));

export const useThemeMode = () => {
  const { colorMode, setColorMode } = useColorMode();
  const themeMode = useThemeStore((s) => s.themeMode);
  const accentColor = useThemeStore((s) => s.accentColor);
  const setThemeModeState = useThemeStore((s) => s.setThemeModeState);
  const setAccentColorState = useThemeStore((s) => s.setAccentColorState);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      localStorage.setItem(
        "chakra-ui-color-mode",
        mode === "black" ? "dark" : mode
      );

      applyThemeModeToDom(mode, accentColor);

      const targetColorMode = mode === "black" ? "dark" : mode;
      if (colorMode !== targetColorMode) {
        setColorMode(targetColorMode);
      }

      // Re-apply on next animation frame to guarantee attributes remain intact after Chakra colorMode updates
      requestAnimationFrame(() => {
        applyThemeModeToDom(mode, accentColor);
      });
    },
    [colorMode, setColorMode, setThemeModeState, accentColor]
  );

  const setAccentColor = useCallback(
    (accent: AccentColor) => {
      setAccentColorState(accent);
      localStorage.setItem(ACCENT_STORAGE_KEY, accent);
      applyAccentColorToDom(accent);

      requestAnimationFrame(() => {
        applyAccentColorToDom(accent);
      });
    },
    [setAccentColorState]
  );

  useEffect(() => {
    // Initial sync
    const currentMode = getInitialThemeMode();
    const currentAccent = getInitialAccentColor();
    applyThemeModeToDom(currentMode, currentAccent);
    applyAccentColorToDom(currentAccent);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (newMode === "light" || newMode === "dark" || newMode === "black") {
          setThemeModeState(newMode);
          applyThemeModeToDom(newMode, accentColor);
          const target = newMode === "black" ? "dark" : newMode;
          if (colorMode !== target) {
            setColorMode(target);
          }
        }
      } else if (e.key === ACCENT_STORAGE_KEY && e.newValue) {
        const newAccent = e.newValue as AccentColor;
        if (ACCENT_PALETTES[newAccent]) {
          setAccentColorState(newAccent);
          applyAccentColorToDom(newAccent);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [colorMode, setColorMode, setThemeModeState, setAccentColorState, accentColor]);

  return {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    colorMode,
  };
};
