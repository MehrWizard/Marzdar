import { useQuery } from "react-query";
import { fetch } from "service/http";
import {
  UserTemplate,
  UserTemplateCreate,
  UserTemplateModify,
} from "types/UserTemplate";
import { create } from "zustand";
import { useDashboard } from "./DashboardContext";

export const FetchUserTemplatesQueryKey = "fetch-user-templates-query-key";

export type UserTemplateStore = {
  templates: UserTemplate[];
  deletingTemplate: UserTemplate | null;
  editingTemplate: UserTemplate | null;
  setDeletingTemplate: (template: UserTemplate | null) => void;
  setEditingTemplate: (template: UserTemplate | null) => void;
  fetchUserTemplates: () => Promise<UserTemplate[]>;
  createTemplate: (body: UserTemplateCreate) => Promise<UserTemplate>;
  modifyTemplate: (
    id: number,
    body: UserTemplateModify
  ) => Promise<UserTemplate>;
  deleteTemplate: (id: number) => Promise<unknown>;
};

export const useUserTemplates = create<UserTemplateStore>((set) => ({
  templates: [],
  deletingTemplate: null,
  editingTemplate: null,
  setDeletingTemplate(template) {
    set({ deletingTemplate: template });
  },
  setEditingTemplate(template) {
    set({ editingTemplate: template });
  },
  fetchUserTemplates() {
    return fetch<UserTemplate[]>("/user_template");
  },
  createTemplate(body) {
    return fetch<UserTemplate>("/user_template", {
      method: "POST",
      body,
    });
  },
  modifyTemplate(id, body) {
    return fetch<UserTemplate>(`/user_template/${id}`, {
      method: "PUT",
      body,
    });
  },
  deleteTemplate(id) {
    return fetch(`/user_template/${id}`, {
      method: "DELETE",
    });
  },
}));

export const useUserTemplatesQuery = (enabled?: boolean) => {
  const { isManagingTemplates, isCreatingNewUser } = useDashboard();
  const shouldEnable =
    enabled !== undefined
      ? enabled
      : isManagingTemplates || isCreatingNewUser;
  return useQuery({
    queryKey: FetchUserTemplatesQueryKey,
    queryFn: useUserTemplates.getState().fetchUserTemplates,
    enabled: shouldEnable,
    refetchOnWindowFocus: false,
  });
};
