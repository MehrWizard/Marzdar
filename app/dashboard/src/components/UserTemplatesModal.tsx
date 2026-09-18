import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  DocumentDuplicateIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import {
  FetchUserTemplatesQueryKey,
  useUserTemplates,
  useUserTemplatesQuery,
} from "contexts/UserTemplatesContext";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import { UserInbounds } from "types/User";
import {
  UserTemplate,
  UserTemplateCreate,
} from "types/UserTemplate";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { Icon } from "./Icon";

export const UserTemplatesModal: FC = () => {
  const { isManagingTemplates, onManagingTemplates, inbounds: systemInbounds } =
    useDashboard();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useUserTemplatesQuery(
    isManagingTemplates
  );
  const { createTemplate, modifyTemplate, deleteTemplate } =
    useUserTemplates();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserTemplate | null>(
    null
  );

  // Form State
  const [formName, setFormName] = useState("");
  const [formDataLimitGB, setFormDataLimitGB] = useState<string>("0");
  const [formDurationDays, setFormDurationDays] = useState<string>("30");
  const [formPrefix, setFormPrefix] = useState("");
  const [formSuffix, setFormSuffix] = useState("");
  const [selectedInbounds, setSelectedInbounds] = useState<UserInbounds>({});

  const availableProtocols = useMemo(() => {
    return Array.from(systemInbounds.entries());
  }, [systemInbounds]);

  const resetForm = () => {
    setFormName("");
    setFormDataLimitGB("0");
    setFormDurationDays("30");
    setFormPrefix("");
    setFormSuffix("");
    setSelectedInbounds({});
    setEditingTemplate(null);
    setIsFormOpen(false);
  };

  const startCreate = () => {
    resetForm();
    // Default to all inbounds selected
    const allIns: UserInbounds = {};
    systemInbounds.forEach((items, proto) => {
      allIns[proto] = items.map((i) => i.tag);
    });
    setSelectedInbounds(allIns);
    setIsFormOpen(true);
  };

  const startEdit = (template: UserTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDataLimitGB(
      template.data_limit
        ? String(
            Math.round((template.data_limit / 1073741824) * 100) / 100
          )
        : "0"
    );
    setFormDurationDays(
      template.expire_duration
        ? String(Math.round(template.expire_duration / 86400))
        : "0"
    );
    setFormPrefix(template.username_prefix || "");
    setFormSuffix(template.username_suffix || "");
    setSelectedInbounds(template.inbounds || {});
    setIsFormOpen(true);
  };

  const { isLoading: isSaving, mutate: saveTemplate } = useMutation(
    async () => {
      if (!formName.trim()) {
        throw new Error("Template name is required");
      }

      const dataLimitBytes =
        Number(formDataLimitGB) > 0
          ? Math.round(Number(formDataLimitGB) * 1073741824)
          : 0;
      const expireDurationSeconds =
        Number(formDurationDays) > 0
          ? Math.round(Number(formDurationDays) * 86400)
          : 0;

      const payload: UserTemplateCreate = {
        name: formName.trim(),
        data_limit: dataLimitBytes,
        expire_duration: expireDurationSeconds,
        username_prefix: formPrefix.trim() ? formPrefix.trim() : null,
        username_suffix: formSuffix.trim() ? formSuffix.trim() : null,
        inbounds: selectedInbounds,
      };

      if (editingTemplate) {
        return modifyTemplate(editingTemplate.id, payload);
      } else {
        return createTemplate(payload);
      }
    },
    {
      onSuccess: (saved) => {
        generateSuccessMessage(
          t(
            editingTemplate
              ? "templates.editSuccess"
              : "templates.createSuccess",
            { name: saved.name }
          ),
          toast
        );
        queryClient.invalidateQueries(FetchUserTemplatesQueryKey);
        resetForm();
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  const { mutate: removeTemplate } = useMutation(
    (template: UserTemplate) => deleteTemplate(template.id),
    {
      onSuccess: () => {
        generateSuccessMessage(t("templates.deleteSuccess"), toast);
        queryClient.invalidateQueries(FetchUserTemplatesQueryKey);
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  const handleDelete = (template: UserTemplate) => {
    if (window.confirm(t("templates.deleteConfirm", { name: template.name }))) {
      removeTemplate(template);
    }
  };

  const toggleInbound = (protocol: string, tag: string) => {
    setSelectedInbounds((prev) => {
      const current = prev[protocol] ? [...prev[protocol]] : [];
      const index = current.indexOf(tag);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(tag);
      }
      return {
        ...prev,
        [protocol]: current,
      };
    });
  };

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    if (!search.trim()) return templates;
    return templates.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [templates, search]);

  const onClose = () => {
    resetForm();
    onManagingTemplates(false);
  };

  return (
    <Modal
      isOpen={isManagingTemplates}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3" maxH="85vh">
        <ModalHeader pt={6}>
          <HStack justify="space-between" align="center" pr={6}>
            <HStack spacing={3}>
              <Icon color="blue">
                <DocumentDuplicateIcon
                  width="20px"
                  height="20px"
                  color="white"
                />
              </Icon>
              <Box>
                <Text fontWeight="semibold" fontSize="lg">
                  {t("templates.title")}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  {t("templates.description")}
                </Text>
              </Box>
            </HStack>
            {!isFormOpen && (
              <Button
                size="sm"
                colorScheme="primary"
                leftIcon={<PlusIcon width="16px" height="16px" />}
                onClick={startCreate}
              >
                {t("templates.createTemplate")}
              </Button>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={3} />

        <ModalBody pb={4} pt={2}>
          <VStack spacing={4} align="stretch">
            {/* Create / Edit Form Collapse */}
            <Collapse in={isFormOpen} animateOpacity>
              <Box
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="primary.300"
                bg="primary.50"
                _dark={{
                  borderColor: "primary.700",
                  bg: "gray.750",
                }}
                mb={2}
              >
                <Text fontWeight="bold" fontSize="sm" mb={3}>
                  {editingTemplate
                    ? t("templates.editTemplate")
                    : t("templates.createTemplate")}
                </Text>

                <VStack spacing={3} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs">{t("templates.name")}</FormLabel>
                    <Input
                      size="sm"
                      value={formName}
                      placeholder="e.g. 1 Month - 50GB"
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </FormControl>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs">
                          {t("templates.dataLimit")}
                        </FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          min="0"
                          step="1"
                          value={formDataLimitGB}
                          onChange={(e) => setFormDataLimitGB(e.target.value)}
                        />
                        <FormHelperText fontSize="2xs">
                          {t("templates.dataLimitHelp")}
                        </FormHelperText>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs">
                          {t("templates.expireDuration")}
                        </FormLabel>
                        <Input
                          size="sm"
                          type="number"
                          min="0"
                          step="1"
                          value={formDurationDays}
                          onChange={(e) => setFormDurationDays(e.target.value)}
                        />
                        <FormHelperText fontSize="2xs">
                          {t("templates.expireDurationHelp")}
                        </FormHelperText>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs">
                          {t("templates.usernamePrefix")}
                        </FormLabel>
                        <Input
                          size="sm"
                          placeholder="e.g. vpn_"
                          value={formPrefix}
                          onChange={(e) => setFormPrefix(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs">
                          {t("templates.usernameSuffix")}
                        </FormLabel>
                        <Input
                          size="sm"
                          placeholder="e.g. _usr"
                          value={formSuffix}
                          onChange={(e) => setFormSuffix(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Inbounds selector */}
                  {availableProtocols.length > 0 && (
                    <FormControl>
                      <FormLabel fontSize="xs">
                        {t("templates.inbounds")}
                      </FormLabel>
                      <Box
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        _dark={{ borderColor: "gray.600" }}
                        maxH="160px"
                        overflowY="auto"
                      >
                        <VStack align="stretch" spacing={3}>
                          {availableProtocols.map(([proto, items]) => (
                            <Box key={proto}>
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                                color="primary.500"
                                mb={1}
                              >
                                {proto}
                              </Text>
                              <Wrap spacing={2}>
                                {items.map((inb) => {
                                  const isChecked =
                                    selectedInbounds[proto]?.includes(
                                      inb.tag
                                    ) ?? false;
                                  return (
                                    <Checkbox
                                      key={inb.tag}
                                      size="sm"
                                      isChecked={isChecked}
                                      onChange={() =>
                                        toggleInbound(proto, inb.tag)
                                      }
                                    >
                                      <Text fontSize="xs">{inb.tag}</Text>
                                    </Checkbox>
                                  );
                                })}
                              </Wrap>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </FormControl>
                  )}

                  <HStack justify="flex-end" spacing={2} pt={2}>
                    <Button size="sm" variant="ghost" onClick={resetForm}>
                      {t("cancel")}
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="primary"
                      isLoading={isSaving}
                      onClick={() => saveTemplate()}
                    >
                      {editingTemplate ? t("save") : t("create")}
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>

            {/* Template List Search */}
            {!isFormOpen && templates && templates.length > 3 && (
              <Input
                size="sm"
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}

            {/* Template List */}
            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : filteredTemplates.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {filteredTemplates.map((template) => {
                  const dataLimitGB = template.data_limit
                    ? Math.round(
                        (template.data_limit / 1073741824) * 100
                      ) / 100
                    : null;
                  const durationDays = template.expire_duration
                    ? Math.round(template.expire_duration / 86400)
                    : null;

                  return (
                    <Box
                      key={template.id}
                      p={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                      _dark={{
                        borderColor: "gray.700",
                        bg: "gray.800",
                      }}
                      bg="white"
                    >
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1.5}>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {template.name}
                            </Text>
                            {template.username_prefix && (
                              <Badge size="sm" variant="subtle" colorScheme="purple">
                                {template.username_prefix}*
                              </Badge>
                            )}
                            {template.username_suffix && (
                              <Badge size="sm" variant="subtle" colorScheme="purple">
                                *{template.username_suffix}
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing={2} wrap="wrap">
                            <Badge
                              colorScheme={dataLimitGB ? "blue" : "gray"}
                              fontSize="xs"
                            >
                              {dataLimitGB ? `${dataLimitGB} GB` : "Unlimited Data"}
                            </Badge>
                            <Badge
                              colorScheme={durationDays ? "green" : "gray"}
                              fontSize="xs"
                            >
                              {durationDays ? `${durationDays} Days` : "Unlimited Duration"}
                            </Badge>
                          </HStack>
                        </VStack>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit template"
                            size="sm"
                            variant="ghost"
                            icon={<PencilSquareIcon width="16px" height="16px" />}
                            onClick={() => startEdit(template)}
                          />
                          <IconButton
                            aria-label="Delete template"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            icon={<TrashIcon width="16px" height="16px" />}
                            onClick={() => handleDelete(template)}
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              !isFormOpen && (
                <Box textAlign="center" py={8} color="gray.500">
                  <Text fontSize="sm">{t("templates.noTemplates")}</Text>
                  <Button
                    size="sm"
                    colorScheme="primary"
                    variant="outline"
                    mt={3}
                    leftIcon={<PlusIcon width="14px" height="14px" />}
                    onClick={startCreate}
                  >
                    {t("templates.createTemplate")}
                  </Button>
                </Box>
              )
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
