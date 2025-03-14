import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string(),
  color: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;
