import {
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
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useAdminsQuery } from "contexts/AdminsContext";
import { useDashboard } from "contexts/DashboardContext";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { fetch } from "service/http";
import { User } from "types/User";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { Icon } from "./Icon";

type TransferOwnerModalProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onTransferred?: (newOwnerUsername: string) => void;
};

export const TransferOwnerModal: FC<TransferOwnerModalProps> = ({
  user,
  isOpen,
  onClose,
  onTransferred,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { refetchUsers } = useDashboard();
  const { data: admins, isLoading: adminsLoading } = useAdminsQuery(isOpen);

  const [selectedAdmin, setSelectedAdmin] = useState<string>("");

  const currentOwner = user?.admin?.username || "";

  const { isLoading: isTransferring, mutate: onTransfer } = useMutation(
    () =>
      fetch(`/user/${user?.username}/set-owner`, {
        method: "PUT",
        query: { admin_username: selectedAdmin },
      }),
    {
      onSuccess: () => {
        generateSuccessMessage(
          t("userDialog.transferSuccess", {
            username: user?.username,
            admin: selectedAdmin,
          }),
          toast
        );
        refetchUsers();
        onTransferred && onTransferred(selectedAdmin);
        onClose();
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3">
        <ModalHeader pt={6}>
          <Icon color="primary">
            <UserGroupIcon width="20px" height="20px" color="white" />
          </Icon>
        </ModalHeader>
        <ModalCloseButton mt={3} />
        <ModalBody pb={4} pt={2}>
          <Text fontWeight="semibold" fontSize="lg" mb={1}>
            {t("userDialog.transferOwnershipTitle")}
          </Text>
          <Text fontSize="xs" color="gray.500" mb={4}>
            {t("userDialog.transferOwnershipPrompt", { username: user?.username })}
          </Text>

          <VStack spacing={3} align="stretch">
            <Box
              p={3}
              borderRadius="md"
              bg="gray.50"
              _dark={{ bg: "gray.750", borderColor: "gray.600" }}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                  {t("userDialog.currentOwner")}
                </Text>
                <Badge colorScheme="purple">
                  {currentOwner || t("admins.none")}
                </Badge>
              </HStack>
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="xs">{t("userDialog.newOwner")}</FormLabel>
              <Select
                size="sm"
                borderRadius="md"
                placeholder={t("userDialog.selectAdmin")}
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                isDisabled={adminsLoading}
              >
                {admins?.map((admin) => (
                  <option
                    key={admin.username}
                    value={admin.username}
                    disabled={admin.username === currentOwner}
                  >
                    {admin.username} {admin.is_sudo ? `(${t("admins.sudo")})` : ""}
                    {admin.username === currentOwner ? ` - ${t("userDialog.current")}` : ""}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2}>
          <Button size="sm" variant="outline" w="full" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            colorScheme="primary"
            w="full"
            isLoading={isTransferring}
            isDisabled={!selectedAdmin || selectedAdmin === currentOwner}
            onClick={() => onTransfer()}
          >
            {t("userDialog.transferButton")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
