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

export const applyThemeModeToDom = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;

  const doc = document.documentElement;
  const body = document.body;

  if (mode === "black") {
    doc.classList.add("chakra-ui-dark", "theme-black");
    doc.classList.remove("chakra-ui-light");
    doc.setAttribute("data-theme", "dark");
    doc.setAttribute("data-theme-mode", "black");
    doc.style.colorScheme = "dark";

    if (body) {
      body.classList.add("chakra-ui-dark", "theme-black");
      body.classList.remove("chakra-ui-light");
      body.setAttribute("data-theme", "dark");
      body.setAttribute("data-theme-mode", "black");
    }
  } else if (mode === "dark") {
    doc.classList.add("chakra-ui-dark");
    doc.classList.remove("chakra-ui-light", "theme-black");
    doc.setAttribute("data-theme", "dark");
    doc.removeAttribute("data-theme-mode");
    doc.style.colorScheme = "dark";

    if (body) {
      body.classList.add("chakra-ui-dark");
      body.classList.remove("chakra-ui-light", "theme-black");
      body.setAttribute("data-theme", "dark");
      body.removeAttribute("data-theme-mode");
    }
  } else {
    doc.classList.add("chakra-ui-light");
    doc.classList.remove("chakra-ui-dark", "theme-black");
    doc.setAttribute("data-theme", "light");
    doc.removeAttribute("data-theme-mode");
    doc.style.colorScheme = "light";

    if (body) {
      body.classList.add("chakra-ui-light");
      body.classList.remove("chakra-ui-dark", "theme-black");
      body.setAttribute("data-theme", "light");
      body.removeAttribute("data-theme-mode");
    }
  }

  updateThemeColor(mode);
};
