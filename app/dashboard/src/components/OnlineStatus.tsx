import { FC } from "react";
import { Text, TextProps } from "@chakra-ui/react";
import { relativeExpiryDate } from "utils/dateFormatter";

type UserStatusProps = {
  lastOnline: string | null;
} & TextProps;

const convertDateFormat = (lastOnline: string | null): number | null => {
  if (!lastOnline) {
    return null;
  }

  const date = new Date(lastOnline + "Z");
  return Math.floor(date.getTime() / 1000);
};

export const OnlineStatus: FC<UserStatusProps> = ({
  lastOnline,
  ...textProps
}) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const unixTime = convertDateFormat(lastOnline);

  const timeDifferenceInSeconds = unixTime
    ? currentTimeInSeconds - unixTime
    : null;
  const dateInfo = unixTime
    ? relativeExpiryDate(unixTime)
    : { status: "", time: "Not Connected Yet" };

  const isOnline = !!(timeDifferenceInSeconds && timeDifferenceInSeconds <= 60);

  return (
    <Text
      fontSize="xs"
      fontWeight="normal"
      lineHeight="shorter"
      color={isOnline ? "green.500" : "gray.500"}
      _dark={{
        color: isOnline ? "green.400" : "gray.400",
      }}
      whiteSpace="nowrap"
      {...textProps}
    >
      {isOnline
        ? "Online"
        : timeDifferenceInSeconds
        ? `${dateInfo.time} ago`
        : dateInfo.time}
    </Text>
  );
};