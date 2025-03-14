import { z } from "zod";

export const passwordSchema = z
  .string()
  .trim()
  .min(8)
  .max(32)
  .regex(/[A-Z]{1,}/g, "must contain at least one uppercase letter")
  .regex(/[a-z]{1,}/g, "must contain at least one lowercase letter")
  .regex(/[0-9]{1,}/g, "must contain at least one digit")
  .regex(
    /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]{3,}/g,
    "must contain minimum 3 special characters"
  );
