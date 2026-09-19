import { useColorMode } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { applyThemeModeToDom, ThemeMode } from "utils/themeColor";
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
  setThemeModeState: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: getInitialThemeMode(),
  setThemeModeState: (mode: ThemeMode) => set({ themeMode: mode }),
}));

export const useThemeMode = () => {
  const { colorMode, setColorMode } = useColorMode();
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeModeState = useThemeStore((s) => s.setThemeModeState);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      localStorage.setItem(
        "chakra-ui-color-mode",
        mode === "black" ? "dark" : mode
      );

      applyThemeModeToDom(mode);

      const targetColorMode = mode === "black" ? "dark" : mode;
      if (colorMode !== targetColorMode) {
        setColorMode(targetColorMode);
      }

      // Re-apply on next animation frame to guarantee attributes remain intact after Chakra colorMode updates
      requestAnimationFrame(() => {
        applyThemeModeToDom(mode);
      });
    },
    [colorMode, setColorMode, setThemeModeState]
  );

  useEffect(() => {
    // Initial sync
    const current = getInitialThemeMode();
    applyThemeModeToDom(current);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (newMode === "light" || newMode === "dark" || newMode === "black") {
          setThemeModeState(newMode);
          applyThemeModeToDom(newMode);
          const target = newMode === "black" ? "dark" : newMode;
          if (colorMode !== target) {
            setColorMode(target);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [colorMode, setColorMode, setThemeModeState]);

  return {
    themeMode,
    setThemeMode,
    colorMode,
  };
};
