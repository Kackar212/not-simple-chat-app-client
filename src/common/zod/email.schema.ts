import { z } from "zod";

export const emailSchema = z
  .string()
  .email("address is invalid, valid example: example@email.com");
