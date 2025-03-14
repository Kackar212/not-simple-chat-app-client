import { z } from "zod";

export const displayNameSchema = z.string().trim().min(3).max(28);
