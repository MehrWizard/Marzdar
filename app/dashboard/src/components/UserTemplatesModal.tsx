import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Tooltip,
  useToast,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  DocumentDuplicateIcon,
  PlusIcon as HeroIconPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import {
  FetchUserTemplatesQueryKey,
  useUserTemplates,
  useUserTemplatesQuery,
} from "contexts/UserTemplatesContext";
import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import { UserInbounds } from "types/User";
import { UserTemplate } from "types/UserTemplate";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "utils/toastHandler";
import { Icon } from "./Icon";
import { Input } from "./Input";

type TemplateAccordionProps = {
  template: UserTemplate;
  toggleAccordion: () => void;
};

const TemplateAccordion: FC<TemplateAccordionProps> = ({
  template,
  toggleAccordion,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { modifyTemplate, deleteTemplate } = useUserTemplates();
  const { inbounds: systemInbounds } = useDashboard();

  const [formName, setFormName] = useState(template.name);
  const [formDataLimitGB, setFormDataLimitGB] = useState(
    template.data_limit
      ? String(Math.round((template.data_limit / 1073741824) * 100) / 100)
      : "0"
  );
  const [formDurationDays, setFormDurationDays] = useState(
    template.expire_duration
      ? String(Math.round(template.expire_duration / 86400))
      : "0"
  );
  const [formPrefix, setFormPrefix] = useState(template.username_prefix || "");
  const [formSuffix, setFormSuffix] = useState(template.username_suffix || "");
  const [selectedInbounds, setSelectedInbounds] = useState<UserInbounds>(
    template.inbounds || {}
  );

  const availableProtocols = useMemo(() => {
    return Array.from(systemInbounds.entries());
  }, [systemInbounds]);

  const { isLoading: isUpdating, mutate: onUpdate } = useMutation(
    async () => {
      const dataLimitBytes =
        Number(formDataLimitGB) > 0
          ? Math.round(Number(formDataLimitGB) * 1073741824)
          : 0;
      const expireDurationSeconds =
        Number(formDurationDays) > 0
          ? Math.round(Number(formDurationDays) * 86400)
          : 0;

      return modifyTemplate(template.id, {
        name: formName.trim(),
        data_limit: dataLimitBytes,
        expire_duration: expireDurationSeconds,
        username_prefix: formPrefix.trim() || null,
        username_suffix: formSuffix.trim() || null,
        inbounds: selectedInbounds,
      });
    },
    {
      onSuccess: () => {
        generateSuccessMessage(
          t("templates.editSuccess", { name: formName }),
          toast
        );
        queryClient.invalidateQueries(FetchUserTemplatesQueryKey);
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  const { isLoading: isDeleting, mutate: onDelete } = useMutation(
    () => deleteTemplate(template.id),
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

  const toggleInbound = (protocol: string, tag: string) => {
    setSelectedInbounds((prev) => {
      const current = prev[protocol] ? [...prev[protocol]] : [];
      const index = current.indexOf(tag);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(tag);
      }
      return { ...prev, [protocol]: current };
    });
  };

  const dataLimitGB = template.data_limit
    ? Math.round((template.data_limit / 1073741824) * 100) / 100
    : null;
  const durationDays = template.expire_duration
    ? Math.round(template.expire_duration / 86400)
    : null;

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
        <HStack justify="space-between" w="full" pr={1}>
          <HStack spacing={2} align="center">
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color="gray.800"
              _dark={{ color: "gray.200" }}
            >
              {template.name}
            </Text>
            {template.username_prefix && (
              <Badge size="xs" variant="subtle" colorScheme="purple">
                {template.username_prefix}*
              </Badge>
            )}
            {template.username_suffix && (
              <Badge size="xs" variant="subtle" colorScheme="purple">
                *{template.username_suffix}
              </Badge>
            )}
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme={dataLimitGB ? "blue" : "gray"} fontSize="2xs">
              {dataLimitGB ? `${dataLimitGB} GB` : "∞"}
            </Badge>
            <Badge colorScheme={durationDays ? "green" : "gray"} fontSize="2xs">
              {durationDays ? `${durationDays}d` : "∞"}
            </Badge>
            <AccordionIcon />
          </HStack>
        </HStack>
      </AccordionButton>
      <AccordionPanel px={2} py={3}>
        <VStack spacing={3} align="stretch">
          <Input
            size="sm"
            label={t("templates.name")}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <HStack spacing={2}>
            <Box flex="1">
              <Input
                size="sm"
                type="number"
                min="0"
                step={1}
                endAdornment="GB"
                label={t("templates.dataLimit")}
                value={formDataLimitGB}
                onChange={(e) => setFormDataLimitGB(e.target.value)}
              />
            </Box>
            <Box flex="1">
              <Input
                size="sm"
                type="number"
                min="0"
                step={1}
                endAdornment="d"
                label={t("templates.expireDuration")}
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(e.target.value)}
              />
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Box flex="1">
              <Input
                size="sm"
                placeholder="prefix_"
                label={t("templates.usernamePrefix")}
                value={formPrefix}
                onChange={(e) => setFormPrefix(e.target.value)}
              />
            </Box>
            <Box flex="1">
              <Input
                size="sm"
                placeholder="_suffix"
                label={t("templates.usernameSuffix")}
                value={formSuffix}
                onChange={(e) => setFormSuffix(e.target.value)}
              />
            </Box>
          </HStack>

          {availableProtocols.length > 0 && (
            <Box>
              <Text
                fontSize="2xs"
                fontWeight="semibold"
                color="gray.500"
                mb={1}
              >
                {t("templates.inbounds")}
              </Text>
              <Box
                p={2.5}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.600" }}
                maxH="120px"
                overflowY="auto"
              >
                <VStack align="stretch" spacing={2}>
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
                        {items.map((inb) => (
                          <Checkbox
                            key={inb.tag}
                            size="sm"
                            isChecked={
                              selectedInbounds[proto]?.includes(inb.tag) ??
                              false
                            }
                            onChange={() => toggleInbound(proto, inb.tag)}
                          >
                            <Text fontSize="2xs">{inb.tag}</Text>
                          </Checkbox>
                        ))}
                      </Wrap>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          )}

          <Divider
            my={1}
            borderColor="gray.200"
            _dark={{ borderColor: "gray.600" }}
          />

          <HStack justify="space-between" w="full" pt={1}>
            <Tooltip label={t("delete")} placement="top">
              <IconButton
                colorScheme="red"
                variant="ghost"
                size="sm"
                aria-label="delete template"
                isLoading={isDeleting}
                onClick={() => {
                  if (
                    window.confirm(
                      t("templates.deleteConfirm", { name: template.name })
                    )
                  ) {
                    onDelete();
                  }
                }}
                icon={<TrashIcon width="16px" />}
              />
            </Tooltip>

            <Button
              colorScheme="primary"
              size="sm"
              px={6}
              isLoading={isUpdating}
              onClick={() => onUpdate()}
            >
              {t("save")}
            </Button>
          </HStack>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

type AddTemplateFormProps = {
  toggleAccordion: () => void;
  resetAccordions: () => void;
};

const AddTemplateForm: FC<AddTemplateFormProps> = ({
  toggleAccordion,
  resetAccordions,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { createTemplate } = useUserTemplates();
  const { inbounds: systemInbounds } = useDashboard();

  const [name, setName] = useState("");
  const [dataLimitGB, setDataLimitGB] = useState("0");
  const [expireDurationDays, setExpireDurationDays] = useState("30");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [selectedInbounds, setSelectedInbounds] = useState<UserInbounds>({});

  const availableProtocols = useMemo(() => {
    return Array.from(systemInbounds.entries());
  }, [systemInbounds]);

  useEffect(() => {
    const allIns: UserInbounds = {};
    systemInbounds.forEach((items, proto) => {
      allIns[proto] = items.map((i) => i.tag);
    });
    setSelectedInbounds(allIns);
  }, [systemInbounds]);

  const { isLoading, mutate: onCreate } = useMutation(
    async () => {
      if (!name.trim()) {
        throw new Error("Template name is required");
      }
      const dataLimitBytes =
        Number(dataLimitGB) > 0
          ? Math.round(Number(dataLimitGB) * 1073741824)
          : 0;
      const expireDurationSeconds =
        Number(expireDurationDays) > 0
          ? Math.round(Number(expireDurationDays) * 86400)
          : 0;

      return createTemplate({
        name: name.trim(),
        data_limit: dataLimitBytes,
        expire_duration: expireDurationSeconds,
        username_prefix: prefix.trim() || null,
        username_suffix: suffix.trim() || null,
        inbounds: selectedInbounds,
      });
    },
    {
      onSuccess: (created) => {
        generateSuccessMessage(
          t("templates.createSuccess", { name: created.name }),
          toast
        );
        queryClient.invalidateQueries(FetchUserTemplatesQueryKey);
        setName("");
        setDataLimitGB("0");
        setExpireDurationDays("30");
        setPrefix("");
        setSuffix("");
        resetAccordions();
      },
      onError: (e) => {
        generateErrorMessage(e, toast);
      },
    }
  );

  const toggleInbound = (protocol: string, tag: string) => {
    setSelectedInbounds((prev) => {
      const current = prev[protocol] ? [...prev[protocol]] : [];
      const index = current.indexOf(tag);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(tag);
      }
      return { ...prev, [protocol]: current };
    });
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
          <HeroIconPlusIcon width="16px" height="16px" />
          <span>{t("templates.createTemplate")}</span>
        </Text>
      </AccordionButton>
      <AccordionPanel px={2} py={3}>
        <VStack spacing={3} align="stretch">
          <Input
            size="sm"
            label={t("templates.name")}
            placeholder="e.g. 1 Month - 50GB"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <HStack spacing={2}>
            <Box flex="1">
              <Input
                size="sm"
                type="number"
                min="0"
                step={1}
                endAdornment="GB"
                label={t("templates.dataLimit")}
                value={dataLimitGB}
                onChange={(e) => setDataLimitGB(e.target.value)}
              />
            </Box>
            <Box flex="1">
              <Input
                size="sm"
                type="number"
                min="0"
                step={1}
                endAdornment="d"
                label={t("templates.expireDuration")}
                value={expireDurationDays}
                onChange={(e) => setExpireDurationDays(e.target.value)}
              />
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Box flex="1">
              <Input
                size="sm"
                placeholder="prefix_"
                label={t("templates.usernamePrefix")}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </Box>
            <Box flex="1">
              <Input
                size="sm"
                placeholder="_suffix"
                label={t("templates.usernameSuffix")}
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
            </Box>
          </HStack>

          {availableProtocols.length > 0 && (
            <Box>
              <Text
                fontSize="2xs"
                fontWeight="semibold"
                color="gray.500"
                mb={1}
              >
                {t("templates.inbounds")}
              </Text>
              <Box
                p={2.5}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.600" }}
                maxH="120px"
                overflowY="auto"
              >
                <VStack align="stretch" spacing={2}>
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
                        {items.map((inb) => (
                          <Checkbox
                            key={inb.tag}
                            size="sm"
                            isChecked={
                              selectedInbounds[proto]?.includes(inb.tag) ??
                              false
                            }
                            onChange={() => toggleInbound(proto, inb.tag)}
                          >
                            <Text fontSize="2xs">{inb.tag}</Text>
                          </Checkbox>
                        ))}
                      </Wrap>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          )}

          <Button
            colorScheme="primary"
            size="sm"
            w="full"
            mt={2}
            isLoading={isLoading}
            onClick={() => onCreate()}
          >
            {t("templates.createTemplate")}
          </Button>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

export const UserTemplatesModal: FC = () => {
  const { isManagingTemplates, onManagingTemplates } = useDashboard();
  const { t } = useTranslation();
  const [openAccordions, setOpenAccordions] = useState<
    Record<string, boolean>
  >({});
  const { data: templates, isLoading } = useUserTemplatesQuery();

  const onClose = () => {
    setOpenAccordions({});
    onManagingTemplates(false);
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

  useEffect(() => {
    if (isManagingTemplates && templates && templates.length === 0) {
      setOpenAccordions({ "0": true });
    }
  }, [isManagingTemplates, templates]);

  return (
    <Modal isOpen={isManagingTemplates} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3" w="fit-content" maxW="3xl">
        <ModalHeader pt={6}>
          <Icon color="primary">
            <DocumentDuplicateIcon
              width="20px"
              height="20px"
              color="white"
            />
          </Icon>
        </ModalHeader>
        <ModalCloseButton mt={3} />
        <ModalBody w={{ base: "320px", sm: "460px" }} pb={6} pt={3}>
          <Text mb={1} fontSize="lg" fontWeight="semibold">
            {t("templates.title")}
          </Text>
          <Text mb={4} opacity={0.8} fontSize="xs" color="gray.500">
            {t("templates.description")}
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
                templates &&
                templates.map((template, index) => (
                  <TemplateAccordion
                    key={template.id}
                    template={template}
                    toggleAccordion={() => toggleAccordion(index)}
                  />
                ))}

              <AddTemplateForm
                toggleAccordion={() =>
                  toggleAccordion((templates || []).length)
                }
                resetAccordions={() => setOpenAccordions({})}
              />
            </VStack>
          </Accordion>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
