import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string(),
  color: z.string(),
  id: z.number(),
});

export type Role = z.infer<typeof RoleSchema>;
