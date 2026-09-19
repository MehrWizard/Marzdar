import {
  Box,
  Button,
  chakra,
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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetchAdminsQueryKey, useAdmins } from "contexts/AdminsContext";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import { AdminCreate, AdminCreateSchema } from "types/Admin";
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

const ModalIcon = chakra(UserPlusIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

export const CreateAdminModal: FC = () => {
  const { isCreatingAdmin, setIsCreatingAdmin, createAdmin } = useAdmins();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
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

  const onClose = () => {
    form.reset();
    setIsCreatingAdmin(false);
  };

  const { isLoading, mutate: onCreate } = useMutation(createAdmin, {
    onSuccess: () => {
      generateSuccessMessage(
        t("admins.addAdminSuccess", { username: form.getValues("username") }),
        toast
      );
      queryClient.invalidateQueries(FetchAdminsQueryKey);
      onClose();
    },
    onError: (e) => {
      generateErrorMessage(e, toast, form);
    },
  });

  return (
    <Modal isOpen={isCreatingAdmin} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(8px)" />
      <ModalContent mx={3}>
        <ModalHeader display="flex" alignItems="center" gap={3} pt={5}>
          <Icon color="primary">
            <ModalIcon color="white" />
          </Icon>
          <Box>
            <Text fontSize="lg" fontWeight="semibold">
              {t("admins.addNewAdmin")}
            </Text>
            <Text fontSize="xs" color="gray.500" fontWeight="normal">
              {t("admins.createAdminSubtitle", "Create a new administrator or reseller account")}
            </Text>
          </Box>
        </ModalHeader>
        <ModalCloseButton mt={3} />

        <form onSubmit={form.handleSubmit((data) => onCreate(data))}>
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <CustomInput
                label={t("admins.username")}
                placeholder="admin_username"
                {...form.register("username")}
                error={form.formState?.errors?.username?.message}
                autoFocus
              />

              <FormControl isInvalid={!!form.formState?.errors?.password}>
                <FormLabel fontSize="xs" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                  {t("admins.password")}
                </FormLabel>
                <InputGroup size="md">
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
                      size="sm"
                      variant="ghost"
                      aria-label="Toggle password visibility"
                      icon={showPassword ? <EyeSlashIcon width="18px" /> : <EyeIcon width="18px" />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                {form.formState?.errors?.password && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {form.formState.errors.password.message}
                  </Text>
                )}
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
            </VStack>
          </ModalBody>

          <ModalFooter gap={2} pt={2} pb={5}>
            <Button variant="ghost" onClick={onClose} size="sm">
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              colorScheme="primary"
              size="sm"
              px={6}
              isLoading={isLoading}
            >
              {t("admins.addAdmin")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
