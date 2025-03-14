"use client";

import { resetPassword } from "@common/api";
import { createConfig } from "@common/use-form.config";
import { passwordSchema } from "@common/zod";
import { AuthForm } from "@components/auth-form/auth-form.component";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { passwordMatchRefinement } from "@common/zod/utils";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { TextLink } from "@components/link/text-link.component";
import { InputType } from "@common/constants";
import { LockIcon } from "@components/icons";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { useEffect } from "react";

interface ResetPasswordFormProps {
  resetPasswordToken?: string;
  isOldPasswordRequired?: boolean;
}

enum Input {
  NewPassword = "newPassword",
  NewPasswordConfirmation = "newPasswordConfirmation",
  oldPassword = "oldPassword",
}

const ResetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    newPasswordConfirmation: passwordSchema,
    oldPassword: passwordSchema.optional(),
  })
  .superRefine(passwordMatchRefinement(Input.NewPasswordConfirmation));

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordForm({
  resetPasswordToken,
  isOldPasswordRequired = false,
}: ResetPasswordFormProps) {
  const useFormData = useForm<ResetPasswordSchemaType>(
    createConfig(ResetPasswordSchema)
  );
  const {
    auth: { isLoggedIn },
  } = useSafeContext(authContext);

  const {
    isSuccess,
    isPending,
    data: { status },
    mutate,
  } = useMutation({
    mutationFn: resetPassword,
  });

  const onSubmit = useFormData.handleSubmit((data) => {
    mutate({
      newPassword: data.newPassword,
      oldPassword: data.oldPassword,
      resetPasswordToken,
    });
  });

  if (!isLoggedIn && isOldPasswordRequired) {
    return (
      <p className="flex size-full justify-center items-center">
        Link is invalid, check if link is matching the one sent to you, if it
        does then you can{" "}
        <TextLink href="/auth/forgot-password">
          request new reset password link
        </TextLink>
        . If it does not then click link sent to your inbox and reset your
        password there.
      </p>
    );
  }

  return (
    <FormProvider {...useFormData}>
      <AuthForm onSubmit={onSubmit} result={status}>
        <FormHeader Heading="h1">Reset password</FormHeader>
        {isOldPasswordRequired && (
          <FormField
            type={InputType.Password}
            label="Old password"
            name={Input.oldPassword}
            Icon={<LockIcon />}
          />
        )}
        <FormField
          type={InputType.Password}
          label="New password"
          name={Input.NewPassword}
          Icon={<LockIcon />}
        />
        <FormField
          type={InputType.Password}
          label="Confirm new password"
          name={Input.NewPasswordConfirmation}
          Icon={<LockIcon />}
        />
        <div className="flex flex-row-reverse items-center">
          <Button isLoading={isPending} type="submit">
            <span>Reset password</span>
          </Button>
          {!isLoggedIn && isSuccess && (
            <TextLink href="login">Sign in</TextLink>
          )}
        </div>
      </AuthForm>
    </FormProvider>
  );
}
