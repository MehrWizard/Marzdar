import { useQuery } from "react-query";
import { fetch } from "service/http";
import { Admin, AdminCreate, AdminModify } from "types/Admin";
import { create } from "zustand";
import { useDashboard } from "./DashboardContext";

export const FetchAdminsQueryKey = "fetch-admins-query-key";

export type AdminStore = {
  admins: Admin[];
  deletingAdmin: Admin | null;
  setDeletingAdmin: (admin: Admin | null) => void;
  fetchAdmins: () => Promise<Admin[]>;
  createAdmin: (body: AdminCreate) => Promise<Admin>;
  modifyAdmin: (username: string, body: AdminModify) => Promise<Admin>;
  deleteAdmin: (username: string) => Promise<unknown>;
  resetAdminUsage: (username: string) => Promise<Admin>;
  disableAdminUsers: (username: string) => Promise<unknown>;
  activateAdminUsers: (username: string) => Promise<unknown>;
};

export const useAdmins = create<AdminStore>((set, get) => ({
  admins: [],
  deletingAdmin: null,
  setDeletingAdmin(admin) {
    set({ deletingAdmin: admin });
  },
  fetchAdmins() {
    return fetch<Admin[]>("/admins");
  },
  createAdmin(body) {
    return fetch<Admin>("/admin", {
      method: "POST",
      body,
    });
  },
  modifyAdmin(username, body) {
    const payload: Partial<AdminModify> = { ...body };
    if (!payload.password) {
      delete payload.password;
    }
    return fetch<Admin>(`/admin/${username}`, {
      method: "PUT",
      body: payload,
    });
  },
  deleteAdmin(username) {
    return fetch(`/admin/${username}`, {
      method: "DELETE",
    });
  },
  resetAdminUsage(username) {
    return fetch<Admin>(`/admin/usage/reset/${username}`, {
      method: "POST",
    });
  },
  disableAdminUsers(username) {
    return fetch(`/admin/${username}/users/disable`, {
      method: "POST",
    });
  },
  activateAdminUsers(username) {
    return fetch(`/admin/${username}/users/activate`, {
      method: "POST",
    });
  },
}));

export const useAdminsQuery = () => {
  const { isManagingAdmins } = useDashboard();
  return useQuery({
    queryKey: FetchAdminsQueryKey,
    queryFn: useAdmins.getState().fetchAdmins,
    enabled: isManagingAdmins,
    refetchInterval: isManagingAdmins ? 5000 : false,
    refetchOnWindowFocus: false,
  });
};
