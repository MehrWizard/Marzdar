import { Box, VStack } from "@chakra-ui/react";
import { AdminsDialog } from "components/AdminsModal";
import { CoreSettingsModal } from "components/CoreSettingsModal";
import { DeleteUserModal } from "components/DeleteUserModal";
import { ExpiredUsersModal } from "components/ExpiredUsersModal";
import { Filters } from "components/Filters";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { HostsDialog } from "components/HostsDialog";
import { NodesDialog } from "components/NodesModal";
import { NodesUsage } from "components/NodesUsage";
import { QRCodeDialog } from "components/QRCodeDialog";
import { ResetAllUsageModal } from "components/ResetAllUsageModal";
import { ResetUserUsageModal } from "components/ResetUserUsageModal";
import { RevokeSubscriptionModal } from "components/RevokeSubscriptionModal";
import { UserDialog } from "components/UserDialog";
import { UserTemplatesModal } from "components/UserTemplatesModal";
import { UsersUsageModal } from "components/UsersUsageModal";
import { NextPlanModal } from "components/NextPlanModal";
import { UsersTable } from "components/UsersTable";
import { fetchInbounds, useDashboard } from "contexts/DashboardContext";
import { FC, useEffect } from "react";
import { Statistics } from "../components/Statistics";

export const Dashboard: FC = () => {
  useEffect(() => {
    useDashboard.getState().refetchUsers();
    fetchInbounds();
  }, []);
  return (
    <VStack justifyContent="space-between" minH="100vh" p="6" rowGap={4}>
      <Box w="full">
        <Header />
        <Statistics mt="4" />
        <Filters />
        <UsersTable />
        <UserDialog />
        <DeleteUserModal />
        <QRCodeDialog />
        <HostsDialog />
        <ResetUserUsageModal />
        <RevokeSubscriptionModal />
        <NodesDialog />
        <NodesUsage />
        <UsersUsageModal />
        <AdminsDialog />
        <ExpiredUsersModal />
        <UserTemplatesModal />
        <NextPlanModal />
        <ResetAllUsageModal />
        <CoreSettingsModal />
      </Box>
      <Footer />
    </VStack>
  );
};

export default Dashboard;
