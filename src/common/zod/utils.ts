import { Refinement } from "@common/zod";
import { z } from "zod";

export const passwordMatchRefinement: (
  newPasswordConfirmation: string
) => Refinement<{
  newPassword: string;
  newPasswordConfirmation: string;
}> = (newPasswordConfirmation: string) => (schema, ctx) => {
  if (schema.newPassword === schema.newPasswordConfirmation) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Passwords dont match!",
    params: {
      name: "newPasswordConfirmation",
    },
    path: [newPasswordConfirmation],
  });
};
