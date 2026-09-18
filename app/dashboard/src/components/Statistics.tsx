import {
  Box,
  BoxProps,
  Card,
  chakra,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  ChartBarIcon,
  ChartPieIcon,
  CpuChipIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import { FC, PropsWithChildren, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { fetch } from "service/http";
import { formatBytes, numberWithCommas } from "utils/formatByte";

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
};

const StatisticCard: FC<PropsWithChildren<StatisticCardProps>> = ({
  title,
  content,
  subContent,
  icon,
}) => {
  return (
    <Card
      p={{ base: 3, sm: 4, md: 5 }}
      borderWidth="1px"
      borderColor="light-border"
      bg="#F9FAFB"
      _dark={{ borderColor: "gray.600", bg: "gray.750" }}
      borderStyle="solid"
      boxShadow="none"
      borderRadius="12px"
      width="full"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
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
};

export const StatisticsQueryKey = "statistics-query-key";

export const Statistics: FC<BoxProps> = (props) => {
  const { version } = useDashboard();
  const { data: systemData } = useQuery({
    queryKey: StatisticsQueryKey,
    queryFn: () => fetch("/system"),
    refetchInterval: 5000,
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
      {/* 1. Active Users + Online Users */}
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
        icon={<TotalUsersIcon />}
      />

      {/* 2. Data Usage + Real-time Speeds */}
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
        icon={<NetworkIcon />}
      />

      {/* 3. CPU Usage */}
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

      {/* 4. Memory Usage */}
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
