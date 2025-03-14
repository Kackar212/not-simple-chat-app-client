"use client";

import { Link } from "@components/link/link.component";
import { ActivateAccountResult } from "./activate-account-result.component";
import { Route } from "@common/route.enum";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { useEffect } from "react";
import { TextLink } from "@components/link/text-link.component";
import { Loader } from "@components/loader/loader.component";

export function ActivateAccount() {
  const { isRedirecting, redirect } = useRedirect({
    to: Route.Login,
    timeoutMs: 5000,
  });

  useEffect(() => {
    redirect();
  }, [redirect]);

  return (
    <ActivateAccountResult
      isSuccess={true}
      heading="Your account has been activated!"
    >
      <div>
        Now you will be redirected to login page in 5 seconds or go{" "}
        <TextLink href="/auth/login">there</TextLink> yourself.
        {isRedirecting && (
          <span className="flex justify-center font-medium leading-none h-6 gap-2 mt-4">
            Redirecting
            <Loader />
          </span>
        )}
      </div>
    </ActivateAccountResult>
  );
}
