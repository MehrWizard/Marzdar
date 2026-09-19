import { useColorMode } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { ThemeMode, updateThemeColor } from "utils/themeColor";

export const THEME_STORAGE_KEY = "marzdar-theme-mode";

export const getInitialThemeMode = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "black") {
    return saved;
  }
  const chakraMode = localStorage.getItem("chakra-ui-color-mode");
  if (chakraMode === "dark") return "dark";
  return "light";
};

export const useThemeMode = () => {
  const { colorMode, setColorMode } = useColorMode();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);

      if (mode === "black") {
        document.documentElement.setAttribute("data-theme", "black");
        setColorMode("dark");
        updateThemeColor("black");
      } else if (mode === "dark") {
        document.documentElement.removeAttribute("data-theme");
        setColorMode("dark");
        updateThemeColor("dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        setColorMode("light");
        updateThemeColor("light");
      }
    },
    [setColorMode]
  );

  useEffect(() => {
    const current = getInitialThemeMode();
    if (current === "black") {
      document.documentElement.setAttribute("data-theme", "black");
      if (colorMode !== "dark") setColorMode("dark");
      updateThemeColor("black");
    } else if (current === "dark") {
      document.documentElement.removeAttribute("data-theme");
      if (colorMode !== "dark") setColorMode("dark");
      updateThemeColor("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (colorMode !== "light") setColorMode("light");
      updateThemeColor("light");
    }
  }, []);

  return {
    themeMode,
    setThemeMode,
    colorMode,
  };
};
