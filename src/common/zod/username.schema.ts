import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(28)
  .regex(/^[a-zA-Z0-9]+$/, "must contain only numbers and english letters")
  .regex(/(.*[a-z]){3,}/i, "must contain at least 3 letters");
