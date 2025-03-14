"use client";

import { forgotPassword } from "@common/api";
import { InputName } from "@common/enums";
import { createConfig } from "@common/use-form.config";
import { emailSchema } from "@common/zod";
import { AuthForm } from "@components/auth-form/auth-form.component";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { TextLink } from "@components/link/text-link.component";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BaseSyntheticEvent, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .required();

export function ForgotPasswordForm() {
  const { mutate, isPending, data } = useMutation({
    mutationFn: forgotPassword,
  });
  const useFormData = useForm<FormValues>(createConfig(ForgotPasswordSchema));
  const onSubmit = useFormData.handleSubmit(({ email }) => {
    mutate({ email });
  });

  const submit = useCallback(
    (e?: BaseSyntheticEvent<object, any, any>) => {
      onSubmit(e);
    },
    [onSubmit]
  );

  return (
    <FormProvider {...useFormData}>
      <AuthForm onSubmit={submit} result={data?.status}>
        <FormHeader Heading="h1">Forgot password</FormHeader>
        <FormField name={InputName.Email} label="Email" />

        <div className="flex justify-center gap-4 w-full">
          <div className="max-w-72 w-full gap-6 flex items-center flex-col-reverse md:flex-row-reverse md:justify-between">
            <Button
              type="submit"
              isLoading={isPending}
              className="ml-0 w-full justify-center md:w-fit"
            >
              Submit
            </Button>
            <TextLink href="login">Sign in</TextLink>
          </div>
        </div>
      </AuthForm>
    </FormProvider>
  );
}
