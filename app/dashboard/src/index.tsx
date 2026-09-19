import { ChakraProvider, ColorMode } from "@chakra-ui/react";
import dayjs from "dayjs";
import Duration from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import Timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  getInitialThemeMode,
  THEME_STORAGE_KEY,
} from "hooks/useThemeMode";
import "locales/i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { queryClient } from "utils/react-query";
import { applyThemeModeToDom } from "utils/themeColor";
import { theme } from "../chakra.config";
import App from "./App";
import "index.scss";

dayjs.extend(Timezone);
dayjs.extend(LocalizedFormat);
dayjs.extend(utc);
dayjs.extend(RelativeTime);
dayjs.extend(Duration);

const initialTheme = getInitialThemeMode();
applyThemeModeToDom(initialTheme);

const customColorModeManager = {
  type: "localStorage" as const,
  get(init?: ColorMode): ColorMode | undefined {
    const saved =
      localStorage.getItem(THEME_STORAGE_KEY) ||
      localStorage.getItem("chakra-ui-color-mode");
    if (saved === "black" || saved === "dark") return "dark";
    if (saved === "light") return "light";
    return init || "light";
  },
  set(value: ColorMode | "system"): void {
    localStorage.setItem("chakra-ui-color-mode", value);
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme} colorModeManager={customColorModeManager}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
);
