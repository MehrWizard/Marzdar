import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { MoonIcon as MoonIconSolid } from "@heroicons/react/24/solid";
import { useThemeMode } from "hooks/useThemeMode";
import { FC } from "react";
import { useTranslation } from "react-i18next";

export const ThemeToggle: FC = () => {
  const { themeMode, setThemeMode } = useThemeMode();
  const { t } = useTranslation();

  const getButtonIcon = () => {
    if (themeMode === "light") {
      return <SunIcon width="16px" height="16px" />;
    }
    if (themeMode === "black") {
      return <MoonIconSolid width="16px" height="16px" />;
    }
    return <MoonIcon width="16px" height="16px" />;
  };

  return (
    <Menu placement="bottom-end" isLazy>
      <MenuButton
        as={IconButton}
        size="sm"
        variant="outline"
        aria-label={t("theme.title") || "Theme"}
        icon={getButtonIcon()}
      />
      <Portal>
        <MenuList minW="150px" zIndex={99999}>
          <MenuItem
            fontSize="sm"
            icon={<SunIcon width="16px" height="16px" />}
            onClick={() => setThemeMode("light")}
          >
            <HStack justify="space-between" w="full">
              <Text>{t("theme.light") || "Light"}</Text>
              {themeMode === "light" && (
                <CheckIcon
                  width="16px"
                  height="16px"
                  color="var(--chakra-colors-primary-500)"
                />
              )}
            </HStack>
          </MenuItem>
          <MenuItem
            fontSize="sm"
            icon={<MoonIcon width="16px" height="16px" />}
            onClick={() => setThemeMode("dark")}
          >
            <HStack justify="space-between" w="full">
              <Text>{t("theme.dark") || "Dark"}</Text>
              {themeMode === "dark" && (
                <CheckIcon
                  width="16px"
                  height="16px"
                  color="var(--chakra-colors-primary-500)"
                />
              )}
            </HStack>
          </MenuItem>
          <MenuItem
            fontSize="sm"
            icon={<MoonIconSolid width="16px" height="16px" />}
            onClick={() => setThemeMode("black")}
          >
            <HStack justify="space-between" w="full">
              <Text>{t("theme.black") || "Black (OLED)"}</Text>
              {themeMode === "black" && (
                <CheckIcon
                  width="16px"
                  height="16px"
                  color="var(--chakra-colors-primary-500)"
                />
              )}
            </HStack>
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
