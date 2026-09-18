import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetch } from "service/http";
import { User } from "types/User";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { Icon } from "./Icon";

export const NextPlanModal: FC = () => {
  const { nextPlanUser, onNextPlanUser, activeNextPlan, refetchUsers, onEditingUser } =
    useDashboard();
  const { t } = useTranslation();
  const toast = useToast();

  const [isEditingForm, setIsEditingForm] = useState(false);
  const [dataLimitGB, setDataLimitGB] = useState<string>("50");
  const [expireDays, setExpireDays] = useState<string>("30");
  const [addRemainingTraffic, setAddRemainingTraffic] = useState(false);
  const [fireOnEither, setFireOnEither] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const hasQueuedPlan = !!nextPlanUser?.next_plan;

  useEffect(() => {
    if (nextPlanUser?.next_plan) {
      const plan = nextPlanUser.next_plan;
      setDataLimitGB(
        plan.data_limit
          ? String(Math.round((plan.data_limit / 1073741824) * 100) / 100)
          : "0"
      );
      if (plan.expire) {
        if (plan.expire < 1000000000) {
          setExpireDays(String(Math.round(plan.expire / 86400)));
        } else {
          const daysLeft = Math.max(
            0,
            Math.round((plan.expire - Date.now() / 1000) / 86400)
          );
          setExpireDays(String(daysLeft));
        }
      } else {
        setExpireDays("0");
      }
      setAddRemainingTraffic(plan.add_remaining_traffic ?? false);
      setFireOnEither(plan.fire_on_either ?? true);
      setIsEditingForm(false);
    } else {
      setDataLimitGB("50");
      setExpireDays("30");
      setAddRemainingTraffic(false);
      setFireOnEither(true);
      setIsEditingForm(true);
    }
  }, [nextPlanUser]);

  if (!nextPlanUser) return null;

  const onClose = () => {
    setIsEditingForm(false);
    onNextPlanUser(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataLimitBytes =
        Number(dataLimitGB) > 0
          ? Math.round(Number(dataLimitGB) * 1073741824)
          : 0;
      const expireSeconds =
        Number(expireDays) > 0
          ? Math.round(Number(expireDays) * 86400)
          : null;

      const payload = {
        next_plan: {
          data_limit: dataLimitBytes,
          expire: expireSeconds,
          add_remaining_traffic: addRemainingTraffic,
          fire_on_either: fireOnEither,
        },
      };

      const updatedUser = await fetch<User>(`/user/${nextPlanUser.username}`, {
        method: "PUT",
        body: payload,
      });

      generateSuccessMessage(t("nextPlan.saveSuccess"), toast);
      onNextPlanUser(updatedUser);
      onEditingUser(updatedUser);
      refetchUsers();
      setIsEditingForm(false);
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (
      !window.confirm(
        t("nextPlan.removeConfirm", { username: nextPlanUser.username })
      )
    ) {
      return;
    }
    setIsRemoving(true);
    try {
      const updatedUser = await fetch<User>(`/user/${nextPlanUser.username}`, {
        method: "PUT",
        body: { next_plan: null },
      });

      generateSuccessMessage(t("nextPlan.removeSuccess"), toast);
      onNextPlanUser(updatedUser);
      onEditingUser(updatedUser);
      refetchUsers();
      onClose();
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleActivate = async () => {
    if (
      !window.confirm(
        t("nextPlan.activateConfirm", { username: nextPlanUser.username })
      )
    ) {
      return;
    }
    setIsActivating(true);
    try {
      const updatedUser = await activeNextPlan(nextPlanUser);
      generateSuccessMessage(
        t("nextPlan.activateSuccess", { username: nextPlanUser.username }),
        toast
      );
      onNextPlanUser(null);
      onEditingUser(updatedUser);
      refetchUsers();
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setIsActivating(false);
    }
  };

  const plan = nextPlanUser.next_plan;
  const currentDataLimitGB = plan?.data_limit
    ? Math.round((plan.data_limit / 1073741824) * 100) / 100
    : null;
  const currentDurationDays = plan?.expire
    ? plan.expire < 1000000000
      ? Math.round(plan.expire / 86400)
      : Math.max(0, Math.round((plan.expire - Date.now() / 1000) / 86400))
    : null;

  return (
    <Modal isOpen={!!nextPlanUser} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3">
        <ModalHeader pt={6}>
          <HStack spacing={3}>
            <Icon color="purple">
              <ClockIcon width="20px" height="20px" color="white" />
            </Icon>
            <Box>
              <Text fontWeight="semibold" fontSize="lg">
                {t("nextPlan.title")}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                @{nextPlanUser.username}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={3} />

        <ModalBody pb={4} pt={2}>
          <VStack spacing={4} align="stretch">
            {/* View Mode (if queued plan exists and not editing) */}
            {hasQueuedPlan && !isEditingForm && (
              <Box
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="purple.200"
                _dark={{ borderColor: "purple.800", bg: "gray.750" }}
                bg="purple.50"
              >
                <HStack justify="space-between" mb={3}>
                  <Badge colorScheme="purple" fontSize="xs">
                    {t("nextPlan.hasQueuedPlan")}
                  </Badge>
                  <HStack spacing={1}>
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<PencilSquareIcon width="14px" />}
                      onClick={() => setIsEditingForm(true)}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      isLoading={isRemoving}
                      leftIcon={<TrashIcon width="14px" />}
                      onClick={handleRemove}
                    >
                      {t("remove")}
                    </Button>
                  </HStack>
                </HStack>

                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {t("nextPlan.dataLimit")}:
                    </Text>
                    <Badge colorScheme={currentDataLimitGB ? "blue" : "gray"}>
                      {currentDataLimitGB ? `${currentDataLimitGB} GB` : "Unlimited"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {t("nextPlan.expireDays")}:
                    </Text>
                    <Badge colorScheme={currentDurationDays ? "green" : "gray"}>
                      {currentDurationDays ? `${currentDurationDays} Days` : "Unlimited"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {t("nextPlan.addRemainingTraffic")}:
                    </Text>
                    <Badge colorScheme={plan?.add_remaining_traffic ? "green" : "gray"}>
                      {plan?.add_remaining_traffic ? "Yes" : "No"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                      {t("nextPlan.fireOnEither")}:
                    </Text>
                    <Badge colorScheme={plan?.fire_on_either ? "purple" : "gray"}>
                      {plan?.fire_on_either ? "Yes" : "No"}
                    </Badge>
                  </HStack>
                </VStack>

                <Alert status="info" size="xs" borderRadius="md" mt={4} py={2}>
                  <AlertIcon />
                  <Text fontSize="2xs">
                    {t("nextPlan.description")}
                  </Text>
                </Alert>

                <Button
                  mt={4}
                  w="full"
                  size="sm"
                  colorScheme="green"
                  leftIcon={<BoltIcon width="16px" height="16px" />}
                  isLoading={isActivating}
                  onClick={handleActivate}
                >
                  {t("nextPlan.activateNow")}
                </Button>
              </Box>
            )}

            {/* Form Mode (Create or Edit) */}
            {(!hasQueuedPlan || isEditingForm) && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="xs" color="gray.500">
                  {t("nextPlan.description")}
                </Text>

                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="xs">
                        {t("nextPlan.dataLimit")}
                      </FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        min="0"
                        step="1"
                        value={dataLimitGB}
                        onChange={(e) => setDataLimitGB(e.target.value)}
                      />
                      <FormHelperText fontSize="2xs">
                        {t("templates.dataLimitHelp")}
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="xs">
                        {t("nextPlan.expireDays")}
                      </FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        min="0"
                        step="1"
                        value={expireDays}
                        onChange={(e) => setExpireDays(e.target.value)}
                      />
                      <FormHelperText fontSize="2xs">
                        {t("templates.expireDurationHelp")}
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Box
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _dark={{ borderColor: "gray.700" }}
                >
                  <VStack align="start" spacing={2}>
                    <Checkbox
                      size="sm"
                      isChecked={addRemainingTraffic}
                      onChange={(e) => setAddRemainingTraffic(e.target.checked)}
                    >
                      <Text fontSize="xs">
                        {t("nextPlan.addRemainingTraffic")}
                      </Text>
                    </Checkbox>
                    <Checkbox
                      size="sm"
                      isChecked={fireOnEither}
                      onChange={(e) => setFireOnEither(e.target.checked)}
                    >
                      <Text fontSize="xs">
                        {t("nextPlan.fireOnEither")}
                      </Text>
                    </Checkbox>
                  </VStack>
                </Box>

                <HStack justify="flex-end" spacing={2} pt={2}>
                  {hasQueuedPlan && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingForm(false)}
                    >
                      {t("cancel")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    colorScheme="primary"
                    isLoading={isSaving}
                    onClick={handleSave}
                  >
                    {t("save")}
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
