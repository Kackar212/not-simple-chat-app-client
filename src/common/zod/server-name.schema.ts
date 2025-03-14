import { z } from "zod";

export const serverNameSchema = z.string().trim().min(3).max(32);
