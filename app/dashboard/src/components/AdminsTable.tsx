import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  ButtonGroup,
  chakra,
  HStack,
  IconButton,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ReactComponent as AddFileIcon } from "assets/add_file.svg";
import {
  AdminRoleFilter,
  FetchAdminsQueryKey,
  useAdmins,
  useAdminsQuery,
} from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";

const SortIcon = chakra(ChevronDownIcon, {
  baseStyle: {
    width: "15px",
    height: "15px",
  },
});

export const Sort: FC<{ sort: string; column: string }> = ({ sort, column }) => {
  if (sort.includes(column))
    return (
      <SortIcon
        transform={sort.startsWith("-") ? undefined : "rotate(180deg)"}
      />
    );
  return null;
};
import useGetUser from "hooks/useGetUser";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Admin } from "types/Admin";
import { formatBytes, numberWithCommas } from "utils/formatByte";
import { generateErrorMessage, generateSuccessMessage } from "utils/toastHandler";

const EmptySectionIcon = chakra(AddFileIcon);

const PrevIcon = chakra(ArrowLongLeftIcon, {
  baseStyle: {
    w: 4,
    h: 4,
  },
});

const NextIcon = chakra(ArrowLongRightIcon, {
  baseStyle: {
    w: 4,
    h: 4,
  },
});

function generatePageItems(total: number, current: number, width: number = 7) {
  if (total <= width) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const left = Math.max(0, Math.min(total - width, current - Math.floor(width / 2)));
  const items: (string | number)[] = Array.from({ length: width }, (_, i) => i + left);

  if (items[0] > 0) {
    items[0] = 0;
    items[1] = "prev-more";
  }
  if (items[items.length - 1] < total - 1) {
    items[items.length - 1] = total - 1;
    items[items.length - 2] = "next-more";
  }
  return items;
}

