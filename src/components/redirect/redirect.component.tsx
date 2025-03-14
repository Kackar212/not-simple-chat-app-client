import { Loader } from "@components/loader/loader.component";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { useEffect, useTransition } from "react";

interface RedirectProps {
  isRedirecting: boolean;
}

export function Redirect({ isRedirecting }: RedirectProps) {
  return (
    <div role="alert" className="text-white-500 flex justify-center">
      {isRedirecting && (
        <span className="flex gap-2">
          Redirecting <Loader />
        </span>
      )}
    </div>
  );
}
