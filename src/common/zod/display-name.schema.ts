import { z } from "zod";

export const displayNameSchema = z
  .string()
  .trim()
  .regex(/(.*[a-z]){3,}/i, "must contain at least 3 letters")
  .min(3)
  .max(28);
