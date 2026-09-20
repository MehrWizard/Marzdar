import { Box, VStack } from "@chakra-ui/react";
import { AdminsFilters } from "components/AdminsFilters";
import { AdminsTable } from "components/AdminsTable";
import { CoreSettingsModal } from "components/CoreSettingsModal";
import { CreateAdminModal } from "components/CreateAdminModal";
import { DeleteAdminModal } from "components/DeleteAdminModal";
import { DeleteUserModal } from "components/DeleteUserModal";
import { EditAdminModal } from "components/EditAdminModal";
import { ExpiredUsersModal } from "components/ExpiredUsersModal";
import { Filters } from "components/Filters";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { HostsDialog } from "components/HostsDialog";
import { NextPlanModal } from "components/NextPlanModal";
import { NodesDialog } from "components/NodesModal";
import { NodesUsage } from "components/NodesUsage";
import { QRCodeDialog } from "components/QRCodeDialog";
import { ResetAllUsageModal } from "components/ResetAllUsageModal";
import { ResetUserUsageModal } from "components/ResetUserUsageModal";
import { RevokeSubscriptionModal } from "components/RevokeSubscriptionModal";
import { Statistics } from "components/Statistics";
import { UserDialog } from "components/UserDialog";
import { UserTemplatesModal } from "components/UserTemplatesModal";
import { UsersTable } from "components/UsersTable";
import { UsersUsageModal } from "components/UsersUsageModal";
import { fetchInbounds, useDashboard } from "contexts/DashboardContext";
import { FC, useEffect } from "react";

export const Dashboard: FC = () => {
  const { activeTab } = useDashboard();

  useEffect(() => {
    useDashboard.getState().refetchUsers();
    fetchInbounds();
  }, []);

  return (
    <VStack justifyContent="space-between" minH="100vh" p="6" rowGap={4}>
      <Box w="full">
        <Header />
        <Statistics mt="4" />

        {activeTab === "users" ? (
          <>
            <Filters />
            <UsersTable />
          </>
        ) : (
          <>
            <AdminsFilters />
            <AdminsTable />
          </>
        )}

        <UserDialog />
        <DeleteUserModal />
        <QRCodeDialog />
        <HostsDialog />
        <ResetUserUsageModal />
        <RevokeSubscriptionModal />
        <NodesDialog />
        <NodesUsage />
        <UsersUsageModal />
        <CreateAdminModal />
        <EditAdminModal />
        <DeleteAdminModal />
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
