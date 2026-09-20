import {
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { MoonIcon as MoonIconSolid } from "@heroicons/react/24/solid";
import { useThemeMode } from "hooks/useThemeMode";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  ACCENT_COLOR_ORDER,
  ACCENT_PALETTES,
} from "utils/themeColor";

export const ThemeToggle: FC = () => {
  const { themeMode, setThemeMode, accentColor, setAccentColor } =
    useThemeMode();
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
        <MenuList minW="180px" zIndex={99999} py={2}>
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

          <MenuDivider my={2} />

          <Box px={3} pt={1} pb={1}>
            <Text
              fontSize="2xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              mb={2.5}
            >
              {t("theme.accent") || "Accent Color"}
            </Text>
            <SimpleGrid columns={4} spacingY={3} spacingX={2.5} justifyItems="center">
              {ACCENT_COLOR_ORDER.map((accentKey) => {
                const accent = ACCENT_PALETTES[accentKey];
                const isActive = accentColor === accentKey;
                const color500 = accent.shades[500];
                const localizedLabel =
                  t(`theme.accent.${accentKey}`) || accent.label;

                return (
                  <Box
                    key={accentKey}
                    as="button"
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-label={localizedLabel}
                    title={localizedLabel}
                    w="22px"
                    h="22px"
                    p={0}
                    m="2px"
                    borderRadius="full"
                    bg={color500}
                    cursor="pointer"
                    outline="none"
                    border="none"
                    transition="transform 0.15s ease, box-shadow 0.15s ease"
                    boxShadow={
                      isActive
                        ? `0 0 0 2px var(--theme-menu-bg, #ffffff), 0 0 0 4px ${color500}`
                        : "none"
                    }
                    _hover={{
                      transform: "scale(1.15)",
                      boxShadow: isActive
                        ? `0 0 0 2px var(--theme-menu-bg, #ffffff), 0 0 0 4px ${color500}`
                        : `0 0 0 2px var(--theme-menu-bg, #ffffff), 0 0 0 3px ${color500}77`,
                    }}
                    _focus={{
                      outline: "none",
                    }}
                    _focusVisible={{
                      outline: "none",
                    }}
                    onPointerDown={(e: React.PointerEvent) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e: React.MouseEvent) => {
                      e.stopPropagation();
                    }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setAccentColor(accentKey);
                    }}
                  />
                );
              })}
            </SimpleGrid>
          </Box>
        </MenuList>
      </Portal>
    </Menu>
  );
};
