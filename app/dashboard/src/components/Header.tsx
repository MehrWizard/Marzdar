import {
  Box,
  Button,
  chakra,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChartPieIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentMinusIcon,
  LinkIcon,
  SquaresPlusIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DONATION_URL, REPO_URL } from "constants/Project";
import { useDashboard } from "contexts/DashboardContext";
import differenceInDays from "date-fns/differenceInDays";
import isValid from "date-fns/isValid";
import { FC, ReactNode, useState } from "react";
import GitHubButton from "react-github-btn";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Language } from "./Language";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeMode } from "hooks/useThemeMode";
import useGetUser from "hooks/useGetUser";

type HeaderProps = {
  actions?: ReactNode;
};
const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

const CoreSettingsIcon = chakra(Cog6ToothIcon, iconProps);
const SettingsIcon = chakra(Bars3Icon, iconProps);
const LogoutIcon = chakra(ArrowLeftOnRectangleIcon, iconProps);
const DonationIcon = chakra(CurrencyDollarIcon, iconProps);
const HostsIcon = chakra(LinkIcon, iconProps);
const NodesIcon = chakra(SquaresPlusIcon, iconProps);
const NodesUsageIcon = chakra(ChartPieIcon, iconProps);
const ResetUsageIcon = chakra(DocumentMinusIcon, iconProps);
const GitHubIcon: FC<{ width?: string; height?: string }> = ({
  width = "16px",
  height = "16px",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);
const NotificationCircle = chakra(Box, {
  baseStyle: {
    bg: "yellow.500",
    w: "2",
    h: "2",
    rounded: "full",
    position: "absolute",
  },
});

const NOTIFICATION_KEY = "marzban-menu-notification";

export const shouldShowDonation = (): boolean => {
  const date = localStorage.getItem(NOTIFICATION_KEY);
  if (!date) return true;
  try {
    if (date && isValid(parseInt(date))) {
      if (differenceInDays(new Date(), new Date(parseInt(date))) >= 7)
        return true;
      return false;
    }
    return true;
  } catch (err) {
    return true;
  }
};

export const Header: FC<HeaderProps> = ({ actions }) => {
  const { userData, getUserIsSuccess, getUserIsPending } = useGetUser();

  const isSudo = () => {
    if (!getUserIsPending && getUserIsSuccess) {
      return userData.is_sudo;
    }
    return false;
  };

  const {
    activeTab,
    setActiveTab,
    onEditingHosts,
    onResetAllUsage,
    onEditingNodes,
    onShowingNodesUsage,
    onManagingAdmins,
  } = useDashboard();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const { themeMode } = useThemeMode();
  const [showDonationNotif, setShowDonationNotif] = useState(
    shouldShowDonation()
  );
  const gBtnColor =
    themeMode === "black"
      ? "dark"
      : colorMode === "dark"
      ? "dark_dimmed"
      : "light";

  const handleOnClose = () => {
    localStorage.setItem(NOTIFICATION_KEY, new Date().getTime().toString());
    setShowDonationNotif(false);
  };

  return (
    <HStack
      gap={2}
      justifyContent="space-between"
      __css={{
        "& .menuList": {
          direction: "ltr",
        },
      }}
      position="relative"
    >
      {isSudo() ? (
        <HStack
          bg="blackAlpha.100"
          _dark={{ bg: "whiteAlpha.100" }}
          p="1"
          borderRadius="xl"
          spacing={1}
          flexShrink={0}
        >
          <Tooltip label={t("users")} placement="bottom" hasArrow>
            <Button
              size="sm"
              variant={activeTab === "users" ? "solid" : "ghost"}
              colorScheme={activeTab === "users" ? "primary" : "gray"}
              borderRadius="lg"
              fontWeight="semibold"
              fontSize="sm"
              w={{ base: "32px", sm: "auto" }}
              h="32px"
              px={{ base: 0, sm: 3.5 }}
              aria-label={t("users")}
              title={t("users")}
              onClick={() => setActiveTab("users")}
            >
              <UsersIcon width="16px" height="16px" />
              <Box as="span" display={{ base: "none", sm: "inline" }} ml={1.5}>
                {t("users")}
              </Box>
            </Button>
          </Tooltip>
          <Tooltip label={t("admins.title", "Admins")} placement="bottom" hasArrow>
            <Button
              size="sm"
              variant={activeTab === "admins" ? "solid" : "ghost"}
              colorScheme={activeTab === "admins" ? "primary" : "gray"}
              borderRadius="lg"
              fontWeight="semibold"
              fontSize="sm"
              w={{ base: "32px", sm: "auto" }}
              h="32px"
              px={{ base: 0, sm: 3.5 }}
              aria-label={t("admins.title", "Admins")}
              title={t("admins.title", "Admins")}
              onClick={() => setActiveTab("admins")}
            >
              <UserGroupIcon width="16px" height="16px" />
              <Box as="span" display={{ base: "none", sm: "inline" }} ml={1.5}>
                {t("admins.title", "Admins")}
              </Box>
            </Button>
          </Tooltip>
        </HStack>
      ) : (
        <Text as="h1" fontWeight="semibold" fontSize="2xl" flexShrink={0}>
          {t("users")}
        </Text>
      )}
      {showDonationNotif && (
        <NotificationCircle top="0" right="0" zIndex={9999} />
      )}
      <Box
        overflowX="auto"
        flexShrink={1}
        minW={0}
        css={{
          direction: "rtl",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <HStack alignItems="center" spacing={{ base: 1.5, sm: 2 }}>
          <Menu>
            <MenuButton
              as={IconButton}
              size="sm"
              variant="outline"
              icon={
                <>
                  <SettingsIcon />
                </>
              }
              position="relative"
            ></MenuButton>
            <MenuList minW="170px" zIndex={99999} className="menuList">
              {isSudo() && (
                <>
                  <MenuItem
                    maxW="170px"
                    fontSize="sm"
                    icon={<HostsIcon />}
                    onClick={onEditingHosts.bind(null, true)}
                  >
                    {t("header.hostSettings")}
                  </MenuItem>
                  <MenuItem
                    maxW="170px"
                    fontSize="sm"
                    icon={<NodesIcon />}
                    onClick={onEditingNodes.bind(null, true)}
                  >
                    {t("header.nodeSettings")}
                  </MenuItem>
                  <MenuItem
                    maxW="170px"
                    fontSize="sm"
                    icon={<NodesUsageIcon />}
                    onClick={onShowingNodesUsage.bind(null, true)}
                  >
                    {t("header.nodesUsage")}
                  </MenuItem>
                  <MenuItem
                    maxW="170px"
                    fontSize="sm"
                    icon={<ResetUsageIcon />}
                    onClick={onResetAllUsage.bind(null, true)}
                  >
                    {t("resetAllUsage")}
                  </MenuItem>
                </>
              )}
              <chakra.a href={DONATION_URL} target="_blank" rel="noopener noreferrer">
                <MenuItem
                  maxW="170px"
                  fontSize="sm"
                  icon={<DonationIcon />}
                  position="relative"
                  onClick={handleOnClose}
                >
                  {t("header.donation")}{" "}
                  {showDonationNotif && (
                    <NotificationCircle top="3" right="2" />
                  )}
                </MenuItem>
              </chakra.a>
              <Link to="/login">
                <MenuItem maxW="170px" fontSize="sm" icon={<LogoutIcon />}>
                  {t("header.logout")}
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          {isSudo() && (
            <IconButton
              size="sm"
              variant="outline"
              aria-label="core settings"
              onClick={() => {
                useDashboard.setState({ isEditingCore: true });
              }}
            >
              <CoreSettingsIcon />
            </IconButton>
          )}

          <Language />

          <ThemeToggle />

          <IconButton
            as="a"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="outline"
            aria-label="Star Marzdar on GitHub"
            title="Star Marzdar on GitHub"
            icon={<GitHubIcon width="16px" height="16px" />}
            display={{ base: "inline-flex", md: "none" }}
          />

          <Box
            css={{ direction: "ltr" }}
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            pr="2"
            __css={{
              "&  span": {
                display: "inline-flex",
              },
            }}
          >
            <GitHubButton
              href={REPO_URL}
              data-color-scheme={`no-preference: ${gBtnColor}; light: ${gBtnColor}; dark: ${gBtnColor};`}
              data-size="large"
              data-show-count="true"
              aria-label="Star Marzdar on GitHub"
            >
              Star
            </GitHubButton>
          </Box>
        </HStack>
      </Box>
    </HStack>
  );
};
