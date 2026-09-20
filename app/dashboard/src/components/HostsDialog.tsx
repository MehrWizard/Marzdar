import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Select as ChakraSelect,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Switch,
  Text,
  Tooltip,
  VStack,
  chakra,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  proxyALPN,
  proxyFingerprint,
  proxyHostSecurity,
} from "constants/Proxies";
import { useHosts } from "contexts/HostsContext";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { z } from "zod";
import { fetchInbounds, useDashboard } from "../contexts/DashboardContext";
import { DeleteIcon } from "./DeleteUserModal";
import { Icon } from "./Icon";
import { Input as CustomInput } from "./Input";

export const DuplicateIcon = chakra(DocumentDuplicateIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

export const UpIcon = chakra(ArrowUpIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

export const DownIcon = chakra(ArrowDownIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

const Select = chakra(ChakraSelect, {
  baseStyle: {
    bg: "white",
    _dark: {
      bg: "gray.700",
    },
  },
});

const Input = chakra(CustomInput, {
  baseStyle: {
    bg: "white",
    _dark: {
      bg: "gray.700",
    },
  },
});

const ModalIcon = chakra(LinkIcon, {
  baseStyle: {
    w: 5,
    h: 5,
  },
});

const InfoIcon = chakra(InformationCircleIcon, {
  baseStyle: {
    w: 4,
    h: 4,
    color: "gray.400",
    cursor: "pointer",
  },
});

const singleHostSchema = z.object({
  remark: z.string().min(1, "Remark is required"),
  address: z.string().min(1, "Address is required"),
  port: z
    .string()
    .or(z.number())
    .nullable()
    .transform((value) => {
      if (typeof value === "number") return value;
      if (value !== null && value !== "" && !isNaN(parseInt(String(value))))
        return Number(parseInt(String(value)));
      return null;
    }),
  path: z.string().nullable(),
  sni: z.string().nullable(),
  host: z.string().nullable(),
  mux_enable: z.boolean().default(false),
  allowinsecure: z.boolean().nullable().default(false),
  is_disabled: z.boolean().default(false),
  fragment_setting: z.string().nullable(),
  noise_setting: z.string().nullable(),
  random_user_agent: z.boolean().default(false),
  security: z.string(),
  alpn: z.string(),
  fingerprint: z.string(),
  use_sni_as_host: z.boolean().default(false),
});

const hostsFormSchema = z.object({
  inbounds: z.array(
    z.object({
      tag: z.string(),
      hosts: z.array(singleHostSchema),
    })
  ),
});

type HostsFormValues = z.infer<typeof hostsFormSchema>;

const Error = chakra(FormErrorMessage, {
  baseStyle: {
    color: "red.400",
    display: "block",
    textAlign: "left",
    w: "100%",
  },
});

type AccordionInboundType = {
  inboundIndex: number;
  tag: string;
  isOpen: boolean;
  toggleAccordion: () => void;
};

const AccordionInbound: FC<AccordionInboundType> = ({
  inboundIndex,
  tag,
  isOpen,
  toggleAccordion,
}) => {
  const { inbounds } = useDashboard();
  const inbound = [...(inbounds?.values?.() || [])]
    .flat()
    .find((inbound) => inbound?.tag === tag);

  const form = useFormContext<HostsFormValues>();
  const basePath = `inbounds.${inboundIndex}.hosts` as const;
  const {
    fields: hosts,
    append: addHost,
    remove: removeHost,
    insert: insertHost,
    move: moveHost,
  } = useFieldArray({
    control: form.control,
    name: basePath,
  });
  const { errors } = form.formState;
  const { t } = useTranslation();
  const accordionErrors = errors?.inbounds?.[inboundIndex]?.hosts;
  const handleAddHost = () => {
    addHost({
      host: "",
      sni: "",
      port: null,
      path: null,
      address: "",
      remark: "",
      mux_enable: false,
      allowinsecure: false,
      is_disabled: false,
      fragment_setting: "",
      noise_setting: "",
      random_user_agent: false,
      security: "inbound_default",
      alpn: "",
      fingerprint: "",
      use_sni_as_host: false,
    });
  };
  const duplicateHost = (index: number) => {
    if (index < 0 || index >= hosts.length) return;
    const hostToDuplicate = hosts[index];
    insertHost(index + 1, hostToDuplicate);
  };
  useEffect(() => {
    const hasError =
      Array.isArray(accordionErrors) && accordionErrors.some(Boolean);
    if (hasError && !isOpen) {
      toggleAccordion();
    }
  }, [accordionErrors]);

  const moveHostPosition = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      moveHost(index, index - 1);
    } else if (direction === "down" && index < hosts.length - 1) {
      moveHost(index, index + 1);
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
        <Text
          as="span"
          fontWeight="medium"
          fontSize="sm"
          flex="1"
          textAlign="left"
          color="gray.700"
          _dark={{ color: "gray.300" }}
        >
          {tag}
        </Text>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel px={2} pb={2}>
        <VStack gap={3}>
          {hosts.map((host, index) => {
            const fieldPrefix = `${basePath}.${index}` as const;
            const hostErrors = accordionErrors?.[index];
            return (
              <motion.div
                key={host.id}
                layout
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 500, damping: 30 },
                  opacity: { duration: 0.1 },
                }}
                id={host.id}
                whileDrag={{ scale: 1.05, zIndex: 10 }}
                style={{
                  width: "100%",
                }}
              >
                <VStack
                  id={host.id}
                  key={host.id}
                  border="1px solid"
                  className="host-config-card"
                  _dark={{ borderColor: "var(--theme-card-border)", bg: "var(--theme-card-bg)" }}
                  _light={{ borderColor: "var(--theme-card-border)", bg: "var(--theme-card-bg)" }}
                  p={2}
                  w="full"
                  borderRadius="4px"
                >
                  <HStack w="100%" alignItems="flex-start">
                    <FormControl
                      position="relative"
                      zIndex={10}
                      isInvalid={!!hostErrors?.remark}
                    >
                      <InputGroup>
                        <Input
                          {...form.register(`${fieldPrefix}.remark`)}
                          size="sm"
                          borderRadius="4px"
                          placeholder="Remark"
                        />
                        <InputRightElement>
                          <Popover isLazy placement="right">
                            <PopoverTrigger>
                              <Box mt="-8px">
                                <InfoIcon />
                              </Box>
                            </PopoverTrigger>
                            <Portal>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>
                                  <Box fontSize="xs">
                                    <Text pr="20px">
                                      {t("hostsDialog.desc")}
                                    </Text>
                                    <Text>
                                      <Badge>
                                        {"{"}SERVER_IP{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.currentServer")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}SERVER_IPV6{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.currentServerv6")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}USERNAME{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.username")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}DATA_USAGE{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.dataUsage")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}DATA_LEFT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.remainingData")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}DATA_LIMIT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.dataLimit")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}DAYS_LEFT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.remainingDays")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}EXPIRE_DATE{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.expireDate")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}JALALI_EXPIRE_DATE{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.jalaliExpireDate")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}TIME_LEFT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.remainingTime")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}STATUS_TEXT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.statusText")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}STATUS_EMOJI{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.statusEmoji")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}PROTOCOL{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.proxyProtocol")}
                                    </Text>
                                    <Text mt={1}>
                                      <Badge>
                                        {"{"}TRANSPORT{"}"}
                                      </Badge>{" "}
                                      {t("hostsDialog.proxyMethod")}
                                    </Text>
                                  </Box>
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>
                        </InputRightElement>
                      </InputGroup>
                      {hostErrors?.remark && (
                        <Error>{hostErrors.remark.message}</Error>
                      )}
                    </FormControl>
                  </HStack>
                  <FormControl
                    isInvalid={!!hostErrors?.address}
                  >
                    <InputGroup>
                      <Input
                        size="sm"
                        borderRadius="4px"
                        placeholder="Address (e.g. example.com)"
                        {...form.register(`${fieldPrefix}.address`)}
                      />
                      <InputRightElement>
                        <Popover isLazy placement="right">
                          <PopoverTrigger>
                            <Box mt="-8px">
                              <InfoIcon />
                            </Box>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Box fontSize="xs">
                                  <Text pr="20px">{t("hostsDialog.desc")}</Text>
                                  <Text>
                                    <Badge>
                                      {"{"}SERVER_IP{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.currentServer")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}SERVER_IPV6{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.currentServerv6")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}USERNAME{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.username")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}DATA_USAGE{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.dataUsage")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}DATA_LEFT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.remainingData")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}DATA_LIMIT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.dataLimit")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}DAYS_LEFT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.remainingDays")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}EXPIRE_DATE{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.expireDate")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}JALALI_EXPIRE_DATE{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.jalaliExpireDate")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}TIME_LEFT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.remainingTime")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}STATUS_TEXT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.statusText")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}STATUS_EMOJI{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.statusEmoji")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}PROTOCOL{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.proxyProtocol")}
                                  </Text>
                                  <Text mt={1}>
                                    <Badge>
                                      {"{"}TRANSPORT{"}"}
                                    </Badge>{" "}
                                    {t("hostsDialog.proxyMethod")}
                                  </Text>
                                </Box>
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </InputRightElement>
                    </InputGroup>
                    {hostErrors?.address && (
                      <Error>{hostErrors.address.message}</Error>
                    )}
                  </FormControl>

                  <Accordion w="full" allowToggle>
                    <AccordionItem border="0">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AccordionButton
                          display="flex"
                          px={0}
                          py={1}
                          borderRadius={3}
                          _hover={{ bg: "transparent" }}
                        >
                          <Text
                            flex="3"
                            align="start"
                            fontSize="xs"
                            color="gray.600"
                            _dark={{ color: "gray.500" }}
                            pl={1}
                          >
                            {t("hostsDialog.advancedOptions")}
                            <AccordionIcon fontSize="sm" ml={1} />
                          </Text>

                          <Container flex="1" px="0" display={"contents"}>
                            <Controller
                              control={form.control}
                              name={`${fieldPrefix}.is_disabled`}
                              render={({ field }) => {
                                return (
                                  <Switch
                                    mx="1.5"
                                    colorScheme="primary"
                                    {...field}
                                    value={undefined}
                                    isChecked={!field.value}
                                    onChange={(e) => {
                                      field.onChange(!e.target.checked);
                                    }}
                                  />
                                );
                              }}
                            />
                            <Tooltip label="Delete" placement="top">
                              <IconButton
                                aria-label="Delete"
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={removeHost.bind(null, index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Container>
                        </AccordionButton>
                        <Tooltip label="Duplicate" placement="top">
                          <IconButton
                            aria-label="Duplicate"
                            size="sm"
                            variant="ghost"
                            onClick={() => duplicateHost(index)}
                          >
                            <DuplicateIcon />
                          </IconButton>
                        </Tooltip>
                        {index < hosts.length - 1 && (
                          <Tooltip label="Move Down" placement="top">
                            <IconButton
                              aria-label="DownIcon"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveHostPosition(index, "down")}
                            >
                              <DownIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {index > 0 && (
                          <Tooltip label="Move Up" placement="top">
                            <IconButton
                              aria-label="UpIcon"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveHostPosition(index, "up")}
                            >
                              <UpIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                      <AccordionPanel w="full" p={1}>
                        <VStack key={index} w="full" borderRadius="4px">
                          <FormControl
                            isInvalid={!!hostErrors?.port}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              justifyContent="space-between"
                              gap={1}
                              m="0"
                            >
                              <span>{t("hostsDialog.port")}</span>
                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.port.info")}
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder={String(inbound?.port || "8080")}
                              type="number"
                              {...form.register(`${fieldPrefix}.port`)}
                            />
                          </FormControl>
                          <FormControl
                            isInvalid={!!hostErrors?.sni}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.sni")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.sni.info")}
                                    </Text>
                                    <Text fontSize="xs" mt="2">
                                      <Trans
                                        i18nKey="hostsDialog.host.wildcard"
                                        components={{
                                          badge: <Badge />,
                                        }}
                                      />
                                    </Text>
                                    <Text fontSize="xs">
                                      <Trans
                                        i18nKey="hostsDialog.host.multiHost"
                                        components={{
                                          badge: <Badge />,
                                        }}
                                      />
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder="SNI (e.g. example.com)"
                              {...form.register(`${fieldPrefix}.sni`)}
                            />
                            {hostErrors?.sni && (
                              <Error>
                                {hostErrors.sni.message}
                              </Error>
                            )}
                          </FormControl>
                          <FormControl
                            isInvalid={!!hostErrors?.host}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.host")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.host.info")}
                                    </Text>
                                    <Text fontSize="xs" mt="2">
                                      <Trans
                                        i18nKey="hostsDialog.host.wildcard"
                                        components={{
                                          badge: <Badge />,
                                        }}
                                      />
                                    </Text>
                                    <Text fontSize="xs">
                                      <Trans
                                        i18nKey="hostsDialog.host.multiHost"
                                        components={{
                                          badge: <Badge />,
                                        }}
                                      />
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder="Host (e.g. example.com)"
                              {...form.register(`${fieldPrefix}.host`)}
                            />
                            {hostErrors?.host && (
                              <Error>
                                {hostErrors.host.message}
                              </Error>
                            )}
                          </FormControl>

                          <FormControl
                            isInvalid={!!hostErrors?.path}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.path")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.path.info")}
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder="path (e.g. /vless)"
                              {...form.register(`${fieldPrefix}.path`)}
                            />
                            {hostErrors?.path && (
                              <Error>
                                {hostErrors.path.message}
                              </Error>
                            )}
                          </FormControl>

                          <FormControl height="66px">
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.security")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.security.info")}
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Select
                              size="sm"
                              {...form.register(`${fieldPrefix}.security`)}
                            >
                              {proxyHostSecurity.map((s) => {
                                return (
                                  <option key={s.value} value={s.value}>
                                    {s.title}
                                  </option>
                                );
                              })}
                            </Select>
                          </FormControl>

                          <FormControl height="66px">
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.alpn")}</span>
                            </FormLabel>
                            <Select
                              size="sm"
                              {...form.register(`${fieldPrefix}.alpn`)}
                            >
                              {proxyALPN.map((s) => {
                                return (
                                  <option key={s.value} value={s.value}>
                                    {s.title}
                                  </option>
                                );
                              })}
                            </Select>
                          </FormControl>

                          <FormControl height="66px">
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.fingerprint")}</span>
                            </FormLabel>
                            <Select
                              size="sm"
                              {...form.register(`${fieldPrefix}.fingerprint`)}
                            >
                              {proxyFingerprint.map((s) => {
                                return (
                                  <option key={s.value} value={s.value}>
                                    {s.title}
                                  </option>
                                );
                              })}
                            </Select>
                          </FormControl>

                          <FormControl
                            isInvalid={!!hostErrors?.fragment_setting}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.fragment")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.fragment.info")}
                                    </Text>
                                    <Text fontSize="xs" pr={5} pt={2} pb={1}>
                                      {t("hostsDialog.fragment.info.examples")}
                                    </Text>
                                    <Text fontSize="xs" pr={5}>
                                      100-200,10-20,tlshello
                                    </Text>
                                    <Text fontSize="xs" pr={5}>
                                      100-200,10-20,1-3
                                    </Text>
                                    <Text fontSize="xs" pr={5} pt="3">
                                      {t("hostsDialog.fragment.info.attention")}
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder="Fragment settings by pattern"
                              {...form.register(`${fieldPrefix}.fragment_setting`)}
                            />
                            {hostErrors?.fragment_setting && (
                              <Error>
                                {hostErrors.fragment_setting.message}
                              </Error>
                            )}
                          </FormControl>

                          <FormControl
                            isInvalid={!!hostErrors?.noise_setting}
                          >
                            <FormLabel
                              display="flex"
                              pb={1}
                              alignItems="center"
                              gap={1}
                              justifyContent="space-between"
                              m="0"
                            >
                              <span>{t("hostsDialog.noise")}</span>

                              <Popover isLazy placement="right">
                                <PopoverTrigger>
                                  <InfoIcon />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent p={2}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <Text fontSize="xs" pr={5}>
                                      {t("hostsDialog.noise.info")}
                                    </Text>
                                    <Text fontSize="xs" pr={5} pt={2} pb={1}>
                                      {t("hostsDialog.noise.info.examples")}
                                    </Text>
                                    <Text fontSize="xs" pr={5}>
                                      rand:10-20,10-20
                                    </Text>
                                    <Text fontSize="xs" pr={5}>
                                      rand:10-20,10-20&base64:7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=,10-25
                                    </Text>
                                    <Text fontSize="xs" pr={5} pt="3">
                                      {t("hostsDialog.noise.info.attention")}
                                    </Text>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </FormLabel>
                            <Input
                              size="sm"
                              borderRadius="4px"
                              placeholder="Noise settings by pattern"
                              {...form.register(`${fieldPrefix}.noise_setting`)}
                            />
                            {hostErrors?.noise_setting && (
                              <Error>
                                {hostErrors.noise_setting.message}
                              </Error>
                            )}
                          </FormControl>

                          <FormControl
                            isInvalid={!!hostErrors?.use_sni_as_host}
                          >
                            <Checkbox
                              {...form.register(`${fieldPrefix}.use_sni_as_host`)}
                            >
                              <FormLabel>
                                {t("hostsDialog.useSniAsHost")}
                              </FormLabel>
                            </Checkbox>
                            {hostErrors?.use_sni_as_host && (
                              <Error>
                                {hostErrors.use_sni_as_host.message}
                              </Error>
                            )}
                          </FormControl>
                          <FormControl
                            isInvalid={!!hostErrors?.allowinsecure}
                          >
                            <Checkbox
                              {...form.register(`${fieldPrefix}.allowinsecure`)}
                            >
                              <FormLabel>
                                {t("hostsDialog.allowinsecure")}
                              </FormLabel>
                              {hostErrors?.allowinsecure && (
                                <Error>
                                  {hostErrors.allowinsecure.message}
                                </Error>
                              )}
                            </Checkbox>
                          </FormControl>
                          <FormControl
                            isInvalid={!!hostErrors?.mux_enable}
                          >
                            <Checkbox
                              {...form.register(`${fieldPrefix}.mux_enable`)}
                            >
                              <FormLabel>
                                {t("hostsDialog.muxEnable")}
                              </FormLabel>
                            </Checkbox>
                            {hostErrors?.mux_enable && (
                              <Error>
                                {hostErrors.mux_enable.message}
                              </Error>
                            )}
                          </FormControl>
                          <FormControl
                            isInvalid={!!hostErrors?.random_user_agent}
                          >
                            <Checkbox
                              {...form.register(`${fieldPrefix}.random_user_agent`)}
                            >
                              <FormLabel>
                                {t("hostsDialog.randomUserAgent")}
                              </FormLabel>
                            </Checkbox>
                            {hostErrors?.random_user_agent && (
                              <Error>
                                {hostErrors.random_user_agent.message}
                              </Error>
                            )}
                          </FormControl>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              </motion.div>
            );
          })}
          <Button
            variant="outline"
            w="full"
            size="sm"
            color=""
            fontWeight={"normal"}
            onClick={handleAddHost}
          >
            {t("hostsDialog.addHost")}
          </Button>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

