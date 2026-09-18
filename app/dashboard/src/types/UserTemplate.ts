import { UserInbounds } from "./User";

export type UserTemplate = {
  id: number;
  name: string;
  data_limit: number | null;
  expire_duration: number | null;
  username_prefix: string | null;
  username_suffix: string | null;
  inbounds: UserInbounds;
};

export type UserTemplateCreate = {
  name: string;
  data_limit?: number | null;
  expire_duration?: number | null;
  username_prefix?: string | null;
  username_suffix?: string | null;
  inbounds?: UserInbounds;
};

export type UserTemplateModify = Partial<UserTemplateCreate>;
