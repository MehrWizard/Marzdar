import {
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
  Spinner,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import {
  FetchAdminsQueryKey,
  useAdmins,
  useAdminsQuery,
} from "contexts/AdminsContext";
import debounce from "lodash.debounce";
import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

const SearchIcon = chakra(MagnifyingGlassIcon, iconProps);
const ClearIcon = chakra(XMarkIcon, iconProps);
const ReloadIcon = chakra(ArrowPathIcon, iconProps);
const AddIcon = chakra(PlusIcon, {
  baseStyle: {
    w: 4,
    h: 4,
    strokeWidth: 2.5,
  },
});

export const AdminsFilters: FC<BoxProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { filters, setFilters, resetFilters, setIsCreatingAdmin } = useAdmins();
  const { isLoading, isFetching } = useAdminsQuery();

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setFilters({ search: val, page: 1 });
      }, 300),
    [setFilters]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters({ search: "", page: 1 });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(FetchAdminsQueryKey);
  };

  const isFiltered = filters.search !== "" || filters.role !== "all";

  return (
    <Grid
      id="admins-filters"
      templateColumns={{
        lg: "repeat(12, 1fr)",
        base: "repeat(1, 1fr)",
      }}
      position="sticky"
      top={0}
      mx="-6"
      px="6"
      rowGap={3}
      columnGap={3}
      bg="var(--chakra-colors-chakra-body-bg)"
      transition="background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      py={4}
      zIndex="sticky"
      alignItems="center"
      {...props}
    >
      {/* Search Bar */}
      <GridItem colSpan={{ base: 12, md: 6, lg: 5 }}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchIcon />
          </InputLeftElement>
          <Input
            placeholder={t("admins.searchPlaceholder", "Search admins...")}
            value={searchInput}
            borderColor="light-border"
            borderRadius="md"
            onChange={handleSearchChange}
          />
          <InputRightElement>
            {isFetching ? (
              <Spinner size="xs" />
            ) : searchInput ? (
              <IconButton
                onClick={handleClearSearch}
                aria-label="clear"
                size="xs"
                variant="ghost"
              >
                <ClearIcon />
              </IconButton>
            ) : null}
          </InputRightElement>
        </InputGroup>
      </GridItem>

      {/* Action Controls */}
      <GridItem colSpan={{ base: 12, md: 6, lg: 7 }}>
        <HStack
          spacing={2}
          justifyContent={{ base: "flex-start", md: "flex-end" }}
          alignItems="center"
        >
          {/* Reset Filters button if active */}
          {isFiltered && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={resetFilters}
            >
              {t("clear")}
            </Button>
          )}

          {/* Refresh Button */}
          <IconButton
            aria-label="Refresh admins"
            isLoading={isFetching}
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            icon={<ReloadIcon className={classNames({ "animate-spin": isFetching })} />}
          />

          {/* Add Admin Button */}
          <Button
            colorScheme="primary"
            size="sm"
            leftIcon={<AddIcon />}
            onClick={() => setIsCreatingAdmin(true)}
            px={4}
          >
            {t("admins.addAdmin", "Add Admin")}
          </Button>
        </HStack>
      </GridItem>
    </Grid>
  );
};
