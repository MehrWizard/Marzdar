import {
  Button,
  FormControl,
  FormLabel,
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
  VStack,
} from "@chakra-ui/react";
import { useAdminsQuery } from "contexts/AdminsContext";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type FilterAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin?: string;
  onSelectAdmin: (admin?: string) => void;
};

export const FilterAdminModal: FC<FilterAdminModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onSelectAdmin,
}) => {
  const { t } = useTranslation();
  const { data: admins, isLoading: adminsLoading } = useAdminsQuery(isOpen);
  const [selectedAdmin, setSelectedAdmin] = useState<string>(currentAdmin || "");

  useEffect(() => {
    setSelectedAdmin(currentAdmin || "");
  }, [currentAdmin, isOpen]);

  const handleApply = () => {
    onSelectAdmin(selectedAdmin || undefined);
    onClose();
  };

  const handleClear = () => {
    setSelectedAdmin("");
    onSelectAdmin(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="12px">
        <ModalHeader fontSize="md" fontWeight="bold">
          {t("filters.filterByAdmin")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={2}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.600" _dark={{ color: "gray.300" }}>
                {t("filters.admin")}
              </FormLabel>
              {adminsLoading ? (
                <Spinner size="sm" />
              ) : (
                <Select
                  size="md"
                  borderRadius="md"
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                >
                  <option value="">{t("all")}</option>
                  {admins?.map((admin) => (
                    <option key={admin.username} value={admin.username}>
                      {admin.username} {admin.is_sudo ? `(${t("admins.sudo")})` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter mt={2} gap={2} justifyContent="space-between">
          {currentAdmin ? (
            <Button size="sm" variant="ghost" colorScheme="red" onClick={handleClear}>
              {t("clear")}
            </Button>
          ) : (
            <div />
          )}
          <Button size="sm" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button size="sm" colorScheme="primary" onClick={handleApply}>
            {t("apply")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
