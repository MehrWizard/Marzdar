import {
  Badge,
  Box,
  CircularProgress,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  chakra,
  useColorMode,
} from "@chakra-ui/react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import { FilterUsageType, useDashboard } from "contexts/DashboardContext";
import dayjs from "dayjs";
import { FC, Suspense, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { fetch } from "service/http";
import { formatBytes } from "utils/formatByte";
import { Icon } from "./Icon";
import { UsageFilter, createUsageConfig } from "./UsageFilter";

const UsageIcon = chakra(ChartPieIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

type NodeUsageItem = {
  node_id: number | null;
  node_name: string;
  used_traffic: number;
};

export const UsersUsageModal: FC = () => {
  const { isShowingUsersUsage, onShowingUsersUsage, filters } = useDashboard();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { colorMode } = useColorMode();

  const usageTitle = t("usersUsage.totalTraffic") || "Total Traffic";
  const [usage, setUsage] = useState(createUsageConfig(colorMode, usageTitle));
  const [usageFilter, setUsageFilter] = useState("1m");
  const [usageItems, setUsageItems] = useState<NodeUsageItem[]>([]);
  const [totalTraffic, setTotalTraffic] = useState(0);

  const fetchUsageWithFilter = (query: FilterUsageType) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (query.start) params.start = query.start;
    if (query.end) params.end = query.end;
    if (filters.admin) params.admin = filters.admin;

    fetch<{ usages: NodeUsageItem[] }>("/users/usage", { query: params })
      .then((data) => {
        const items = data.usages || [];
        setUsageItems(items);

        const labels: string[] = [];
        const series: number[] = [];
        let total = 0;

        for (const item of items) {
          labels.push(item.node_name);
          series.push(item.used_traffic);
          total += item.used_traffic;
        }

        setTotalTraffic(total);
        setUsage(createUsageConfig(colorMode, usageTitle, series, labels));
      })
      .catch((err) => {
        console.error("Failed to fetch users usage:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isShowingUsersUsage) {
      fetchUsageWithFilter({
        start: dayjs().utc().subtract(30, "day").format("YYYY-MM-DDTHH:00:00"),
      });
    }
  }, [isShowingUsersUsage, filters.admin]);

  const onClose = () => {
    onShowingUsersUsage(false);
    setUsageFilter("1m");
  };

  return (
    <Modal isOpen={isShowingUsersUsage} onClose={onClose} size="2xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3" w="full">
        <ModalHeader pt={6}>
          <HStack gap={2} justify="space-between" pr={8}>
            <HStack gap={2}>
              <Icon color="primary">
                <UsageIcon color="white" />
              </Icon>
              <Text fontWeight="semibold" fontSize="lg">
                {t("usersUsage.title")}
              </Text>
            </HStack>
            {filters.admin && (
              <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="md">
                {filters.admin}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={3} disabled={loading} />
        <ModalBody>
          <VStack gap={4} align="stretch">
            <UsageFilter
              defaultValue={usageFilter}
              onChange={(filter, query) => {
                setUsageFilter(filter);
                fetchUsageWithFilter(query);
              }}
            />

            <Box alignSelf="center" w="full" maxW="320px" mt="2">
              <Suspense fallback={<CircularProgress isIndeterminate />}>
                {loading ? (
                  <Flex justify="center" align="center" h="300px">
                    <CircularProgress isIndeterminate color="primary.500" />
                  </Flex>
                ) : (
                  <ReactApexChart
                    options={usage.options}
                    series={usage.series}
                    type="donut"
                    height="320px"
                  />
                )}
              </Suspense>
            </Box>

            {/* Total Traffic Summary */}
            <Flex
              p={3}
              borderRadius="md"
              borderWidth="1px"
              bg={colorMode === "dark" ? "whiteAlpha.50" : "blackAlpha.50"}
              borderColor={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
              justify="space-between"
              align="center"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.400">
                {t("usersUsage.totalTraffic")}:
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {formatBytes(totalTraffic)}
              </Text>
            </Flex>

            {/* Breakdown by Node */}
            {usageItems.length > 0 && totalTraffic > 0 ? (
              <Box
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                borderColor={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
              >
                <Table size="sm" variant="simple">
                  <Thead bg={colorMode === "dark" ? "whiteAlpha.100" : "gray.50"}>
                    <Tr>
                      <Th>{t("usersUsage.node")}</Th>
                      <Th isNumeric>{t("usersUsage.usage")}</Th>
                      <Th isNumeric w="100px">{t("usersUsage.percentage")}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {usageItems.map((item) => {
                      const pct = totalTraffic > 0 ? (item.used_traffic / totalTraffic) * 100 : 0;
                      return (
                        <Tr key={item.node_id ?? "master"}>
                          <Td fontWeight="medium">{item.node_name}</Td>
                          <Td isNumeric>{formatBytes(item.used_traffic)}</Td>
                          <Td isNumeric>
                            <HStack justify="flex-end" gap={2}>
                              <Box w="40px">
                                <Progress
                                  value={pct}
                                  size="xs"
                                  colorScheme="primary"
                                  borderRadius="full"
                                />
                              </Box>
                              <Text fontSize="xs" color="gray.400" w="40px" textAlign="right">
                                {pct.toFixed(1)}%
                              </Text>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            ) : !loading ? (
              <Text textAlign="center" color="gray.400" fontSize="sm" py={2}>
                {t("usersUsage.noUsage")}
              </Text>
            ) : null}
          </VStack>
        </ModalBody>
        <ModalFooter mt="2"></ModalFooter>
      </ModalContent>
    </Modal>
  );
};
