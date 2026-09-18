import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { fetch } from "service/http";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { Icon } from "./Icon";
import { Input } from "./Input";

dayjs.extend(utc);

type PresetOption = "now" | "7days" | "14days" | "30days" | "custom";

export const ExpiredUsersModal: FC = () => {
  const { isCleaningExpiredUsers, onCleaningExpiredUsers, refetchUsers } =
    useDashboard();
  const { t } = useTranslation();
  const toast = useToast();

  const [preset, setPreset] = useState<PresetOption>("30days");
  const [customDate, setCustomDate] = useState<string>(
    dayjs().subtract(30, "day").format("YYYY-MM-DD")
  );

  const expiredBefore = useMemo(() => {
    if (preset === "now") {
      return dayjs().utc().toISOString();
    } else if (preset === "7days") {
      return dayjs().subtract(7, "day").utc().toISOString();
    } else if (preset === "14days") {
      return dayjs().subtract(14, "day").utc().toISOString();
    } else if (preset === "30days") {
      return dayjs().subtract(30, "day").utc().toISOString();
    } else {
      return customDate
        ? dayjs(customDate).endOf("day").utc().toISOString()
        : "";
    }
  }, [preset, customDate]);

  const {
    data: expiredUsers,
    isLoading: isPreviewLoading,
    refetch,
  } = useQuery(
    ["expired-users-preview", expiredBefore],
    () =>
      fetch<string[]>("/users/expired", {
        query: { expired_before: expiredBefore },
      }),
    {
      enabled: isCleaningExpiredUsers && !!expiredBefore,
      refetchOnWindowFocus: false,
    }
  );

  const { isLoading: isDeleting, mutate: onDelete } = useMutation(
    () =>
      fetch<string[]>("/users/expired", {
        method: "DELETE",
        query: { expired_before: expiredBefore },
      }),
    {
      onSuccess: (deletedUsers) => {
        generateSuccessMessage(
          t("expiredUsers.deleteSuccess", { count: deletedUsers.length }),
          toast
        );
        refetchUsers();
        onClose();
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  const onClose = () => {
    onCleaningExpiredUsers(false);
  };

  const usersCount = expiredUsers?.length ?? 0;

  return (
    <Modal isOpen={isCleaningExpiredUsers} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3">
        <ModalHeader pt={6}>
          <Icon color="red">
            <TrashIcon width="20px" height="20px" color="white" />
          </Icon>
        </ModalHeader>
        <ModalCloseButton mt={3} />
        <ModalBody pb={4} pt={2}>
          <Text fontWeight="semibold" fontSize="lg" mb={1}>
            {t("expiredUsers.title")}
          </Text>
          <Text fontSize="xs" color="gray.500" mb={4}>
            {t("expiredUsers.description")}
          </Text>

          <VStack spacing={3} align="stretch">
            <FormControl>
              <FormLabel fontSize="xs">{t("expiredUsers.filterRange")}</FormLabel>
              <Select
                size="sm"
                borderRadius="md"
                value={preset}
                onChange={(e) => setPreset(e.target.value as PresetOption)}
              >
                <option value="30days">{t("expiredUsers.olderThan30Days")}</option>
                <option value="14days">{t("expiredUsers.olderThan14Days")}</option>
                <option value="7days">{t("expiredUsers.olderThan7Days")}</option>
                <option value="now">{t("expiredUsers.allExpiredUpToNow")}</option>
                <option value="custom">{t("expiredUsers.customDate")}</option>
              </Select>
            </FormControl>

            {preset === "custom" && (
              <FormControl>
                <FormLabel fontSize="xs">{t("expiredUsers.selectDate")}</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </FormControl>
            )}

            {/* Preview Section */}
            <Box
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.600", bg: "gray.750" }}
              bg="gray.50"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontWeight="medium">
                  {t("expiredUsers.matchingUsers")}
                </Text>
                {isPreviewLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <Badge colorScheme={usersCount > 0 ? "red" : "gray"}>
                    {usersCount} {t("users")}
                  </Badge>
                )}
              </HStack>

              {usersCount > 0 ? (
                <Box maxH="120px" overflowY="auto" pt={1}>
                  <Wrap spacing={1.5}>
                    {expiredUsers?.slice(0, 50).map((username) => (
                      <WrapItem key={username}>
                        <Badge variant="subtle" fontSize="2xs" px={1.5}>
                          {username}
                        </Badge>
                      </WrapItem>
                    ))}
                    {usersCount > 50 && (
                      <WrapItem>
                        <Badge variant="outline" fontSize="2xs">
                          +{usersCount - 50} {t("more")}
                        </Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              ) : (
                !isPreviewLoading && (
                  <Text fontSize="2xs" color="gray.500">
                    {t("expiredUsers.noMatchingUsers")}
                  </Text>
                )
              )}
            </Box>

            {usersCount > 0 && (
              <Alert status="warning" size="xs" borderRadius="md" py={2}>
                <AlertIcon />
                <Text fontSize="xs">
                  {t("expiredUsers.warningPermanent")}
                </Text>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2}>
          <Button size="sm" variant="outline" w="full" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            w="full"
            isLoading={isDeleting}
            isDisabled={usersCount === 0 || isPreviewLoading}
            onClick={() => onDelete()}
          >
            {t("expiredUsers.deleteButton", { count: usersCount })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
