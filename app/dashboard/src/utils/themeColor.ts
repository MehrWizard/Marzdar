import { ColorMode } from "@chakra-ui/react";

export type ThemeMode = "light" | "dark" | "black";

export type AccentColor =
  | "cyan"
  | "blue"
  | "violet"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green";

export interface AccentPalette {
  id: AccentColor;
  label: string;
  shades: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
  cyan: {
    id: "cyan",
    label: "Cyan",
    shades: {
      50: "#9cb7f2",
      100: "#88a9ef",
      200: "#749aec",
      300: "#618ce9",
      400: "#4d7de7",
      500: "#396fe4",
      600: "#3364cd",
      700: "#2e59b6",
      800: "#284ea0",
      900: "#224389",
    },
  },
  blue: {
    id: "blue",
    label: "Blue",
    shades: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#2563eb",
      600: "#1d4ed8",
      700: "#1e40af",
      800: "#1e3a8a",
      900: "#172554",
    },
  },
  violet: {
    id: "violet",
    label: "Violet",
    shades: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
  },
  pink: {
    id: "pink",
    label: "Pink",
    shades: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
    },
  },
  red: {
    id: "red",
    label: "Red",
    shades: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },
  orange: {
    id: "orange",
    label: "Orange",
    shades: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    shades: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
    },
  },
  green: {
    id: "green",
    label: "Green",
    shades: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
  },
};

export const ACCENT_COLOR_ORDER: AccentColor[] = [
  "cyan",
  "blue",
  "violet",
  "pink",
  "red",
  "orange",
  "yellow",
  "green",
];

export const ACCENT_STORAGE_KEY = "marzdar-accent-color";

export const getInitialAccentColor = (): AccentColor => {
  if (typeof window === "undefined") return "cyan";
  const saved = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor;
  if (saved && ACCENT_PALETTES[saved]) {
    return saved;
  }
  return "cyan";
};

export const updateThemeColor = (
  themeMode: ThemeMode | ColorMode,
  accent?: AccentColor
) => {
  const el = document.querySelector('meta[name="theme-color"]');
  const currentAccent = accent || getInitialAccentColor();
  const palette = ACCENT_PALETTES[currentAccent] || ACCENT_PALETTES.cyan;
  const color =
    themeMode === "black"
      ? "#000000"
      : themeMode === "dark"
      ? "#1A202C"
      : palette.shades[500];
  el?.setAttribute("content", color);
};

export const applyAccentColorToDom = (accent: AccentColor) => {
  if (typeof document === "undefined") return;

  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.cyan;
  const doc = document.documentElement;

  for (const [shade, color] of Object.entries(palette.shades)) {
    doc.style.setProperty(`--chakra-colors-primary-${shade}`, color);
  }

  doc.setAttribute("data-accent", accent);

  const currentMode =
    doc.getAttribute("data-theme-mode") ||
    doc.getAttribute("data-theme") ||
    "light";
  updateThemeColor(currentMode as ThemeMode, accent);
};

export const applyThemeModeToDom = (
  mode: ThemeMode,
  accent?: AccentColor
) => {
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

  updateThemeColor(mode, accent);
};
