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
  rgb: string;
  // Backgrounds
  bgLight: string;
  bgDark: string;
  bgBlack: string;
  // Cards
  cardBgLight: string;
  cardBgDark: string;
  cardBgBlack: string;
  cardBorderLight: string;
  cardBorderDark: string;
  cardBorderBlack: string;
  // Subtle & secondary surfaces (table headers, popovers, badges)
  subtleBgLight: string;
  subtleBgDark: string;
  subtleBgBlack: string;
  // General borders & dividers
  borderLight: string;
  borderDark: string;
  borderBlack: string;
  // Interactive hover states
  hoverBgLight: string;
  hoverBgDark: string;
  hoverBgBlack: string;
  // Primary color ramp
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
    rgb: "57, 111, 228",
    bgLight: "#f4f7fc",
    bgDark: "#101522",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#161e30",
    cardBgBlack: "#0c0f16",
    cardBorderLight: "#e2e8f4",
    cardBorderDark: "#24304c",
    cardBorderBlack: "#1d2538",
    subtleBgLight: "#edf3fa",
    subtleBgDark: "#131a2a",
    subtleBgBlack: "#080a10",
    borderLight: "#dbe3f1",
    borderDark: "#202b44",
    borderBlack: "#1a2234",
    hoverBgLight: "#e6effa",
    hoverBgDark: "#1c273e",
    hoverBgBlack: "#121622",
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
    rgb: "37, 99, 235",
    bgLight: "#f3f6fc",
    bgDark: "#0e1422",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#151d32",
    cardBgBlack: "#0a0e18",
    cardBorderLight: "#e1e7f5",
    cardBorderDark: "#223050",
    cardBorderBlack: "#1c2438",
    subtleBgLight: "#edf2fa",
    subtleBgDark: "#121a2c",
    subtleBgBlack: "#080b13",
    borderLight: "#dae2f3",
    borderDark: "#1e2a46",
    borderBlack: "#192134",
    hoverBgLight: "#e6effb",
    hoverBgDark: "#1b253e",
    hoverBgBlack: "#121828",
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
    rgb: "139, 92, 246",
    bgLight: "#f7f5fc",
    bgDark: "#141122",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#1e1932",
    cardBgBlack: "#0e0c18",
    cardBorderLight: "#e9e4f7",
    cardBorderDark: "#332a52",
    cardBorderBlack: "#241d3a",
    subtleBgLight: "#f2eefa",
    subtleBgDark: "#19152b",
    subtleBgBlack: "#0a0912",
    borderLight: "#e2dbf4",
    borderDark: "#2c2447",
    borderBlack: "#201a34",
    hoverBgLight: "#ede7fa",
    hoverBgDark: "#262040",
    hoverBgBlack: "#161324",
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
    rgb: "236, 72, 153",
    bgLight: "#fcf5f8",
    bgDark: "#1c1118",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#291823",
    cardBgBlack: "#140b10",
    cardBorderLight: "#f8e2ed",
    cardBorderDark: "#442438",
    cardBorderBlack: "#301827",
    subtleBgLight: "#faecf3",
    subtleBgDark: "#23141e",
    subtleBgBlack: "#0e070b",
    borderLight: "#f5d7e6",
    borderDark: "#3b1f31",
    borderBlack: "#2a1522",
    hoverBgLight: "#f8e4ee",
    hoverBgDark: "#341e2c",
    hoverBgBlack: "#1e1018",
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
    rgb: "239, 68, 68",
    bgLight: "#fcf5f5",
    bgDark: "#1d1112",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#2b181a",
    cardBgBlack: "#140a0b",
    cardBorderLight: "#f9e2e2",
    cardBorderDark: "#472427",
    cardBorderBlack: "#321619",
    subtleBgLight: "#faebeb",
    subtleBgDark: "#241416",
    subtleBgBlack: "#0e0708",
    borderLight: "#f6d7d7",
    borderDark: "#3e1f22",
    borderBlack: "#2c1316",
    hoverBgLight: "#f9e4e4",
    hoverBgDark: "#351e20",
    hoverBgBlack: "#1e0f11",
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
    rgb: "249, 115, 22",
    bgLight: "#fcf6f3",
    bgDark: "#1d1410",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#2b1c15",
    cardBgBlack: "#140d09",
    cardBorderLight: "#fae5db",
    cardBorderDark: "#462b1e",
    cardBorderBlack: "#321d13",
    subtleBgLight: "#faede6",
    subtleBgDark: "#241712",
    subtleBgBlack: "#0e0906",
    borderLight: "#f7dad0",
    borderDark: "#3d251a",
    borderBlack: "#2c1a11",
    hoverBgLight: "#fae7dd",
    hoverBgDark: "#362319",
    hoverBgBlack: "#1e130d",
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
    rgb: "234, 179, 8",
    bgLight: "#fcf8f2",
    bgDark: "#1c170f",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#292113",
    cardBgBlack: "#131008",
    cardBorderLight: "#f9ecd7",
    cardBorderDark: "#44351d",
    cardBorderBlack: "#302513",
    subtleBgLight: "#faf2e3",
    subtleBgDark: "#231c10",
    subtleBgBlack: "#0e0b05",
    borderLight: "#f6e4c7",
    borderDark: "#3a2d18",
    borderBlack: "#291f0e",
    hoverBgLight: "#f9eedc",
    hoverBgDark: "#332817",
    hoverBgBlack: "#1b1509",
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
    rgb: "16, 185, 129",
    bgLight: "#f3fbf6",
    bgDark: "#0e1a14",
    bgBlack: "#000000",
    cardBgLight: "#ffffff",
    cardBgDark: "#14261d",
    cardBgBlack: "#0a130e",
    cardBorderLight: "#dcf3e4",
    cardBorderDark: "#1f3d2f",
    cardBorderBlack: "#152b20",
    subtleBgLight: "#ebf8f0",
    subtleBgDark: "#112018",
    subtleBgBlack: "#070d0a",
    borderLight: "#d1eedc",
    borderDark: "#1a3327",
    borderBlack: "#12251c",
    hoverBgLight: "#e3f6ea",
    hoverBgDark: "#183125",
    hoverBgBlack: "#0e1c15",
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
      ? palette.bgDark
      : palette.bgLight;
  el?.setAttribute("content", color);
};

