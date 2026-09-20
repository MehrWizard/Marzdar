import { BoxProps, Link, Text, VStack } from "@chakra-ui/react";
import { ORGANIZATION_URL, REPO_URL } from "constants/Project";
import { useDashboard } from "contexts/DashboardContext";
import { FC } from "react";

export const Footer: FC<BoxProps> = (props) => {
  const { version } = useDashboard();
  return (
    <VStack
      w="full"
      maxW={{ base: "90%", sm: "620px" }}
      mx="auto"
      py={2}
      spacing={1}
      textAlign="center"
      position="relative"
      {...props}
    >
      <Text color="gray.500" fontSize="xs">
        <Link color="blue.400" href={REPO_URL} isExternal>
          Marzdar
        </Link>
        {version ? ` (v${version}), ` : ", "}
        Made with ❤️ by{" "}
        <Link color="blue.400" href={ORGANIZATION_URL} isExternal>
          MehrWizard
        </Link>
      </Text>
      <Text color="gray.500" fontSize="xs" opacity={0.85} lineHeight="base">
        This is a fork of{" "}
        <Link
          color="blue.400"
          href="https://github.com/gozargah/marzban"
          isExternal
        >
          Marzban
        </Link>{" "}
        focusing on completing the user interface based on what was already
        implemented in the API
      </Text>
    </VStack>
  );
};
