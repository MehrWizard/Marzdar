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
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useAdminsQuery } from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import useGetUser from "hooks/useGetUser";
import debounce from "lodash.debounce";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";

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
  } = useDashboard();
  const { t } = useTranslation();
  const { userData } = useGetUser();
  const isSudo = userData?.is_sudo;
  const { data: admins } = useAdminsQuery();

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
      zIndex="docked"
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

          {/* Filter Button (Filter by Admin for Sudoers) */}
          {isSudo && (
            <Popover placement="bottom-start" isLazy>
              <PopoverTrigger>
                <Box position="relative">
                  <IconButton
                    size="md"
                    variant={filters.admin ? "solid" : "outline"}
                    colorScheme={filters.admin ? "primary" : "gray"}
                    aria-label={t("filters.filter")}
                    icon={<FunnelIcon width="18px" height="18px" />}
                  />
                  {filters.admin && (
                    <Box
                      position="absolute"
                      top="-1"
                      right="-1"
                      w="2.5"
                      h="2.5"
                      rounded="full"
                      bg="primary.500"
                    />
                  )}
                </Box>
              </PopoverTrigger>
              <PopoverContent p={3} w="260px" zIndex={9999} _focus={{ boxShadow: "none" }}>
                <PopoverArrow />
                <PopoverBody p={0}>
                  <VStack align="stretch" spacing={2.5}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" fontWeight="semibold">
                        {t("filters.filterByAdmin")}
                      </Text>
                      {filters.admin && (
                        <Button
                          size="2xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => onFilterChange({ admin: undefined, offset: 0 })}
                        >
                          {t("clear")}
                        </Button>
                      )}
                    </HStack>
                    <Select
                      size="sm"
                      borderRadius="md"
                      value={filters.admin || ""}
                      onChange={(e) =>
                        onFilterChange({
                          admin: e.target.value || undefined,
                          offset: 0,
                        })
                      }
                    >
                      <option value="">{t("filters.allAdmins")}</option>
                      {admins?.map((admin) => (
                        <option key={admin.username} value={admin.username}>
                          {admin.username} {admin.is_sudo ? `(${t("admins.sudo")})` : ""}
                        </option>
                      ))}
                    </Select>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

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
          <Menu>
            <MenuButton
              as={IconButton}
              size="sm"
              variant="outline"
              aria-label="More actions"
              icon={<EllipsisVerticalIcon width="18px" height="18px" />}
            />
            <MenuList minW="180px" zIndex={9999}>
              {isSudo && (
                <MenuItem
                  fontSize="sm"
                  icon={<TrashIcon width="16px" height="16px" color="var(--chakra-colors-red-500)" />}
                  onClick={() => onCleaningExpiredUsers(true)}
                >
                  {t("expiredUsers.menuAction")}
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </HStack>
      </GridItem>
    </Grid>
  );
};