export const HostsDialog: FC = () => {
  const { isEditingHosts, onEditingHosts, refetchUsers } = useDashboard();
  const { isLoading, hosts, fetchHosts, isPostLoading, setHosts } = useHosts();
  const toast = useToast();
  const { t } = useTranslation();
  const [openAccordions, setOpenAccordions] = useState<any>({});

  const form = useForm<HostsFormValues>({
    resolver: zodResolver(hostsFormSchema),
    defaultValues: {
      inbounds: [],
    },
  });

  const { fields: inboundFields } = useFieldArray({
    control: form.control,
    name: "inbounds",
  });

  useEffect(() => {
    if (isEditingHosts) {
      fetchHosts();
      fetchInbounds();
    }
  }, [isEditingHosts]);

  useEffect(() => {
    if (hosts && isEditingHosts) {
      const inboundsList = Object.entries(hosts).map(([tag, hostList]) => ({
        tag,
        hosts: hostList || [],
      }));
      form.reset({ inbounds: inboundsList });
    }
  }, [hosts, isEditingHosts]);

  const onClose = () => {
    setOpenAccordions({});
    onEditingHosts(false);
  };
  const handleFormSubmit = (data: HostsFormValues) => {
    const payload: Record<string, any[]> = {};
    for (const item of data.inbounds) {
      payload[item.tag] = item.hosts;
    }
    setHosts(payload)
      .then(() => {
        toast({
          title: t("hostsDialog.savedSuccess"),
          status: "success",
          isClosable: true,
          position: "top",
          duration: 3000,
        });
        refetchUsers();
      })
      .catch((err) => {
        if (err?.response?.status === 409 || err?.response?.status === 400) {
          toast({
            title: err.response?._data?.detail,
            status: "error",
            isClosable: true,
            position: "top",
            duration: 3000,
          });
        }
        if (err?.response?.status === 422) {
          const detail = err.response?._data?.detail;
          if (detail && typeof detail === "object") {
            Object.keys(detail).forEach((key) => {
              toast({
                title: detail[key] + " (" + key + ")",
                status: "error",
                isClosable: true,
                position: "top",
                duration: 3000,
              });
            });
          }
        }
      });
  };

  const toggleAccordion = (index: number) => {
    if (openAccordions[String(index)]) {
      delete openAccordions[String(index)];
    } else openAccordions[String(index)] = {};

    setOpenAccordions({ ...openAccordions });
  };

  const isFormPopulated = !isLoading && hosts && inboundFields.length > 0;
  const noInboundsFound =
    !isLoading && hosts && Object.keys(hosts).length === 0;

  return (
    <Modal isOpen={isEditingHosts} onClose={onClose}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent mx="3" w="fit-content" maxW="3xl">
        <ModalHeader pt={6}>
          <Icon color="primary">
            <ModalIcon color="white" />
          </Icon>
        </ModalHeader>
        <ModalCloseButton mt={3} />
        <ModalBody w="440px" pb={3} pt={3}>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <Text mb={3} opacity={0.8} fontSize="sm">
                {t("hostsDialog.title")}
              </Text>
              {(isLoading || (!isFormPopulated && !noInboundsFound)) &&
                t("hostsDialog.loading")}
              {noInboundsFound &&
                "No inbound found. Please check your Xray config file."}
              {isFormPopulated && (
                <Accordion
                  w="full"
                  allowToggle
                  allowMultiple
                  index={Object.keys(openAccordions).map((i) => parseInt(i))}
                >
                  <VStack w="full">
                    {inboundFields.map((field, index) => {
                      return (
                        <AccordionInbound
                          toggleAccordion={() => toggleAccordion(index)}
                          isOpen={!!openAccordions[String(index)]}
                          key={field.id}
                          inboundIndex={index}
                          tag={field.tag}
                        />
                      );
                    })}
                  </VStack>
                </Accordion>
              )}

              <HStack justifyContent="flex-end" py={2}>
                <Button
                  variant="solid"
                  mt="2"
                  type="submit"
                  colorScheme="primary"
                  size="sm"
                  px={5}
                  isLoading={isPostLoading}
                  disabled={isPostLoading}
                >
                  {t("hostsDialog.apply")}
                </Button>
              </HStack>
            </form>
          </FormProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
