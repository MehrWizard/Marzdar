export type Status =
  | "active"
  | "disabled"
  | "limited"
  | "expired"
  | "on_hold"
  | "error"
  | "connecting"
  | "connected";
export type ProxyKeys = ("vmess" | "vless" | "trojan" | "shadowsocks")[];
export type ProxyType = {
  vmess?: {
    id?: string;
  };
  vless?: {
    id?: string;
    flow?: string;
  };
  trojan?: {
    password?: string;
  };
  shadowsocks?: {
    password?: string;
    method?: string;
  };
};

export type DataLimitResetStrategy =
  | "no_reset"
  | "day"
  | "week"
  | "month"
  | "year";

export type UserInbounds = {
  [key: string]: string[];
};
export type NextPlan = {
  data_limit?: number | null;
  expire?: number | null;
  add_remaining_traffic: boolean;
  fire_on_either: boolean;
};

export type User = {
  proxies: ProxyType;
  expire: number | null;
  data_limit: number | null;
  data_limit_reset_strategy: DataLimitResetStrategy;
  on_hold_expire_duration: number | null;
  lifetime_used_traffic: number;
  username: string;
  used_traffic: number;
  status: Status;
  links: string[];
  subscription_url: string;
  inbounds: UserInbounds;
  note: string;
  online_at: string;
  sub_updated_at?: string | null;
  sub_last_user_agent?: string | null;
  created_at?: string | null;
  auto_delete_in_days?: number | null;
  admin?: {
    username: string;
    is_sudo: boolean;
  } | null;
  next_plan?: NextPlan | null;
};

export type UserCreate = Pick<
  User,
  | "inbounds"
  | "proxies"
  | "expire"
  | "data_limit"
  | "data_limit_reset_strategy"
  | "on_hold_expire_duration"
  | "username"
  | "status"
  | "note"
> & {
  next_plan?: NextPlan | null;
};

export type UserApi = {
  discord_webook: string;
  is_sudo: boolean;
  telegram_id: number | string;
  username: string;
}

export type UseGetUserReturn = {
  userData: UserApi;
  getUserIsPending: boolean;
  getUserIsSuccess: boolean;
  getUserIsError: boolean;
  getUserError: Error | null;
}