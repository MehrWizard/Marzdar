import { useQuery } from "react-query";
import { fetch } from "service/http";
import { Admin, AdminCreate, AdminModify } from "types/Admin";
import { create } from "zustand";
import { useDashboard } from "./DashboardContext";

export const FetchAdminsQueryKey = "fetch-admins-query-key";

export type AdminRoleFilter = "all" | "sudo" | "regular";
export type AdminUserFilter = "all" | "with_users" | "no_users";
export type AdminSortOption = string;

export type AdminFiltersState = {
  search: string;
  role: AdminRoleFilter;
  userFilter: AdminUserFilter;
  sort: AdminSortOption;
  page: number;
  pageSize: number;
};

export type AdminStore = {
  admins: Admin[];
  deletingAdmin: Admin | null;
  setDeletingAdmin: (admin: Admin | null) => void;
  editingAdmin: Admin | null;
  setEditingAdmin: (admin: Admin | null) => void;
  isCreatingAdmin: boolean;
  setIsCreatingAdmin: (isOpen: boolean) => void;
  filters: AdminFiltersState;
  setFilters: (partial: Partial<AdminFiltersState>) => void;
  resetFilters: () => void;
  fetchAdmins: () => Promise<Admin[]>;
  createAdmin: (body: AdminCreate) => Promise<Admin>;
  modifyAdmin: (username: string, body: AdminModify) => Promise<Admin>;
  deleteAdmin: (username: string) => Promise<unknown>;
  resetAdminUsage: (username: string) => Promise<Admin>;
  disableAdminUsers: (username: string) => Promise<unknown>;
  activateAdminUsers: (username: string) => Promise<unknown>;
};

const initialFilters: AdminFiltersState = {
  search: "",
  role: "all",
  userFilter: "all",
  sort: "-users_count",
  page: 1,
  pageSize: 20,
};

export const useAdmins = create<AdminStore>((set, get) => ({
  admins: [],
  deletingAdmin: null,
  editingAdmin: null,
  isCreatingAdmin: false,
  filters: initialFilters,
  setDeletingAdmin(admin) {
    set({ deletingAdmin: admin });
  },
  setEditingAdmin(admin) {
    set({ editingAdmin: admin });
  },
  setIsCreatingAdmin(isOpen) {
    set({ isCreatingAdmin: isOpen });
  },
  setFilters(partial) {
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
      },
    }));
  },
  resetFilters() {
    set({ filters: initialFilters });
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

export const useAdminsQuery = (enabled?: boolean) => {
  const { activeTab, isManagingAdmins } = useDashboard();
  const shouldEnable =
    enabled !== undefined ? enabled : activeTab === "admins" || isManagingAdmins;
  return useQuery({
    queryKey: FetchAdminsQueryKey,
    queryFn: useAdmins.getState().fetchAdmins,
    enabled: shouldEnable,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });
};
