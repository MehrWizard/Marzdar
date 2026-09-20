import { Box, useColorMode } from "@chakra-ui/react";
import { useThemeMode } from "hooks/useThemeMode";
import { FC } from "react";

type UserStatusProps = {
  lastOnline?: string | null;
};

const convertDateFormat = (lastOnline?: string | null): number | null => {
  if (!lastOnline) return null;

  const date = new Date(`${lastOnline}Z`);
  return Math.floor(date.getTime() / 1000);
};

export const OnlineBadge: FC<UserStatusProps> = ({ lastOnline }) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const unixTime = convertDateFormat(lastOnline);
  const { colorMode } = useColorMode();
  const { themeMode } = useThemeMode();

  const isDark = themeMode === "black" || colorMode === "dark";

  // Dedicated neutral tokens immune to accent color overrides
  const neutralColor = isDark ? "#8b949e" : "#94a3b8";
  const onlineColor = isDark ? "#22c55e" : "#16a34a";

  if (!lastOnline || unixTime === null) {
    return (
      <Box
        className="circle"
        w="10px"
        h="10px"
        minW="10px"
        minH="10px"
        borderRadius="full"
        border="1.5px solid"
        borderColor={neutralColor}
        bg="transparent"
        boxShadow="none"
        title="Not connected yet"
        aria-label="Not connected yet"
      />
    );
  }

  const timeDifferenceInSeconds = currentTimeInSeconds - unixTime;

  if (timeDifferenceInSeconds <= 60) {
    return (
      <Box
        className="circle pulse green"
        w="10px"
        h="10px"
        minW="10px"
        minH="10px"
        borderRadius="full"
        bg={onlineColor}
        title="Online"
        aria-label="Online"
      />
    );
  }

  return (
    <Box
      className="circle"
      w="10px"
      h="10px"
      minW="10px"
      minH="10px"
      borderRadius="full"
      bg={neutralColor}
      boxShadow="none"
      title="Offline"
      aria-label="Offline"
    />
  );
};
