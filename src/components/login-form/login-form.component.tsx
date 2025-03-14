"use client";

import { passwordSchema, usernameSchema } from "@common/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { createConfig } from "@common/use-form.config";
import { AuthForm } from "@components/auth-form/auth-form.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { FormField } from "@components/form-field/form-field.component";
import { signIn } from "@common/api";
import { Button } from "@components/button/button.component";
import { Link } from "@components/link/link.component";
import { InputType } from "@common/constants";
import LockIcon from "/public/assets/icons/padlock-closed.svg";
import { InputName } from "@common/enums";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { AuthAction } from "@common/auth/auth-action.enum";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BaseSyntheticEvent,
  startTransition,
  useEffect,
  useTransition,
} from "react";
import { TextLink } from "@components/link/text-link.component";
import { Redirect } from "@components/redirect/redirect.component";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { socket } from "@common/socket";
import UserIcon from "/public/assets/icons/user.svg";
import { getQueryClient } from "@/app/get-query-client";

const SignInSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
  })
  .required();

type SignInSchemaType = z.infer<typeof SignInSchema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const { token } = useParams();

  const useFormData = useForm<SignInSchemaType>(createConfig(SignInSchema));
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    dispatch,
    auth: { isLoggedIn },
  } = useSafeContext(authContext);
  const { mutateAsync, isPending, data } = useMutation({ mutationFn: signIn });

  const { isRedirecting, redirect } = useRedirect({
    to: "/channels/me/friends",
    timeoutMs: 3000,
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.refresh();
    }
  }, [isLoggedIn, router]);

  const submit = (e: BaseSyntheticEvent) => {
    e.preventDefault();

    useFormData.handleSubmit(async (data, e) => {
      if (isRedirecting) {
        return;
      }

      const { data: signInData } = await mutateAsync(data);

      if (!signInData) {
        return;
      }

      redirect(() => {
        queryClient.clear();
        useFormData.reset();

        socket.emit("status", { status: ActivityStatus.Online });

        dispatch({
          type: AuthAction.SignIn,
          payload: signInData,
        });
      });
    })(e);
  };

  return (
    <FormProvider {...useFormData}>
      <AuthForm onSubmit={submit} result={data?.status}>
        <FormHeader Heading="h1">Sign in</FormHeader>
        <Redirect isRedirecting={isRedirecting} />
        <FormField
          type={InputType.Text}
          label="Username"
          name={InputName.Username}
          Icon={<UserIcon />}
        />
        <FormField
          type={InputType.Password}
          label="Password"
          name={InputName.Password}
          Icon={<LockIcon />}
        />
        <div className="flex justify-center gap-4 w-full">
          <div className="w-full gap-6 flex items-center flex-col-reverse md:flex-row-reverse md:justify-between">
            <Button
              isLoading={isPending}
              className="ml-0 w-full justify-center md:w-fit"
              type="submit"
            >
              Log in
            </Button>
            <TextLink href="/auth/forgot-password" className="w-fit">
              Forgot password?
            </TextLink>
          </div>
        </div>
        <p className="flex gap-2 flex-col justify-center items-center text-white-500 mt-6 md:flex-row md:gap-3">
          Don&apos;t have an account?{" "}
          <TextLink href="/auth/register">Sign up</TextLink>
        </p>
      </AuthForm>
    </FormProvider>
  );
}
