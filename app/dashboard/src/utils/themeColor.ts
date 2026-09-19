import { ColorMode } from "@chakra-ui/react";

export type ThemeMode = "light" | "dark" | "black";

export const updateThemeColor = (themeMode: ThemeMode | ColorMode) => {
  const el = document.querySelector('meta[name="theme-color"]');
  const color =
    themeMode === "black"
      ? "#000000"
      : themeMode === "dark"
      ? "#1A202C"
      : "#3B81F6";
  el?.setAttribute("content", color);
};
