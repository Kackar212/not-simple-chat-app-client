"use client";

import { signUp } from "@common/api";
import { InputType } from "@common/constants";
import { InputName } from "@common/enums";
import { Route } from "@common/route.enum";
import { createConfig } from "@common/use-form.config";
import { emailSchema, passwordSchema, usernameSchema } from "@common/zod";
import { displayNameSchema } from "@common/zod/display-name.schema";
import { AuthForm } from "@components/auth-form/auth-form.component";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Envelope, LockIcon } from "@components/icons";
import { Link } from "@components/link/link.component";
import { TextLink } from "@components/link/text-link.component";
import { Redirect } from "@components/redirect/redirect.component";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import UserIcon from "/public/assets/icons/user.svg";

const SignUpSchema = z
  .object({
    username: usernameSchema,
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .required();

type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export function RegisterForm() {
  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({ mutationFn: signUp });
  const useFormData = useForm<SignUpSchemaType>(createConfig(SignUpSchema));
  const { redirect, isRedirecting } = useRedirect({
    to: Route.Login,
    timeoutMs: 1000,
  });

  const onSubmit = useFormData.handleSubmit(async (data) => {
    const {
      status: { isSuccess },
    } = await mutateAsync(data);

    if (isSuccess) {
      useFormData.reset();

      redirect();
    }
  });

  return (
    <FormProvider {...useFormData}>
      <AuthForm onSubmit={onSubmit} result={data?.status}>
        <FormHeader Heading="h1">Sign up</FormHeader>
        <Redirect isRedirecting={isRedirecting} />
        <FormField
          type={InputType.Text}
          name={InputName.Username}
          label="Username"
          Icon={<UserIcon />}
          hint="This name will be used to identify you, if someone wants to send you friend request they need to use this name."
        />
        <FormField
          type={InputType.Text}
          name={InputName.DisplayName}
          label="Display name"
          Icon={<UserIcon />}
          hint="This name will be displayed in most cases instead of username, it can even contains emojis."
        />
        <FormField type="text" name="email" label="Email" Icon={<Envelope />} />
        <FormField
          type="password"
          name="password"
          label="Password"
          Icon={<LockIcon />}
        />

        <Button type="submit" isLoading={isLoading} className="ml-auto">
          Register
        </Button>
        <p className="flex gap-3 justify-center items-center text-white-500 mt-4">
          You already have an account?{" "}
          <TextLink href="/auth/login">Sign in</TextLink>
        </p>
      </AuthForm>
    </FormProvider>
  );
}
