import {
  Badge,
  Box,
  BoxProps,
  Card,
  chakra,
  Divider,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ChartBarIcon,
  ChartPieIcon,
  CpuChipIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAdminsQuery } from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import { FC, PropsWithChildren, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { fetch } from "service/http";
import { formatBytes, numberWithCommas } from "utils/formatByte";

const TotalAdminsIcon = chakra(UserGroupIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    position: "relative",
    zIndex: "2",
  },
});

const TotalUsersIcon = chakra(UsersIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    position: "relative",
    zIndex: "2",
  },
});

const NetworkIcon = chakra(ChartBarIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    position: "relative",
    zIndex: "2",
  },
});

const CpuIcon = chakra(CpuChipIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    position: "relative",
    zIndex: "2",
  },
});

const MemoryIcon = chakra(ChartPieIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    position: "relative",
    zIndex: "2",
  },
});

type StatisticCardProps = {
  title: string;
  content: ReactNode;
  subContent?: ReactNode;
  icon: ReactElement;
  popoverContent?: ReactNode;
};

const StatisticCard: FC<PropsWithChildren<StatisticCardProps>> = ({
  title,
  content,
  subContent,
  icon,
  popoverContent,
}) => {
  const cardElement = (
    <Card
      p={{ base: 3, sm: 4, md: 5 }}
      borderWidth="1px"
      borderColor="var(--theme-card-border)"
      bg="var(--theme-card-bg)"
      _dark={{ borderColor: "var(--theme-card-border)", bg: "var(--theme-card-bg)" }}
      borderStyle="solid"
      boxShadow="none"
      borderRadius="12px"
      width="full"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      cursor={popoverContent ? "pointer" : "default"}
      transition="all 0.2s ease, background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease"
      _hover={
        popoverContent
          ? {
              borderColor: "var(--theme-card-hover-border, primary.400)",
              transform: "translateY(-2px)",
              shadow: "md",
            }
          : undefined
      }
    >
      <HStack
        alignItems="center"
        columnGap={{ base: 2, md: 3 }}
        mb={{ base: 2, md: 3 }}
      >
        <Box
          p="2"
          position="relative"
          color="white"
          _before={{
            content: `""`,
            position: "absolute",
            top: 0,
            left: 0,
            bg: "primary.400",
            display: "block",
            w: "full",
            h: "full",
            borderRadius: "5px",
            opacity: ".5",
            z: "1",
          }}
          _after={{
            content: `""`,
            position: "absolute",
            top: "-5px",
            left: "-5px",
            bg: "primary.400",
            display: "block",
            w: "calc(100% + 10px)",
            h: "calc(100% + 10px)",
            borderRadius: "8px",
            opacity: ".4",
            z: "1",
          }}
        >
          {icon}
        </Box>
        <Text
          color="gray.600"
          _dark={{
            color: "gray.300",
          }}
          fontWeight="medium"
          textTransform="capitalize"
          fontSize={{ base: "xs", md: "sm" }}
          noOfLines={1}
        >
          {title}
        </Text>
      </HStack>
      <Box>
        <Box
          fontSize={{ base: "xl", sm: "2xl", xl: "3xl" }}
          fontWeight="semibold"
          lineHeight="short"
        >
          {content}
        </Box>
        {subContent && (
          <Box mt={1} fontSize="xs" fontWeight="medium">
            {subContent}
          </Box>
        )}
      </Box>
    </Card>
  );

  if (!popoverContent) {
    return cardElement;
  }

  return (
    <Popover
      trigger="hover"
      placement="bottom"
      openDelay={100}
      closeDelay={200}
      isLazy
    >
      <PopoverTrigger>
        <Box w="full" outline="none">
          {cardElement}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        zIndex={9999}
        _focus={{ boxShadow: "none" }}
        bg="var(--theme-card-bg)"
        borderColor="var(--theme-card-border)"
        _dark={{ bg: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}
        borderRadius="12px"
        p={3}
        shadow="xl"
        minW={{ base: "250px", sm: "280px" }}
        w="auto"
      >
        <PopoverArrow bg="var(--theme-card-bg)" _dark={{ bg: "var(--theme-card-bg)" }} />
        <PopoverBody p={1}>{popoverContent}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export const StatisticsQueryKey = "statistics-query-key";

export const Statistics: FC<BoxProps> = (props) => {
  const { version, activeTab } = useDashboard();
  const { data: admins = [] } = useAdminsQuery(activeTab === "admins");

  const totalAdmins = admins.length;
  const sudoAdmins = admins.filter((a) => a.is_sudo);
  const regularAdmins = admins.filter((a) => !a.is_sudo);
  const activeAdmins = admins.filter((a) => (a.active_users_count ?? 0) > 0);
  const adminsWithUsers = admins.filter((a) => (a.users_count ?? 0) > 0);
  const adminsWithoutUsers = admins.filter((a) => (a.users_count ?? 0) === 0);
  const totalResellerTraffic = admins.reduce(
    (acc, a) => acc + (a.users_usage || 0),
    0
  );
  const totalUsersManaged = admins.reduce(
    (acc, a) => acc + (a.users_count || 0),
    0
  );
  const totalActiveUsersManaged = admins.reduce(
    (acc, a) => acc + (a.active_users_count || 0),
    0
  );

  const { data: systemData } = useQuery({
    queryKey: StatisticsQueryKey,
    queryFn: () => fetch("/system"),
    refetchInterval: 5000,
    staleTime: 4000,
    refetchOnWindowFocus: false,
    onSuccess: ({ version: currentVersion }) => {
      if (version !== currentVersion)
        useDashboard.setState({ version: currentVersion });
    },
  });
  const { t } = useTranslation();

  return (
    <SimpleGrid
      columns={{ base: 2, lg: 4 }}
      spacing={{ base: 3, md: 4 }}
      w="full"
      {...props}
    >
      {/* 1. Active Users (Users view) OR Active Admins (Admins view) */}
      {activeTab === "admins" ? (
        <StatisticCard
          title={t("admins.activeAdmins", "Active Admins")}
          content={
            <HStack alignItems="flex-end" spacing={1}>
              <Text>{numberWithCommas(activeAdmins.length)}</Text>
              <Text
                fontWeight="normal"
                fontSize={{ base: "xs", sm: "md" }}
                as="span"
                display="inline-block"
                pb={{ base: "1px", sm: "3px" }}
                color="gray.500"
                _dark={{ color: "gray.400" }}
              >
                / {numberWithCommas(totalAdmins)}
              </Text>
            </HStack>
          }
          subContent={
            <HStack
              spacing={1.5}
              alignItems="center"
              color="green.500"
              _dark={{ color: "green.400" }}
            >
              <Box w="2" h="2" rounded="full" bg="green.500" />
              <Text fontSize="xs" fontWeight="medium">
                {sudoAdmins.length} {t("admins.sudo", "Sudo")} • {regularAdmins.length} {t("admins.regular", "Regular")}
              </Text>
            </HStack>
          }
          popoverContent={
            <VStack spacing={2} align="stretch" fontSize="xs">
              <Text
                fontWeight="semibold"
                pb={1}
                borderBottomWidth="1px"
                borderColor="light-border"
                color="gray.700"
                _dark={{ borderColor: "gray.700", color: "gray.200" }}
              >
                {t("admins.breakdown", "Admins Breakdown")}
              </Text>

              {/* Active Admins */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="green.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("admins.activeAdmins", "Active Admins")}
                  </Text>
                </HStack>
                <Badge colorScheme="green" rounded="md" px={2}>
                  {numberWithCommas(activeAdmins.length)}
                </Badge>
              </HStack>

              {/* Sudo Admins */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="purple.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("admins.sudoAdmins", "Sudo Admins")}
                  </Text>
                </HStack>
                <Badge colorScheme="purple" rounded="md" px={2}>
                  {numberWithCommas(sudoAdmins.length)}
                </Badge>
              </HStack>

              {/* Regular Admins */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="blue.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("admins.regularOnly", "Regular Admins")}
                  </Text>
                </HStack>
                <Badge colorScheme="blue" rounded="md" px={2}>
                  {numberWithCommas(regularAdmins.length)}
                </Badge>
              </HStack>

              {/* Admins with Users */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="teal.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("admins.withUsers", "With Users")}
                  </Text>
                </HStack>
                <Badge colorScheme="teal" rounded="md" px={2}>
                  {numberWithCommas(adminsWithUsers.length)}
                </Badge>
              </HStack>

              {/* Admins without Users */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="gray.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("admins.noUsers", "Without Users")}
                  </Text>
                </HStack>
                <Badge colorScheme="gray" rounded="md" px={2}>
                  {numberWithCommas(adminsWithoutUsers.length)}
                </Badge>
              </HStack>

              <Divider
                my={1}
                borderColor="light-border"
                _dark={{ borderColor: "gray.700" }}
              />

              {/* Total Managed Users */}
              <HStack justify="space-between">
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  {t("admins.totalManagedUsers", "Total Managed Users")}
                </Text>
                <Text fontWeight="semibold">
                  {numberWithCommas(totalUsersManaged)}
                </Text>
              </HStack>

              {/* Active Managed Users */}
              <HStack justify="space-between">
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  {t("admins.activeUsers", "Active Managed Users")}
                </Text>
                <Text fontWeight="semibold" color="green.500">
                  {numberWithCommas(totalActiveUsersManaged)}
                </Text>
              </HStack>

              {/* Total Reseller Bandwidth */}
              <HStack justify="space-between">
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  {t("admins.resellerTraffic", "Reseller Traffic")}
                </Text>
                <Text fontWeight="semibold" color="orange.500">
                  {formatBytes(totalResellerTraffic)}
                </Text>
              </HStack>

              {/* Total Admins */}
              <HStack
                justify="space-between"
                pt={1}
                borderTopWidth="1px"
                borderColor="light-border"
                _dark={{ borderColor: "gray.700" }}
              >
                <Text fontWeight="semibold" color="gray.700" _dark={{ color: "gray.200" }}>
                  {t("total")}
                </Text>
                <Text fontWeight="semibold">
                  {numberWithCommas(totalAdmins)}
                </Text>
              </HStack>
            </VStack>
          }
          icon={<TotalAdminsIcon />}
        />
      ) : (
        <StatisticCard
          title={t("activeUsers")}
        content={
          systemData && (
            <HStack alignItems="flex-end" spacing={1}>
              <Text>{numberWithCommas(systemData.users_active)}</Text>
              <Text
                fontWeight="normal"
                fontSize={{ base: "xs", sm: "md" }}
                as="span"
                display="inline-block"
                pb={{ base: "1px", sm: "3px" }}
                color="gray.500"
                _dark={{ color: "gray.400" }}
              >
                / {numberWithCommas(systemData.total_user)}
              </Text>
            </HStack>
          )
        }
        subContent={
          systemData && (
            <HStack
              spacing={1.5}
              alignItems="center"
              color="green.500"
              _dark={{ color: "green.400" }}
            >
              <Box w="2" h="2" rounded="full" bg="green.500" />
              <Text fontSize="xs" fontWeight="medium">
                {numberWithCommas(systemData.online_users)} {t("online")}
              </Text>
            </HStack>
          )
        }
        popoverContent={
          systemData && (
            <VStack spacing={2} align="stretch" fontSize="xs">
              <Text
                fontWeight="semibold"
                pb={1}
                borderBottomWidth="1px"
                borderColor="light-border"
                color="gray.700"
                _dark={{ borderColor: "gray.700", color: "gray.200" }}
              >
                {t("usersBreakdown")}
              </Text>

              {/* Active */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="green.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("status.active")}
                  </Text>
                </HStack>
                <Badge colorScheme="green" rounded="md" px={2}>
                  {numberWithCommas(systemData.users_active)}
                </Badge>
              </HStack>

              {/* On Hold */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="purple.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("status.on_hold")}
                  </Text>
                </HStack>
                <Badge colorScheme="purple" rounded="md" px={2}>
                  {numberWithCommas(systemData.users_on_hold)}
                </Badge>
              </HStack>

              {/* Limited */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="red.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("status.limited")}
                  </Text>
                </HStack>
                <Badge colorScheme="red" rounded="md" px={2}>
                  {numberWithCommas(systemData.users_limited)}
                </Badge>
              </HStack>

              {/* Expired */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="orange.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("status.expired")}
                  </Text>
                </HStack>
                <Badge colorScheme="orange" rounded="md" px={2}>
                  {numberWithCommas(systemData.users_expired)}
                </Badge>
              </HStack>

              {/* Disabled */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="gray.500" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("status.disabled")}
                  </Text>
                </HStack>
                <Badge colorScheme="gray" rounded="md" px={2}>
                  {numberWithCommas(systemData.users_disabled)}
                </Badge>
              </HStack>

              <Divider
                my={1}
                borderColor="light-border"
                _dark={{ borderColor: "gray.700" }}
              />

              {/* Online */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="2" h="2" rounded="full" bg="green.400" />
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("online")}
                  </Text>
                </HStack>
                <Text fontWeight="semibold" color="green.500">
                  {numberWithCommas(systemData.online_users)}
                </Text>
              </HStack>

              {/* Total */}
              <HStack justify="space-between">
                <Text
                  fontWeight="semibold"
                  color="gray.700"
                  _dark={{ color: "gray.200" }}
                >
                  {t("total")}
                </Text>
                <Text fontWeight="semibold">
                  {numberWithCommas(systemData.total_user)}
                </Text>
              </HStack>
            </VStack>
          )
        }
        icon={<TotalUsersIcon />}
      />
      )}

      {/* 2. Data Usage + Real-time Speeds (With Breakdown on hover/click) */}
      <StatisticCard
        title={t("dataUsage")}
        content={
          systemData &&
          formatBytes(
            systemData.incoming_bandwidth + systemData.outgoing_bandwidth
          )
        }
        subContent={
          systemData && (
            <HStack
              spacing={{ base: 1.5, sm: 2.5 }}
              fontSize="xs"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              fontWeight="medium"
              flexWrap="wrap"
            >
              <Text as="span" title="Download speed">
                <chakra.span color="green.500" fontWeight="bold">
                  ↓
                </chakra.span>{" "}
                {formatBytes(systemData.incoming_bandwidth_speed || 0)}/s
              </Text>
              <Text as="span" title="Upload speed">
                <chakra.span color="blue.400" fontWeight="bold">
                  ↑
                </chakra.span>{" "}
                {formatBytes(systemData.outgoing_bandwidth_speed || 0)}/s
              </Text>
            </HStack>
          )
        }
        popoverContent={
          systemData && (
            <VStack spacing={2} align="stretch" fontSize="xs">
              <Text
                fontWeight="semibold"
                pb={1}
                borderBottomWidth="1px"
                borderColor="light-border"
                color="gray.700"
                _dark={{ borderColor: "gray.700", color: "gray.200" }}
              >
                {t("bandwidthBreakdown")}
              </Text>

              {/* Total Download */}
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <chakra.span color="green.500" fontWeight="bold">
                    ↓
                  </chakra.span>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("download")}
                  </Text>
                </HStack>
                <Text fontWeight="semibold">
                  {formatBytes(systemData.outgoing_bandwidth)}
                </Text>
              </HStack>

              {/* Total Upload */}
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <chakra.span color="blue.400" fontWeight="bold">
                    ↑
                  </chakra.span>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("upload")}
                  </Text>
                </HStack>
                <Text fontWeight="semibold">
                  {formatBytes(systemData.incoming_bandwidth)}
                </Text>
              </HStack>

              {/* Total Cumulative */}
              <HStack justify="space-between">
                <Text
                  fontWeight="semibold"
                  color="gray.700"
                  _dark={{ color: "gray.200" }}
                >
                  {t("total")}
                </Text>
                <Text fontWeight="semibold">
                  {formatBytes(
                    systemData.incoming_bandwidth +
                      systemData.outgoing_bandwidth
                  )}
                </Text>
              </HStack>

              <Divider
                my={1}
                borderColor="light-border"
                _dark={{ borderColor: "gray.700" }}
              />

              <Text
                fontSize="2xs"
                textTransform="uppercase"
                fontWeight="bold"
                color="gray.400"
                letterSpacing="wider"
              >
                {t("realtimeSpeed")}
              </Text>

              {/* Real-time Download */}
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <chakra.span color="green.500" fontWeight="bold">
                    ↓
                  </chakra.span>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("download")}
                  </Text>
                </HStack>
                <Badge colorScheme="green" rounded="md" px={2}>
                  {formatBytes(systemData.incoming_bandwidth_speed || 0)}/s
                </Badge>
              </HStack>

              {/* Real-time Upload */}
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <chakra.span color="blue.400" fontWeight="bold">
                    ↑
                  </chakra.span>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {t("upload")}
                  </Text>
                </HStack>
                <Badge colorScheme="blue" rounded="md" px={2}>
                  {formatBytes(systemData.outgoing_bandwidth_speed || 0)}/s
                </Badge>
              </HStack>
            </VStack>
          )
        }
        icon={<NetworkIcon />}
      />

      {/* 3. CPU Usage (Untouched, complete) */}
      <StatisticCard
        title={t("cpuUsage")}
        content={
          systemData && (
            <HStack alignItems="flex-end" spacing={1}>
              <Text>{(systemData.cpu_usage ?? 0).toFixed(1)}%</Text>
            </HStack>
          )
        }
        subContent={
          systemData && (
            <Text
              fontSize="xs"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              fontWeight="medium"
            >
              {systemData.cpu_cores}{" "}
              {systemData.cpu_cores > 1 ? t("cores") : t("core")}
            </Text>
          )
        }
        icon={<CpuIcon />}
      />

      {/* 4. Memory Usage (Untouched, complete) */}
      <StatisticCard
        title={t("memoryUsage")}
        content={
          systemData && (
            <HStack alignItems="flex-end" spacing={1}>
              <Text>{formatBytes(systemData.mem_used, 1, true)[0]}</Text>
              <Text
                fontWeight="normal"
                fontSize={{ base: "xs", sm: "md" }}
                as="span"
                display="inline-block"
                pb={{ base: "1px", sm: "3px" }}
                color="gray.500"
                _dark={{ color: "gray.400" }}
              >
                {formatBytes(systemData.mem_used, 1, true)[1]} /{" "}
                {formatBytes(systemData.mem_total, 1)}
              </Text>
            </HStack>
          )
        }
        subContent={
          systemData && (
            <Text
              fontSize="xs"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              fontWeight="medium"
            >
              {systemData.mem_total
                ? Math.round(
                    (systemData.mem_used / systemData.mem_total) * 100
                  )
                : 0}
              % {t("used")}
            </Text>
          )
        }
        icon={<MemoryIcon />}
      />
    </SimpleGrid>
  );
};
