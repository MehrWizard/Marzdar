import { z } from "zod";

export const AdminSchema = z.object({
  username: z.string().min(1, { message: "Required" }),
  is_sudo: z.boolean(),
  telegram_id: z.number().nullable().optional(),
  discord_webhook: z.string().nullable().optional(),
  users_usage: z.number().nullable().optional(),
});

export type Admin = z.infer<typeof AdminSchema>;

export const AdminCreateSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Required" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Only letters, numbers, underscores and hyphens allowed",
    }),
  password: z.string().min(1, { message: "Required" }),
  is_sudo: z.boolean().default(false),
  telegram_id: z.coerce.number().nullable().optional(),
  discord_webhook: z.string().nullable().optional(),
});

export type AdminCreate = z.infer<typeof AdminCreateSchema>;

export const AdminModifySchema = z.object({
  password: z.string().optional().or(z.literal("")),
  is_sudo: z.boolean(),
  telegram_id: z.coerce.number().nullable().optional(),
  discord_webhook: z.string().nullable().optional(),
});

export type AdminModify = z.infer<typeof AdminModifySchema>;