export const AdminsTable: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { userData } = useGetUser();
  const { onFilterChange, setActiveTab } = useDashboard();
  const {
    filters,
    setFilters,
    setEditingAdmin,
    setDeletingAdmin,
    setIsCreatingAdmin,
    resetAdminUsage,
    disableAdminUsers,
    activateAdminUsers,
  } = useAdmins();

  const { data: admins = [], isLoading } = useAdminsQuery();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredAndSortedAdmins = useMemo(() => {
    let result = [...admins];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.username.toLowerCase().includes(q) ||
          (a.telegram_id && String(a.telegram_id).includes(q)) ||
          (a.discord_webhook && a.discord_webhook.toLowerCase().includes(q))
      );
    }

    // Role filter
    if (filters.role === "sudo") {
      result = result.filter((a) => a.is_sudo);
    } else if (filters.role === "regular") {
      result = result.filter((a) => !a.is_sudo);
    }

    // User presence filter
    if (filters.userFilter === "with_users") {
      result = result.filter((a) => (a.users_count ?? 0) > 0);
    } else if (filters.userFilter === "no_users") {
      result = result.filter((a) => (a.users_count ?? 0) === 0);
    }

    // Sorting (supports column and -column for asc/desc)
    result.sort((a, b) => {
      const isDesc = filters.sort.startsWith("-");
      const col = filters.sort.replace("-", "");
      let cmp = 0;
      if (col === "username") {
        cmp = a.username.localeCompare(b.username);
      } else if (col === "users_count") {
        cmp = (a.users_count ?? 0) - (b.users_count ?? 0);
      } else if (col === "users_usage") {
        cmp = (a.users_usage ?? 0) - (b.users_usage ?? 0);
      } else {
        cmp = (a.users_count ?? 0) - (b.users_count ?? 0);
      }
      return isDesc ? -cmp : cmp;
    });

    return result;
  }, [admins, filters.search, filters.role, filters.userFilter, filters.sort]);

  const total = filteredAndSortedAdmins.length;
  const pageSize = filters.pageSize;
  const page = Math.min(
    Math.max(1, filters.page),
    Math.max(1, Math.ceil(total / pageSize))
  );

  const paginatedAdmins = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedAdmins.slice(start, start + pageSize);
  }, [filteredAndSortedAdmins, page, pageSize]);

  const noPages = Math.ceil(total / pageSize);
  const pageItems = generatePageItems(noPages, page - 1, 7);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ pageSize: parseInt(e.target.value), page: 1 });
  };

  const handleSort = (column: string) => {
    let newSort = filters.sort;
    if (newSort.includes(column)) {
      if (newSort.startsWith("-")) {
        newSort = column;
      } else {
        newSort = "-" + column;
      }
    } else {
      newSort = column === "username" ? column : "-" + column;
    }
    setFilters({ sort: newSort, page: 1 });
  };

  // Actions
  const handleViewUsers = (username: string) => {
    onFilterChange({ admin: username, offset: 0 });
    setActiveTab("users");
  };

  const handleResetUsage = async (username: string) => {
    if (
      !window.confirm(
        t("admins.resetUsageConfirm", { username })
      )
    )
      return;
    setActionLoading(`reset-${username}`);
    try {
      await resetAdminUsage(username);
      generateSuccessMessage(
        t("admins.resetUsageSuccess", { username }),
        toast
      );
      queryClient.invalidateQueries(FetchAdminsQueryKey);
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisableUsers = async (username: string) => {
    if (
      !window.confirm(
        t("admins.disableUsersConfirm", { username })
      )
    )
      return;
    setActionLoading(`disable-${username}`);
    try {
      await disableAdminUsers(username);
      generateSuccessMessage(
        t("admins.disableUsersSuccess", { username }),
        toast
      );
      useDashboard.getState().refetchUsers();
      queryClient.invalidateQueries(FetchAdminsQueryKey);
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUsers = async (username: string) => {
    if (
      !window.confirm(
        t("admins.activateUsersConfirm", { username })
      )
    )
      return;
    setActionLoading(`activate-${username}`);
    try {
      await activateAdminUsers(username);
      generateSuccessMessage(
        t("admins.activateUsersSuccess", { username }),
        toast
      );
      useDashboard.getState().refetchUsers();
      queryClient.invalidateQueries(FetchAdminsQueryKey);
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner size="lg" color="primary.500" />
      </HStack>
    );
  }

  if (filteredAndSortedAdmins.length === 0) {
    const isFiltered = filters.search !== "" || filters.role !== "all";

    return (
      <Box
        padding="5"
        py="12"
        display="flex"
        alignItems="center"
        flexDirection="column"
        gap={4}
        w="full"
      >
        <EmptySectionIcon
          maxHeight="160px"
          maxWidth="160px"
          _dark={{
            'path[fill="#fff"]': { fill: "gray.800" },
            'path[fill="#f2f2f2"], path[fill="#e6e6e6"], path[fill="#ccc"]': {
              fill: "gray.700",
            },
            'circle[fill="#3182CE"]': { fill: "primary.300" },
          }}
          _light={{
            'path[fill="#f2f2f2"], path[fill="#e6e6e6"], path[fill="#ccc"]': {
              fill: "gray.300",
            },
            'circle[fill="#3182CE"]': { fill: "primary.500" },
          }}
        />
        <Text fontWeight="medium" color="gray.600" _dark={{ color: "gray.400" }}>
          {isFiltered
            ? t("admins.noAdminsMatched", "No administrators matched your filters")
            : t("admins.noAdmins", "No administrators found")}
        </Text>
        {isFiltered ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setFilters({ search: "", role: "all", page: 1 })
            }
          >
            {t("clear")}
          </Button>
        ) : (
          <Button
            size="sm"
            colorScheme="primary"
            onClick={() => setIsCreatingAdmin(true)}
          >
            {t("admins.addAdmin", "Add Admin")}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box w="full" mt={2}>
      {/* Mobile Top Bar with Sort & Role Filter */}
      <Box
        display={{ base: "block", md: "none" }}
        p={2.5}
        mb={3}
        borderRadius="md"
        borderWidth="1px"
        borderColor="light-border"
        _dark={{ borderColor: "gray.700", bg: "var(--theme-card-bg)" }}
      >
        <HStack justify="space-between" align="center" fontSize="xs" fontWeight="bold">
          <HStack spacing={1}>
            <HStack
              cursor="pointer"
              userSelect="none"
              onClick={() => handleSort("username")}
              spacing={1}
            >
              <Text as="span">{t("username")}</Text>
              <Sort sort={filters.sort} column="username" />
            </HStack>

            <Text as="span" color="gray.400" mx={1} userSelect="none">
              /
            </Text>

            <Box position="relative" display="inline-flex" alignItems="center">
              <Text
                as="span"
                userSelect="none"
                pointerEvents="none"
                color={filters.role !== "all" ? "primary.500" : undefined}
                fontWeight={filters.role !== "all" ? "bold" : undefined}
              >
                {t("admins.type", "type")}
                {filters.role !== "all"
                  ? ": " +
                    (filters.role === "sudo"
                      ? t("admins.sudo", "sudo")
                      : t("admins.regular", "regular"))
                  : ""}
              </Text>
              <Select
                fontSize="xs"
                cursor="pointer"
                position="absolute"
                inset={0}
                opacity={0}
                p={0}
                border={0}
                h="full"
                w="full"
                value={filters.role}
                onChange={(e) =>
                  setFilters({
                    role: e.target.value as AdminRoleFilter,
                    page: 1,
                  })
                }
              >
                <option value="all">{t("admins.allRoles", "All Roles")}</option>
                <option value="sudo">{t("admins.sudoOnly", "Sudo Only")}</option>
                <option value="regular">{t("admins.regularOnly", "Regular Only")}</option>
              </Select>
            </Box>
          </HStack>

          <HStack spacing={1}>
            <HStack
              cursor="pointer"
              userSelect="none"
              onClick={() => handleSort("users_count")}
              spacing={1}
            >
              <Text as="span">{t("admins.usersCount", "Users")}</Text>
              <Sort sort={filters.sort} column="users_count" />
            </HStack>
            <Text as="span" color="gray.400" mx={0.5}>
              •
            </Text>
            <HStack
              cursor="pointer"
              userSelect="none"
              onClick={() => handleSort("users_usage")}
              spacing={1}
            >
              <Text as="span">{t("admins.usersUsage", "Traffic")}</Text>
              <Sort sort={filters.sort} column="users_usage" />
            </HStack>
          </HStack>
        </HStack>
      </Box>

      {/* Mobile Accordion View */}
      <Accordion
        allowMultiple
        display={{ base: "block", md: "none" }}
        w="full"
      >
        <VStack spacing={2} align="stretch">
          {paginatedAdmins.map((admin) => {
            const isCurrent = userData?.username === admin.username;
            return (
              <AccordionItem
                key={admin.username}
                borderWidth="1px"
                borderColor="light-border"
                _dark={{ borderColor: "gray.700", bg: "var(--theme-card-bg)" }}
                borderRadius="lg"
                overflow="hidden"
              >
                <AccordionButton px={3} py={3}>
                  <HStack justify="space-between" w="full" pr={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {admin.username}
                      </Text>
                      {isCurrent && (
                        <Badge colorScheme="green" fontSize="2xs" px={1.5}>
                          {t("admins.you")}
                        </Badge>
                      )}
                      <Badge
                        colorScheme={admin.is_sudo ? "purple" : "blue"}
                        fontSize="2xs"
                        rounded="full"
                        px={2}
                      >
                        {admin.is_sudo ? t("admins.sudo") : t("admins.regular")}
                      </Badge>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge variant="outline" fontSize="2xs">
                        {formatBytes(admin.users_usage || 0)}
                      </Badge>
                      <AccordionIcon />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel px={3} pb={3} pt={1}>
                  <VStack spacing={3} align="stretch" fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.500">{t("users")}:</Text>
                      <Button
                        size="xs"
                        variant="link"
                        colorScheme="primary"
                        onClick={() => handleViewUsers(admin.username)}
                      >
                        {admin.users_count ?? 0} {t("total")} (
                        {admin.active_users_count ?? 0} {t("status.active")})
                      </Button>
                    </HStack>

                    {(admin.telegram_id || admin.discord_webhook) && (
                      <HStack justify="space-between">
                        <Text color="gray.500">{t("admins.integrations", "Integrations")}:</Text>
                        <HStack spacing={1}>
                          {admin.telegram_id && (
                            <Badge colorScheme="telegram" fontSize="2xs">
                              TG: {admin.telegram_id}
                            </Badge>
                          )}
                          {admin.discord_webhook && (
                            <Badge colorScheme="purple" fontSize="2xs">
                              Discord
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    )}

                    <HStack justify="flex-end" spacing={1} pt={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="primary"
                        leftIcon={<PencilSquareIcon width="14px" />}
                        onClick={() => setEditingAdmin(admin)}
                      >
                        {t("edit", "Edit")}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="blue"
                        leftIcon={<UsersIcon width="14px" />}
                        onClick={() => handleViewUsers(admin.username)}
                      >
                        {t("users")}
                      </Button>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="orange"
                        aria-label="reset usage"
                        isLoading={actionLoading === `reset-${admin.username}`}
                        icon={<ArrowPathIcon width="14px" />}
                        onClick={() => handleResetUsage(admin.username)}
                      />
                      {!admin.is_sudo && (
                        <IconButton
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="delete"
                          icon={<TrashIcon width="14px" />}
                          onClick={() => setDeletingAdmin(admin)}
                        />
                      )}
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </VStack>
      </Accordion>

      {/* Desktop / Tablet Table View */}
      <Box
        display={{ base: "none", md: "block" }}
        borderWidth="1px"
        borderColor="var(--theme-card-border)"
        bg="var(--theme-card-bg)"
        _dark={{ borderColor: "var(--theme-card-border)", bg: "var(--theme-card-bg)" }}
        borderRadius="12px"
        overflow="hidden"
      >
        <Table variant="simple" size="sm">
          <Thead bg="blackAlpha.50" _dark={{ bg: "whiteAlpha.50" }}>
            <Tr>
              <Th
                py={3}
                color="gray.600"
                _dark={{ color: "gray.300" }}
                minW="220px"
              >
                <HStack position="relative" spacing={1} align="center">
                  <HStack
                    cursor="pointer"
                    userSelect="none"
                    onClick={() => handleSort("username")}
                    spacing={1}
                    _hover={{ color: "primary.500" }}
                    transition="color 0.15s ease"
                  >
                    <span>{t("username")}</span>
                    <Sort sort={filters.sort} column="username" />
                  </HStack>

                  <Text userSelect="none" color="gray.400" mx={1}>
                    /
                  </Text>

                  <Box position="relative" display="inline-flex" alignItems="center">
                    <Text
                      userSelect="none"
                      pointerEvents="none"
                      zIndex={1}
                      cursor="pointer"
                      color={filters.role !== "all" ? "primary.500" : undefined}
                      fontWeight={filters.role !== "all" ? "bold" : undefined}
                      _hover={{ color: "primary.500" }}
                    >
                      {t("admins.type", "type")}
                      {filters.role !== "all"
                        ? ": " +
                          (filters.role === "sudo"
                            ? t("admins.sudo", "sudo")
                            : t("admins.regular", "regular"))
                        : ""}
                    </Text>
                    <Select
                      fontSize="xs"
                      fontWeight="extrabold"
                      textTransform="uppercase"
                      cursor="pointer"
                      position="absolute"
                      p={0}
                      border={0}
                      h="full"
                      w="full"
                      inset={0}
                      opacity={0}
                      icon={<></>}
                      _focusVisible={{
                        border: "0 !important",
                      }}
                      value={filters.role}
                      onChange={(e) => {
                        setFilters({
                          role: e.target.value as AdminRoleFilter,
                          page: 1,
                        });
                      }}
                    >
                      <option value="all">{t("admins.allRoles", "All Roles")}</option>
                      <option value="sudo">{t("admins.sudoOnly", "Sudo Only")}</option>
                      <option value="regular">{t("admins.regularOnly", "Regular Only")}</option>
                    </Select>
                  </Box>
                </HStack>
              </Th>
              <Th
                py={3}
                cursor="pointer"
                userSelect="none"
                onClick={() => handleSort("users_count")}
                color="gray.600"
                _dark={{ color: "gray.300" }}
              >
                <HStack spacing={1}>
                  <span>{t("admins.usersCount", "Users")}</span>
                  <Sort sort={filters.sort} column="users_count" />
                </HStack>
              </Th>
              <Th
                py={3}
                cursor="pointer"
                userSelect="none"
                onClick={() => handleSort("users_usage")}
                color="gray.600"
                _dark={{ color: "gray.300" }}
              >
                <HStack spacing={1}>
                  <span>{t("admins.usersUsage", "Traffic Usage")}</span>
                  <Sort sort={filters.sort} column="users_usage" />
                </HStack>
              </Th>
              <Th py={3} color="gray.600" _dark={{ color: "gray.300" }}>
                {t("admins.integrations", "Integrations")}
              </Th>
              <Th py={3} textAlign="right" color="gray.600" _dark={{ color: "gray.300" }}>
                {t("actions", "Actions")}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedAdmins.map((admin) => {
              const isCurrent = userData?.username === admin.username;
              return (
                <Tr
                  key={admin.username}
                  _hover={{
                    bg: "blackAlpha.50",
                    _dark: { bg: "whiteAlpha.50" },
                  }}
                  transition="background-color 0.15s ease"
                >
                  {/* Admin / Username */}
                  <Td py={3}>
                    <HStack spacing={2} align="center">
                      <Box
                        p={1.5}
                        borderRadius="md"
                        bg={admin.is_sudo ? "purple.500" : "blue.500"}
                        color="white"
                      >
                        <UserGroupIcon width="16px" height="16px" />
                      </Box>
                      <VStack align="flex-start" spacing={0.5}>
                        <HStack spacing={1.5}>
                          <Text fontWeight="semibold" fontSize="sm">
                            {admin.username}
                          </Text>
                          {isCurrent && (
                            <Badge colorScheme="green" fontSize="2xs" px={1.5} py={0.2}>
                              {t("admins.you")}
                            </Badge>
                          )}
                          <Badge
                            colorScheme={admin.is_sudo ? "purple" : "blue"}
                            rounded="full"
                            fontSize="2xs"
                            px={2}
                          >
                            {admin.is_sudo ? t("admins.sudo") : t("admins.regular")}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Td>

                  {/* Users Count */}
                  <Td py={3}>
                    <Tooltip
                      label={t("admins.clickToFilterUsers", "Click to view this admin's users in Users tab")}
                      placement="top"
                    >
                      <HStack
                        as="button"
                        onClick={() => handleViewUsers(admin.username)}
                        spacing={1.5}
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                      >
                        <Badge
                          colorScheme={(admin.users_count ?? 0) > 0 ? "blue" : "gray"}
                          variant="subtle"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          rounded="md"
                        >
                          {numberWithCommas(admin.users_count ?? 0)} {t("total")}
                        </Badge>
                        {(admin.active_users_count ?? 0) > 0 && (
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            rounded="md"
                          >
                            {numberWithCommas(admin.active_users_count ?? 0)} {t("status.active")}
                          </Badge>
                        )}
                      </HStack>
                    </Tooltip>
                  </Td>

                  {/* Traffic Usage */}
                  <Td py={3}>
                    <Badge
                      colorScheme="gray"
                      variant="outline"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      rounded="md"
                    >
                      {formatBytes(admin.users_usage || 0)}
                    </Badge>
                  </Td>

                  {/* Integrations */}
                  <Td py={3}>
                    <HStack spacing={1.5}>
                      {admin.telegram_id ? (
                        <Tooltip label={`Telegram ID: ${admin.telegram_id}`} placement="top">
                          <Badge colorScheme="telegram" fontSize="2xs" px={1.5}>
                            TG
                          </Badge>
                        </Tooltip>
                      ) : null}
                      {admin.discord_webhook ? (
                        <Tooltip label="Discord Webhook Configured" placement="top">
                          <Badge colorScheme="purple" fontSize="2xs" px={1.5}>
                            Discord
                          </Badge>
                        </Tooltip>
                      ) : null}
                      {!admin.telegram_id && !admin.discord_webhook && (
                        <Text color="gray.400" fontSize="xs">
                          —
                        </Text>
                      )}
                    </HStack>
                  </Td>

                  {/* Actions */}
                  <Td py={3} textAlign="right">
                    <HStack spacing={1} justify="flex-end">
                      {/* View Users */}
                      <Tooltip label={t("admins.viewUsers", "View Admin's Users")} placement="top">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          aria-label="view users"
                          icon={<UsersIcon width="16px" />}
                          onClick={() => handleViewUsers(admin.username)}
                        />
                      </Tooltip>

                      {/* Edit Admin */}
                      <Tooltip label={t("edit", "Edit")} placement="top">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="primary"
                          aria-label="edit admin"
                          icon={<PencilSquareIcon width="16px" />}
                          onClick={() => setEditingAdmin(admin)}
                        />
                      </Tooltip>

                      {/* Reset Usage */}
                      <Tooltip label={t("admins.resetUsage")} placement="top">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          aria-label="reset usage"
                          isLoading={actionLoading === `reset-${admin.username}`}
                          icon={<ArrowPathIcon width="16px" />}
                          onClick={() => handleResetUsage(admin.username)}
                        />
                      </Tooltip>

                      {/* Disable All Users */}
                      <Tooltip label={t("admins.disableUsers")} placement="top">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="disable all users"
                          isLoading={actionLoading === `disable-${admin.username}`}
                          icon={<NoSymbolIcon width="16px" />}
                          onClick={() => handleDisableUsers(admin.username)}
                        />
                      </Tooltip>

                      {/* Activate All Users */}
                      <Tooltip label={t("admins.activateUsers")} placement="top">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="green"
                          aria-label="activate all users"
                          isLoading={actionLoading === `activate-${admin.username}`}
                          icon={<CheckCircleIcon width="16px" />}
                          onClick={() => handleActivateUsers(admin.username)}
                        />
                      </Tooltip>

                      {/* Delete Admin */}
                      {!admin.is_sudo && (
                        <Tooltip label={t("delete")} placement="top">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="delete admin"
                            icon={<TrashIcon width="16px" />}
                            onClick={() => setDeletingAdmin(admin)}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Bar */}
      <HStack
        justifyContent="space-between"
        mt={4}
        w="full"
        display="flex"
        columnGap={{ lg: 4, md: 0 }}
        rowGap={{ md: 0, base: 4 }}
        flexDirection={{ md: "row", base: "column" }}
      >
        <HStack spacing={3} order={{ base: 2, md: 1 }}>
          <Select
            minW="70px"
            w="75px"
            value={pageSize}
            onChange={handlePageSizeChange}
            size="sm"
            rounded="md"
            borderColor="light-border"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
          <Text whiteSpace="nowrap" fontSize="sm" color="gray.500">
            {t("admins.showingResults", {
              from: Math.min((page - 1) * pageSize + 1, total),
              to: Math.min(page * pageSize, total),
              total,
              defaultValue: `Showing ${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total} admins`,
            })}
          </Text>
        </HStack>

        <ButtonGroup size="sm" isAttached variant="outline" order={{ base: 1, md: 2 }}>
          <Button
            leftIcon={<PrevIcon />}
            onClick={() => handlePageChange(page - 1)}
            isDisabled={page <= 1}
          >
            {t("previous")}
          </Button>
          {pageItems.map((pageIndex) => {
            if (typeof pageIndex === "string")
              return <Button key={pageIndex} isDisabled>...</Button>;
            return (
              <Button
                key={pageIndex}
                variant={pageIndex + 1 === page ? "solid" : "outline"}
                colorScheme={pageIndex + 1 === page ? "primary" : "gray"}
                onClick={() => handlePageChange(pageIndex + 1)}
              >
                {pageIndex + 1}
              </Button>
            );
          })}
          <Button
            rightIcon={<NextIcon />}
            onClick={() => handlePageChange(page + 1)}
            isDisabled={page >= noPages}
          >
            {t("next")}
          </Button>
        </ButtonGroup>
      </HStack>
    </Box>
  );
};
