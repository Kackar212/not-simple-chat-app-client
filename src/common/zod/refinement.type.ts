import { z } from "zod";

export type Refinement<Arg> = (
  arg: Arg,
  ctx: z.RefinementCtx
) => void;