export const applyAccentColorToDom = (accent: AccentColor) => {
  if (typeof document === "undefined") return;

  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.cyan;
  const doc = document.documentElement;
  const body = document.body;

  // 1. Create or update the global override <style> element with !important rules
  // targeting all possible scopes where Emotion or Chakra might set variables
  let styleEl = document.getElementById("marzdar-accent-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "marzdar-accent-style";
    document.head.appendChild(styleEl);
  }

  const cssVarEntries = Object.entries(palette.shades)
    .map(([shade, color]) => `--chakra-colors-primary-${shade}: ${color} !important;`)
    .join("\n      ");

  styleEl.textContent = `
    :root,
    :host,
    html,
    body,
    #root,
    [data-theme],
    [data-theme="light"],
    [data-theme="dark"],
    .chakra-ui-light,
    .chakra-ui-dark,
    .chakra-portal {
      ${cssVarEntries}
      --chakra-colors-primary-500-rgb: ${palette.rgb} !important;
      --theme-accent-bg-light: ${palette.bgLight} !important;
      --theme-accent-bg-dark: ${palette.bgDark} !important;
    }

    /* Light Mode */
    html.chakra-ui-light,
    body.chakra-ui-light,
    html[data-theme="light"],
    body[data-theme="light"] {
      --chakra-colors-chakra-body-bg: ${palette.bgLight} !important;
      background-color: ${palette.bgLight} !important;
      --theme-card-bg: ${palette.cardBgLight} !important;
      --theme-card-border: ${palette.cardBorderLight} !important;
      --theme-card-hover-border: ${palette.shades[400]} !important;
      --theme-subtle-bg: ${palette.subtleBgLight} !important;
      --theme-table-th-bg: ${palette.subtleBgLight} !important;
      --theme-table-th-border: ${palette.borderLight} !important;
      --theme-table-tr-hover: ${palette.hoverBgLight} !important;
      --theme-menu-bg: #ffffff !important;

      --chakra-colors-light-border: ${palette.borderLight} !important;
      --chakra-colors-gray-50: ${palette.subtleBgLight} !important;
      --chakra-colors-gray-100: ${palette.subtleBgLight} !important;
      --chakra-colors-gray-200: ${palette.borderLight} !important;
      --chakra-colors-chakra-border-color: ${palette.borderLight} !important;
      --chakra-colors-chakra-subtle-bg: ${palette.subtleBgLight} !important;
    }

    /* Dark Mode */
    html.chakra-ui-dark:not(.theme-black):not([data-theme-mode="black"]),
    body.chakra-ui-dark:not(.theme-black):not([data-theme-mode="black"]),
    html[data-theme="dark"]:not(.theme-black):not([data-theme-mode="black"]),
    body[data-theme="dark"]:not(.theme-black):not([data-theme-mode="black"]) {
      --chakra-colors-chakra-body-bg: ${palette.bgDark} !important;
      background-color: ${palette.bgDark} !important;
      --theme-card-bg: ${palette.cardBgDark} !important;
      --theme-card-border: ${palette.cardBorderDark} !important;
      --theme-card-hover-border: ${palette.shades[400]} !important;
      --theme-subtle-bg: ${palette.subtleBgDark} !important;
      --theme-table-th-bg: ${palette.subtleBgDark} !important;
      --theme-table-th-border: ${palette.borderDark} !important;
      --theme-table-tr-hover: ${palette.hoverBgDark} !important;
      --theme-menu-bg: ${palette.cardBgDark} !important;

      --chakra-colors-gray-900: ${palette.bgDark} !important;
      --chakra-colors-gray-800: ${palette.subtleBgDark} !important;
      --chakra-colors-gray-750: ${palette.cardBgDark} !important;
      --chakra-colors-gray-700: ${palette.cardBgDark} !important;
      --chakra-colors-gray-600: ${palette.borderDark} !important;
      --chakra-colors-chakra-border-color: ${palette.borderDark} !important;
      --chakra-colors-chakra-subtle-bg: ${palette.subtleBgDark} !important;
    }

    /* Black (OLED) Mode */
    html.theme-black,
    body.theme-black,
    html[data-theme-mode="black"],
    body[data-theme-mode="black"] {
      --chakra-colors-chakra-body-bg: #000000 !important;
      background-color: #000000 !important;
      --theme-card-bg: ${palette.cardBgBlack} !important;
      --theme-card-border: ${palette.cardBorderBlack} !important;
      --theme-card-hover-border: ${palette.shades[400]} !important;
      --theme-subtle-bg: ${palette.subtleBgBlack} !important;
      --theme-table-th-bg: ${palette.subtleBgBlack} !important;
      --theme-table-th-border: ${palette.borderBlack} !important;
      --theme-table-tr-hover: ${palette.hoverBgBlack} !important;
      --theme-menu-bg: ${palette.cardBgBlack} !important;

      --chakra-colors-gray-900: #050505 !important;
      --chakra-colors-gray-800: #09090b !important;
      --chakra-colors-gray-750: ${palette.cardBgBlack} !important;
      --chakra-colors-gray-700: ${palette.subtleBgBlack} !important;
      --chakra-colors-gray-600: ${palette.borderBlack} !important;
      --chakra-colors-chakra-border-color: ${palette.borderBlack} !important;
      --chakra-colors-chakra-subtle-bg: ${palette.subtleBgBlack} !important;
    }

    /* Cards global override with smooth transitions */
    .chakra-card,
    [class*="chakra-card"] {
      background-color: var(--theme-card-bg) !important;
      border-color: var(--theme-card-border) !important;
      transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease !important;
    }

    /* Table headers & cells */
    table thead th,
    .chakra-table thead th {
      background-color: var(--theme-table-th-bg) !important;
      border-color: var(--theme-table-th-border) !important;
      transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease !important;
    }

    table td,
    .chakra-table td {
      border-color: var(--theme-table-th-border) !important;
      transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease !important;
    }

    table tr.interactive:hover > td,
    .chakra-table tr.interactive:hover > td {
      background-color: var(--theme-table-tr-hover) !important;
    }

    /* Protocol cards & host cards */
    .protocol-card,
    .host-config-card {
      border-color: var(--theme-card-border) !important;
      transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease !important;
    }
  `;

  // 2. Also set on inline styles with !important
  for (const [shade, color] of Object.entries(palette.shades)) {
    doc.style.setProperty(`--chakra-colors-primary-${shade}`, color, "important");
    if (body) {
      body.style.setProperty(`--chakra-colors-primary-${shade}`, color, "important");
    }
  }

  doc.style.setProperty("--chakra-colors-primary-500-rgb", palette.rgb, "important");
  doc.style.setProperty("--theme-accent-bg-light", palette.bgLight, "important");
  doc.style.setProperty("--theme-accent-bg-dark", palette.bgDark, "important");
  if (body) {
    body.style.setProperty("--chakra-colors-primary-500-rgb", palette.rgb, "important");
    body.style.setProperty("--theme-accent-bg-light", palette.bgLight, "important");
    body.style.setProperty("--theme-accent-bg-dark", palette.bgDark, "important");
  }

  const currentMode =
    doc.getAttribute("data-theme-mode") ||
    doc.getAttribute("data-theme") ||
    "light";

  if (currentMode === "black") {
    doc.style.setProperty("--chakra-colors-chakra-body-bg", "#000000", "important");
    doc.style.setProperty("background-color", "#000000", "important");
    doc.style.setProperty("--theme-card-bg", palette.cardBgBlack, "important");
    doc.style.setProperty("--theme-card-border", palette.cardBorderBlack, "important");
    doc.style.setProperty("--theme-subtle-bg", palette.subtleBgBlack, "important");
    doc.style.setProperty("--theme-table-th-bg", palette.subtleBgBlack, "important");
    doc.style.setProperty("--theme-table-th-border", palette.borderBlack, "important");
    doc.style.setProperty("--theme-table-tr-hover", palette.hoverBgBlack, "important");
    if (body) {
      body.style.setProperty("--chakra-colors-chakra-body-bg", "#000000", "important");
      body.style.setProperty("background-color", "#000000", "important");
      body.style.setProperty("--theme-card-bg", palette.cardBgBlack, "important");
      body.style.setProperty("--theme-card-border", palette.cardBorderBlack, "important");
      body.style.setProperty("--theme-subtle-bg", palette.subtleBgBlack, "important");
      body.style.setProperty("--theme-table-th-bg", palette.subtleBgBlack, "important");
      body.style.setProperty("--theme-table-th-border", palette.borderBlack, "important");
      body.style.setProperty("--theme-table-tr-hover", palette.hoverBgBlack, "important");
    }
  } else if (currentMode === "dark") {
    doc.style.setProperty("--chakra-colors-chakra-body-bg", palette.bgDark, "important");
    doc.style.setProperty("background-color", palette.bgDark, "important");
    doc.style.setProperty("--theme-card-bg", palette.cardBgDark, "important");
    doc.style.setProperty("--theme-card-border", palette.cardBorderDark, "important");
    doc.style.setProperty("--theme-subtle-bg", palette.subtleBgDark, "important");
    doc.style.setProperty("--theme-table-th-bg", palette.subtleBgDark, "important");
    doc.style.setProperty("--theme-table-th-border", palette.borderDark, "important");
    doc.style.setProperty("--theme-table-tr-hover", palette.hoverBgDark, "important");
    if (body) {
      body.style.setProperty("--chakra-colors-chakra-body-bg", palette.bgDark, "important");
      body.style.setProperty("background-color", palette.bgDark, "important");
      body.style.setProperty("--theme-card-bg", palette.cardBgDark, "important");
      body.style.setProperty("--theme-card-border", palette.cardBorderDark, "important");
      body.style.setProperty("--theme-subtle-bg", palette.subtleBgDark, "important");
      body.style.setProperty("--theme-table-th-bg", palette.subtleBgDark, "important");
      body.style.setProperty("--theme-table-th-border", palette.borderDark, "important");
      body.style.setProperty("--theme-table-tr-hover", palette.hoverBgDark, "important");
    }
  } else {
    doc.style.setProperty("--chakra-colors-chakra-body-bg", palette.bgLight, "important");
    doc.style.setProperty("background-color", palette.bgLight, "important");
    doc.style.setProperty("--theme-card-bg", palette.cardBgLight, "important");
    doc.style.setProperty("--theme-card-border", palette.cardBorderLight, "important");
    doc.style.setProperty("--theme-subtle-bg", palette.subtleBgLight, "important");
    doc.style.setProperty("--theme-table-th-bg", palette.subtleBgLight, "important");
    doc.style.setProperty("--theme-table-th-border", palette.borderLight, "important");
    doc.style.setProperty("--theme-table-tr-hover", palette.hoverBgLight, "important");
    if (body) {
      body.style.setProperty("--chakra-colors-chakra-body-bg", palette.bgLight, "important");
      body.style.setProperty("background-color", palette.bgLight, "important");
      body.style.setProperty("--theme-card-bg", palette.cardBgLight, "important");
      body.style.setProperty("--theme-card-border", palette.cardBorderLight, "important");
      body.style.setProperty("--theme-subtle-bg", palette.subtleBgLight, "important");
      body.style.setProperty("--theme-table-th-bg", palette.subtleBgLight, "important");
      body.style.setProperty("--theme-table-th-border", palette.borderLight, "important");
      body.style.setProperty("--theme-table-tr-hover", palette.hoverBgLight, "important");
    }
  }

  doc.setAttribute("data-accent", accent);
  if (body) {
    body.setAttribute("data-accent", accent);
  }

  updateThemeColor(currentMode as ThemeMode, accent);
};

export const applyThemeModeToDom = (
  mode: ThemeMode,
  accent?: AccentColor
) => {
  if (typeof document === "undefined") return;

  const doc = document.documentElement;
  const body = document.body;
  const currentAccent = accent || getInitialAccentColor();

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

  applyAccentColorToDom(currentAccent);
};
