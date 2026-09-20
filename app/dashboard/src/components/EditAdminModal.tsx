import {
  Badge,
  Box,
  Button,
  chakra,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input as ChakraInput,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetchAdminsQueryKey, useAdmins } from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import useGetUser from "hooks/useGetUser";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import { AdminModify, AdminModifySchema } from "types/Admin";
import { formatBytes } from "utils/formatByte";
import { generateErrorMessage, generateSuccessMessage } from "utils/toastHandler";
import { Icon } from "./Icon";
import { Input } from "./Input";

const CustomInput = chakra(Input, {
  baseStyle: {
    bg: "white",
    _dark: {
      bg: "gray.700",
    },
  },
});

const ModalIcon = chakra(PencilSquareIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

export const EditAdminModal: FC = () => {
  const {
    editingAdmin,
    setEditingAdmin,
    modifyAdmin,
    setDeletingAdmin,
    resetAdminUsage,
    disableAdminUsers,
    activateAdminUsers,
  } = useAdmins();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { userData } = useGetUser();

  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isCurrentAdmin = userData?.username === editingAdmin?.username;
  const isAnotherSudo = !isCurrentAdmin && !!editingAdmin?.is_sudo;

  const form = useForm<AdminModify>({
    resolver: zodResolver(AdminModifySchema),
    defaultValues: {
      password: "",
      is_sudo: editingAdmin?.is_sudo ?? false,
      telegram_id: editingAdmin?.telegram_id ?? null,
      discord_webhook: editingAdmin?.discord_webhook ?? "",
    },
  });

  useEffect(() => {
    if (editingAdmin) {
      form.reset({
        password: "",
        is_sudo: editingAdmin.is_sudo,
        telegram_id: editingAdmin.telegram_id ?? null,
        discord_webhook: editingAdmin.discord_webhook ?? "",
      });
    }
  }, [editingAdmin, form]);

  const onClose = () => {
    form.reset();
    setEditingAdmin(null);
  };

  const { isLoading: isUpdating, mutate: onUpdate } = useMutation(
    (data: AdminModify) => {
      if (!editingAdmin) throw new Error("No admin selected");
      return modifyAdmin(editingAdmin.username, data);
    },
    {
      onSuccess: () => {
        generateSuccessMessage(
          t("admins.editAdminSuccess", { username: editingAdmin?.username }),
          toast
        );
        form.setValue("password", "");
        queryClient.invalidateQueries(FetchAdminsQueryKey);
        onClose();
      },
      onError: (e) => {
        generateErrorMessage(e, toast, form);
      },
    }
  );

  if (!editingAdmin) return null;

  const handleResetUsage = async () => {
    if (
      !window.confirm(
        t("admins.resetUsageConfirm", { username: editingAdmin.username })
      )
    )
      return;
    setActionLoading("resetUsage");
    try {
      await resetAdminUsage(editingAdmin.username);
      generateSuccessMessage(
        t("admins.resetUsageSuccess", { username: editingAdmin.username }),
        toast
      );
      queryClient.invalidateQueries(FetchAdminsQueryKey);
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisableUsers = async () => {
    if (
      !window.confirm(
        t("admins.disableUsersConfirm", { username: editingAdmin.username })
      )
    )
      return;
    setActionLoading("disableUsers");
    try {
      await disableAdminUsers(editingAdmin.username);
      generateSuccessMessage(
        t("admins.disableUsersSuccess", { username: editingAdmin.username }),
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

  const handleActivateUsers = async () => {
    if (
      !window.confirm(
        t("admins.activateUsersConfirm", { username: editingAdmin.username })
      )
    )
      return;
    setActionLoading("activateUsers");
    try {
      await activateAdminUsers(editingAdmin.username);
      generateSuccessMessage(
        t("admins.activateUsersSuccess", { username: editingAdmin.username }),
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

  return (
    <Modal isOpen={!!editingAdmin} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(8px)" />
      <ModalContent mx={3}>
        <ModalHeader display="flex" alignItems="center" gap={3} pt={5}>
          <Icon color="primary">
            <ModalIcon color="white" />
          </Icon>
          <Box>
            <HStack spacing={2} align="center">
              <Text fontSize="lg" fontWeight="semibold">
                {editingAdmin.username}
              </Text>
              {isCurrentAdmin && (
                <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                  {t("admins.you")}
                </Badge>
              )}
              <Badge
                colorScheme={editingAdmin.is_sudo ? "purple" : "blue"}
                rounded="full"
                px={2}
                fontSize="2xs"
              >
                {editingAdmin.is_sudo ? t("admins.sudo") : t("admins.regular")}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" fontWeight="normal">
              {t("admins.usersUsage")}: {formatBytes(editingAdmin.users_usage || 0)}
              {editingAdmin.users_count !== undefined && (
                <> • {editingAdmin.users_count} {t("users")}</>
              )}
            </Text>
          </Box>
        </ModalHeader>
        <ModalCloseButton mt={3} />

        {isAnotherSudo ? (
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                {t("admins.cannotEditOtherSudo")}
              </Text>
              <Divider borderColor="light-border" _dark={{ borderColor: "gray.700" }} />
              <HStack justify="space-between" spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="orange"
                  onClick={handleResetUsage}
                  isLoading={actionLoading === "resetUsage"}
                  leftIcon={<ArrowPathIcon width="16px" />}
                >
                  {t("admins.resetUsage")}
                </Button>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={handleDisableUsers}
                    isLoading={actionLoading === "disableUsers"}
                    leftIcon={<NoSymbolIcon width="16px" />}
                  >
                    {t("admins.disableUsers")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="green"
                    onClick={handleActivateUsers}
                    isLoading={actionLoading === "activateUsers"}
                    leftIcon={<CheckCircleIcon width="16px" />}
                  >
                    {t("admins.activateUsers")}
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </ModalBody>
        ) : (
          <form onSubmit={form.handleSubmit((data) => onUpdate(data))}>
            <ModalBody py={4}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                    {t("admins.newPassword")}
                  </FormLabel>
                  <InputGroup size="md">
                    <ChakraInput
                      type={showPassword ? "text" : "password"}
                      placeholder={t("admins.newPasswordPlaceholder")}
                      bg="white"
                      _dark={{ bg: "gray.700" }}
                      borderRadius="md"
                      {...form.register("password")}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Toggle password visibility"
                        icon={showPassword ? <EyeSlashIcon width="18px" /> : <EyeIcon width="18px" />}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <HStack
                  justify="space-between"
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="light-border"
                  _dark={{ borderColor: "gray.700", bg: "whiteAlpha.50" }}
                >
                  <VStack align="flex-start" spacing={0}>
                    <FormLabel fontSize="sm" m={0} fontWeight="medium">
                      {t("admins.sudo")}
                    </FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      {t("admins.sudoHelp")}
                    </Text>
                  </VStack>
                  <Controller
                    name="is_sudo"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        colorScheme="primary"
                        isChecked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        isDisabled={isCurrentAdmin}
                      />
                    )}
                  />
                </HStack>

                <HStack spacing={3} align="flex-start">
                  <Box flex="1">
                    <CustomInput
                      label={t("admins.telegramId")}
                      placeholder="123456789"
                      type="number"
                      {...form.register("telegram_id")}
                      error={form.formState?.errors?.telegram_id?.message}
                    />
                  </Box>
                  <Box flex="1">
                    <CustomInput
                      label={t("admins.discordWebhook")}
                      placeholder="https://discord.com/api/webhooks/..."
                      {...form.register("discord_webhook")}
                      error={form.formState?.errors?.discord_webhook?.message}
                    />
                  </Box>
                </HStack>

                <Divider borderColor="light-border" _dark={{ borderColor: "gray.700" }} my={1} />

                {/* Management Actions */}
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>
                    {t("admins.quickActions", "Quick Actions")}
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="orange"
                      onClick={handleResetUsage}
                      isLoading={actionLoading === "resetUsage"}
                      leftIcon={<ArrowPathIcon width="14px" />}
                    >
                      {t("admins.resetUsage")}
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="red"
                      onClick={handleDisableUsers}
                      isLoading={actionLoading === "disableUsers"}
                      leftIcon={<NoSymbolIcon width="14px" />}
                    >
                      {t("admins.disableUsers")}
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="green"
                      onClick={handleActivateUsers}
                      isLoading={actionLoading === "activateUsers"}
                      leftIcon={<CheckCircleIcon width="14px" />}
                    >
                      {t("admins.activateUsers")}
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter justifyContent="space-between" pt={2} pb={5}>
              <Box>
                {!editingAdmin.is_sudo && (
                  <Tooltip label={t("deleteAdmin.title", "Delete Admin")} placement="top">
                    <Button
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      leftIcon={<TrashIcon width="16px" />}
                      onClick={() => {
                        const adminToDelete = editingAdmin;
                        onClose();
                        setDeletingAdmin(adminToDelete);
                      }}
                    >
                      {t("delete")}
                    </Button>
                  </Tooltip>
                )}
              </Box>
              <HStack spacing={2}>
                <Button variant="ghost" onClick={onClose} size="sm">
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  colorScheme="primary"
                  size="sm"
                  px={6}
                  isLoading={isUpdating}
                >
                  {t("admins.editAdmin")}
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
