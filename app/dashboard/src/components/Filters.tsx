import {
  Box,
  BoxProps,
  Button,
  chakra,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  ChartPieIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  DocumentMinusIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useAdmins } from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import useGetUser from "hooks/useGetUser";
import debounce from "lodash.debounce";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { generateErrorMessage, generateSuccessMessage } from "utils/toastHandler";
import { FilterAdminModal } from "./FilterAdminModal";

const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

const SearchIcon = chakra(MagnifyingGlassIcon, iconProps);
const ClearIcon = chakra(XMarkIcon, iconProps);
export const ReloadIcon = chakra(ArrowPathIcon, iconProps);

export type FilterProps = {} & BoxProps;

const setSearchField = debounce((search: string) => {
  useDashboard.getState().onFilterChange({
    ...useDashboard.getState().filters,
    offset: 0,
    search,
  });
}, 300);

export const Filters: FC<FilterProps> = ({ ...props }) => {
  const {
    loading,
    filters,
    onFilterChange,
    refetchUsers,
    onCreateUser,
    onCleaningExpiredUsers,
    onManagingTemplates,
    onResetAllUsage,
    onShowingUsersUsage,
  } = useDashboard();
  const { t } = useTranslation();
  const { userData } = useGetUser();
  const isSudo = userData?.is_sudo;
  const toast = useToast();
  const { disableAdminUsers, activateAdminUsers } = useAdmins();
  const [isFilterAdminOpen, setIsFilterAdminOpen] = useState(false);

  const [search, setSearch] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchField(e.target.value);
  };

  const clear = () => {
    setSearch("");
    onFilterChange({
      ...filters,
      offset: 0,
      search: "",
    });
  };

  const handleActivateAdminUsers = async () => {
    if (!filters.admin) return;
    if (
      !window.confirm(
        t("admins.activateUsersConfirm", { username: filters.admin })
      )
    )
      return;
    try {
      await activateAdminUsers(filters.admin);
      generateSuccessMessage(
        t("admins.activateUsersSuccess", { username: filters.admin }),
        toast
      );
      refetchUsers();
    } catch (e) {
      generateErrorMessage(e, toast);
    }
  };

  const handleDisableAdminUsers = async () => {
    if (!filters.admin) return;
    if (
      !window.confirm(
        t("admins.disableUsersConfirm", { username: filters.admin })
      )
    )
      return;
    try {
      await disableAdminUsers(filters.admin);
      generateSuccessMessage(
        t("admins.disableUsersSuccess", { username: filters.admin }),
        toast
      );
      refetchUsers();
    } catch (e) {
      generateErrorMessage(e, toast);
    }
  };

  return (
    <Grid
      id="filters"
      templateColumns={{
        lg: "repeat(3, 1fr)",
        md: "repeat(4, 1fr)",
        base: "repeat(1, 1fr)",
      }}
      position="sticky"
      top={0}
      mx="-6"
      px="6"
      rowGap={4}
      gap={{
        lg: 4,
        base: 0,
      }}
      bg="var(--chakra-colors-chakra-body-bg)"
      py={4}
      zIndex="sticky"
      {...props}
    >
      <GridItem colSpan={{ base: 1, md: 2, lg: 1 }} order={{ base: 2, md: 1 }}>
        <HStack spacing={2} w="full">
          <InputGroup>
            <InputLeftElement pointerEvents="none" children={<SearchIcon />} />
            <Input
              placeholder={t("search")}
              value={search}
              borderColor="light-border"
              onChange={onChange}
            />

            <InputRightElement>
              {loading && <Spinner size="xs" />}
              {filters.search && filters.search.length > 0 && (
                <IconButton
                  onClick={clear}
                  aria-label="clear"
                  size="xs"
                  variant="ghost"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputRightElement>
          </InputGroup>

          {filters.admin && (
            <Tag size="md" colorScheme="primary" borderRadius="full" flexShrink={0}>
              <TagLabel fontSize="xs">
                {filters.admin}
              </TagLabel>
              <TagCloseButton onClick={() => onFilterChange({ admin: undefined, offset: 0 })} />
            </Tag>
          )}
        </HStack>
      </GridItem>
      <GridItem colSpan={2} order={{ base: 1, md: 2 }}>
        <HStack justifyContent="flex-end" alignItems="center" h="full" spacing={2}>
          <IconButton
            aria-label="refresh users"
            disabled={loading}
            onClick={refetchUsers}
            size="sm"
            variant="outline"
          >
            <ReloadIcon
              className={classNames({
                "animate-spin": loading,
              })}
            />
          </IconButton>
          <Button
            colorScheme="primary"
            size="sm"
            onClick={() => onCreateUser(true)}
            px={5}
          >
            {t("createUser")}
          </Button>

          {/* More Actions Menu */}
          <Menu isLazy>
            <MenuButton
              as={IconButton}
              size="sm"
              variant={filters.admin ? "solid" : "outline"}
              colorScheme={filters.admin ? "primary" : "gray"}
              aria-label="More actions"
              icon={<EllipsisVerticalIcon width="18px" height="18px" />}
            />
            <Portal>
              <MenuList minW="220px" zIndex={99999}>
                {isSudo && (
                  <MenuItem
                    fontSize="sm"
                    icon={<FunnelIcon width="16px" height="16px" color={filters.admin ? "var(--chakra-colors-primary-500)" : undefined} />}
                    onClick={() => setIsFilterAdminOpen(true)}
                  >
                    {filters.admin ? `${t("filters.filterByAdmin")}: ${filters.admin}` : t("filters.filterByAdmin")}
                  </MenuItem>
                )}
                {isSudo && (
                  <MenuItem
                    fontSize="sm"
                    icon={<DocumentDuplicateIcon width="16px" height="16px" color="var(--chakra-colors-primary-500)" />}
                    onClick={() => onManagingTemplates(true)}
                  >
                    {t("templates.title")}
                  </MenuItem>
                )}
                <MenuItem
                  fontSize="sm"
                  icon={<ChartPieIcon width="16px" height="16px" color="var(--chakra-colors-blue-500)" />}
                  onClick={() => onShowingUsersUsage(true)}
                >
                  {filters.admin ? `${t("usersUsage.title")} (${filters.admin})` : t("usersUsage.title")}
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  fontSize="sm"
                  icon={<TrashIcon width="16px" height="16px" color="var(--chakra-colors-red-500)" />}
                  onClick={() => onCleaningExpiredUsers(true)}
                >
                  {t("expiredUsers.menuAction")}
                </MenuItem>
                {isSudo && (
                  <MenuItem
                    fontSize="sm"
                    icon={<DocumentMinusIcon width="16px" height="16px" color="var(--chakra-colors-yellow-500)" />}
                    onClick={() => onResetAllUsage(true)}
                  >
                    {t("resetAllUsage")}
                  </MenuItem>
                )}
                {isSudo && filters.admin && (
                  <>
                    <MenuDivider />
                    <MenuItem
                      fontSize="sm"
                      icon={<CheckCircleIcon width="16px" height="16px" color="var(--chakra-colors-green-500)" />}
                      onClick={handleActivateAdminUsers}
                    >
                      {t("admins.activateUsers")}: {filters.admin}
                    </MenuItem>
                    <MenuItem
                      fontSize="sm"
                      icon={<NoSymbolIcon width="16px" height="16px" color="var(--chakra-colors-orange-500)" />}
                      onClick={handleDisableAdminUsers}
                    >
                      {t("admins.disableUsers")}: {filters.admin}
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Portal>
          </Menu>
        </HStack>
      </GridItem>
      {isSudo && (
        <FilterAdminModal
          isOpen={isFilterAdminOpen}
          onClose={() => setIsFilterAdminOpen(false)}
          currentAdmin={filters.admin}
          onSelectAdmin={(admin) => onFilterChange({ admin, offset: 0 })}
        />
      )}
    </Grid>
  );
};
