import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
  ModalHeader,
  ModalOverlay,
  Spinner,
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
  PlusIcon as HeroIconPlusIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FetchAdminsQueryKey,
  useAdmins,
  useAdminsQuery,
} from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import useGetUser from "hooks/useGetUser";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import {
  Admin,
  AdminCreate,
  AdminCreateSchema,
  AdminModify,
  AdminModifySchema,
} from "types/Admin";
import { formatBytes } from "utils/formatByte";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { DeleteAdminModal } from "./DeleteAdminModal";
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

const ModalIcon = chakra(UserGroupIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

const PlusIcon = chakra(HeroIconPlusIcon, {
  baseStyle: {
    w: 5,
    h: 5,
    strokeWidth: 2,
  },
});

type AdminAccordionProps = {
  admin: Admin;
  toggleAccordion: () => void;
};

const AdminAccordion: FC<AdminAccordionProps> = ({
  admin,
  toggleAccordion,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { userData } = useGetUser();
  const {
    modifyAdmin,
    setDeletingAdmin,
    resetAdminUsage,
    disableAdminUsers,
    activateAdminUsers,
  } = useAdmins();

  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isCurrentAdmin = userData?.username === admin.username;
  const isAnotherSudo = !isCurrentAdmin && admin.is_sudo;

  const form = useForm<AdminModify>({
    resolver: zodResolver(AdminModifySchema),
    defaultValues: {
      password: "",
      is_sudo: admin.is_sudo,
      telegram_id: admin.telegram_id ?? null,
      discord_webhook: admin.discord_webhook ?? "",
    },
  });

  const { isLoading: isUpdating, mutate: onUpdate } = useMutation(
    (data: AdminModify) => modifyAdmin(admin.username, data),
    {
      onSuccess: () => {
        generateSuccessMessage(
          t("admins.editAdminSuccess", { username: admin.username }),
          toast
        );
        form.setValue("password", "");
        queryClient.invalidateQueries(FetchAdminsQueryKey);
      },
      onError: (e) => {
        generateErrorMessage(e, toast, form);
      },
    }
  );

  const handleResetUsage = async () => {
    if (
      !window.confirm(
        t("admins.resetUsageConfirm", { username: admin.username })
      )
    )
      return;
    setActionLoading("resetUsage");
    try {
      await resetAdminUsage(admin.username);
      generateSuccessMessage(
        t("admins.resetUsageSuccess", { username: admin.username }),
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
        t("admins.disableUsersConfirm", { username: admin.username })
      )
    )
      return;
    setActionLoading("disableUsers");
    try {
      await disableAdminUsers(admin.username);
      generateSuccessMessage(
        t("admins.disableUsersSuccess", { username: admin.username }),
        toast
      );
      useDashboard.getState().refetchUsers();
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUsers = async () => {
    if (
      !window.confirm(
        t("admins.activateUsersConfirm", { username: admin.username })
      )
    )
      return;
    setActionLoading("activateUsers");
    try {
      await activateAdminUsers(admin.username);
      generateSuccessMessage(
        t("admins.activateUsersSuccess", { username: admin.username }),
        toast
      );
      useDashboard.getState().refetchUsers();
    } catch (e) {
      generateErrorMessage(e, toast);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AccordionItem
      border="1px solid"
      _dark={{ borderColor: "gray.600" }}
      _light={{ borderColor: "gray.200" }}
      borderRadius="4px"
      p={1}
      w="full"
    >
      <AccordionButton px={2} borderRadius="3px" onClick={toggleAccordion}>
        <HStack w="full" justifyContent="space-between" pr={2} spacing={2}>
          <HStack spacing={2} overflow="hidden">
            <Text
              as="span"
              fontWeight="medium"
              fontSize="sm"
              textAlign="left"
              color="gray.700"
              _dark={{ color: "gray.300" }}
              isTruncated
            >
              {admin.username}
            </Text>
            {isCurrentAdmin && (
              <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={1.5}>
                {t("admins.you")}
              </Badge>
            )}
          </HStack>

          <HStack spacing={2} flexShrink={0}>
            <Badge
              colorScheme="gray"
              variant="outline"
              fontSize="2xs"
              px={2}
              py={0.5}
            >
              {formatBytes(admin.users_usage || 0)}
            </Badge>

            <Badge
              colorScheme={admin.is_sudo ? "purple" : "blue"}
              rounded="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
            >
              {admin.is_sudo ? t("admins.sudo") : t("admins.regular")}
            </Badge>
          </HStack>
        </HStack>
        <AccordionIcon />
      </AccordionButton>

      <AccordionPanel px={2} pb={3} pt={2}>
        {isAnotherSudo ? (
          <VStack align="stretch" spacing={3}>
            <Text fontSize="xs" color="gray.500">
              {t("admins.cannotEditOtherSudo")}
            </Text>
            <HStack justify="flex-end" spacing={2}>
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
          </VStack>
        ) : (
          <form onSubmit={form.handleSubmit((data) => onUpdate(data))}>
            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel fontSize="xs" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                  {t("admins.newPassword")}
                </FormLabel>
                <InputGroup size="sm">
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
                      size="xs"
                      variant="ghost"
                      aria-label="Toggle password visibility"
                      icon={showPassword ? <EyeSlashIcon width="16px" /> : <EyeIcon width="16px" />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <HStack justify="space-between" pt={1}>
                <VStack align="flex-start" spacing={0}>
                  <FormLabel fontSize="xs" m={0}>
                    {t("admins.sudo")}
                  </FormLabel>
                  <Text fontSize="2xs" color="gray.500">
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

              <HStack spacing={2}>
                <Box flex="1">
                  <CustomInput
                    label={t("admins.telegramId")}
                    size="sm"
                    placeholder="123456789"
                    type="number"
                    {...form.register("telegram_id")}
                    error={form.formState?.errors?.telegram_id?.message}
                  />
                </Box>
                <Box flex="1">
                  <CustomInput
                    label={t("admins.discordWebhook")}
                    size="sm"
                    placeholder="https://discord.com/api/webhooks/..."
                    {...form.register("discord_webhook")}
                    error={form.formState?.errors?.discord_webhook?.message}
                  />
                </Box>
              </HStack>

              <Divider my={1} borderColor="gray.200" _dark={{ borderColor: "gray.600" }} />

              {/* Action Toolbar */}
              <HStack justify="space-between" w="full" pt={1}>
                <HStack spacing={1}>
                  {!admin.is_sudo && (
                    <Tooltip label={t("delete")} placement="top">
                      <IconButton
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        aria-label="delete admin"
                        onClick={() => setDeletingAdmin(admin)}
                        icon={<TrashIcon width="16px" />}
                      />
                    </Tooltip>
                  )}
                  <Tooltip label={t("admins.resetUsage")} placement="top">
                    <IconButton
                      colorScheme="orange"
                      variant="ghost"
                      size="sm"
                      aria-label="reset admin usage"
                      isLoading={actionLoading === "resetUsage"}
                      onClick={handleResetUsage}
                      icon={<ArrowPathIcon width="16px" />}
                    />
                  </Tooltip>
                  <Tooltip label={t("admins.disableUsers")} placement="top">
                    <IconButton
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      aria-label="disable all users"
                      isLoading={actionLoading === "disableUsers"}
                      onClick={handleDisableUsers}
                      icon={<NoSymbolIcon width="16px" />}
                    />
                  </Tooltip>
                  <Tooltip label={t("admins.activateUsers")} placement="top">
                    <IconButton
                      colorScheme="green"
                      variant="ghost"
                      size="sm"
                      aria-label="activate all users"
                      isLoading={actionLoading === "activateUsers"}
                      onClick={handleActivateUsers}
                      icon={<CheckCircleIcon width="16px" />}
                    />
                  </Tooltip>
                </HStack>

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
            </VStack>
          </form>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

type AddAdminFormProps = {
  toggleAccordion: () => void;
  resetAccordions: () => void;
};

const AddAdminForm: FC<AddAdminFormProps> = ({
  toggleAccordion,
  resetAccordions,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { createAdmin } = useAdmins();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminCreate>({
    resolver: zodResolver(AdminCreateSchema),
    defaultValues: {
      username: "",
      password: "",
      is_sudo: false,
      telegram_id: null,
      discord_webhook: "",
    },
  });

  const { isLoading, mutate: onCreate } = useMutation(createAdmin, {
    onSuccess: () => {
      generateSuccessMessage(
        t("admins.addAdminSuccess", { username: form.getValues("username") }),
        toast
      );
      queryClient.invalidateQueries(FetchAdminsQueryKey);
      form.reset();
      resetAccordions();
    },
    onError: (e) => {
      generateErrorMessage(e, toast, form);
    },
  });

  return (
    <AccordionItem
      border="1px solid"
      _dark={{ borderColor: "gray.600" }}
      _light={{ borderColor: "gray.200" }}
      borderRadius="4px"
      p={1}
      w="full"
    >
      <AccordionButton px={2} borderRadius="3px" onClick={toggleAccordion}>
        <Text
          as="span"
          fontWeight="medium"
          fontSize="sm"
          flex="1"
          textAlign="left"
          color="gray.700"
          _dark={{ color: "gray.300" }}
          display="flex"
          alignItems="center"
          gap={1.5}
        >
          <PlusIcon display="inline-block" />
          <span>{t("admins.addNewAdmin")}</span>
        </Text>
      </AccordionButton>
      <AccordionPanel px={2} py={4}>
        <form onSubmit={form.handleSubmit((data) => onCreate(data))}>
          <VStack spacing={3} align="stretch">
            <CustomInput
              label={t("admins.username")}
              size="sm"
              placeholder="admin_username"
              {...form.register("username")}
              error={form.formState?.errors?.username?.message}
            />

            <FormControl isInvalid={!!form.formState?.errors?.password}>
              <FormLabel fontSize="xs" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                {t("admins.password")}
              </FormLabel>
              <InputGroup size="sm">
                <ChakraInput
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                  borderRadius="md"
                  {...form.register("password")}
                />
                <InputRightElement>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Toggle password visibility"
                    icon={showPassword ? <EyeSlashIcon width="16px" /> : <EyeIcon width="16px" />}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <HStack justify="space-between" pt={1}>
              <VStack align="flex-start" spacing={0}>
                <FormLabel fontSize="xs" m={0}>
                  {t("admins.sudo")}
                </FormLabel>
                <Text fontSize="2xs" color="gray.500">
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
                  />
                )}
              />
            </HStack>

            <HStack spacing={2}>
              <Box flex="1">
                <CustomInput
                  label={t("admins.telegramId")}
                  size="sm"
                  placeholder="123456789"
                  type="number"
                  {...form.register("telegram_id")}
                  error={form.formState?.errors?.telegram_id?.message}
                />
              </Box>
              <Box flex="1">
                <CustomInput
                  label={t("admins.discordWebhook")}
                  size="sm"
                  placeholder="https://discord.com/api/webhooks/..."
                  {...form.register("discord_webhook")}
                  error={form.formState?.errors?.discord_webhook?.message}
                />
              </Box>
            </HStack>

            <Button
              type="submit"
              colorScheme="primary"
              size="sm"
              w="full"
              mt={2}
              isLoading={isLoading}
            >
              {t("admins.addAdmin")}
            </Button>
          </VStack>
        </form>
      </AccordionPanel>
    </AccordionItem>
  );
};

export const AdminsDialog: FC = () => {
  const { isManagingAdmins, onManagingAdmins } = useDashboard();
  const { t } = useTranslation();
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const { data: admins, isLoading } = useAdminsQuery();

  const onClose = () => {
    setOpenAccordions({});
    onManagingAdmins(false);
  };

  const toggleAccordion = (index: number | string) => {
    const key = String(index);
    if (openAccordions[key]) {
      delete openAccordions[key];
    } else {
      openAccordions[key] = true;
    }
    setOpenAccordions({ ...openAccordions });
  };

  return (
    <>
      <Modal isOpen={isManagingAdmins} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent mx="3" w="fit-content" maxW="3xl">
          <ModalHeader pt={6}>
            <Icon color="primary">
              <ModalIcon color="white" />
            </Icon>
          </ModalHeader>
          <ModalCloseButton mt={3} />
          <ModalBody w={{ base: "320px", sm: "440px" }} pb={6} pt={3}>
            <Text mb={3} opacity={0.8} fontSize="sm" fontWeight="medium">
              {t("admins.title")}
            </Text>

            {isLoading && (
              <HStack justify="center" py={4}>
                <Spinner size="sm" color="primary.500" />
              </HStack>
            )}

            <Accordion
              w="full"
              allowToggle
              index={Object.keys(openAccordions).map((i) => parseInt(i))}
            >
              <VStack w="full" spacing={2}>
                {!isLoading &&
                  admins &&
                  admins.map((admin, index) => (
                    <AdminAccordion
                      key={admin.username}
                      admin={admin}
                      toggleAccordion={() => toggleAccordion(index)}
                    />
                  ))}

                <AddAdminForm
                  toggleAccordion={() => toggleAccordion((admins || []).length)}
                  resetAccordions={() => setOpenAccordions({})}
                />
              </VStack>
            </Accordion>
          </ModalBody>
        </ModalContent>
      </Modal>
      <DeleteAdminModal />
    </>
  );
};
