import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { Dispatch, useCallback, useRef, useState, useTransition } from "react";

interface UseRedirectProps extends NavigateOptions {
  to: string;
  timeoutMs?: number;
  push?: boolean;
}

export function useRedirect({
  push = true,
  to,
  timeoutMs,
  ...options
}: UseRedirectProps) {
  const router = useRouter();
  const redirectTimeoutId = useRef<number>(-1);
  const [isPending, startTransition] = useTransition();

  const redirect = useCallback(
    (dispatch?: () => Promise<void> | void) => {
      if (redirectTimeoutId.current !== -1) {
        return;
      }

      startTransition(async () => {
        await new Promise(async (resolve) => {
          await dispatch?.();

          redirectTimeoutId.current = window.setTimeout(() => {
            if (!push) {
              router.replace(to, options);
            }

            if (push) {
              router.push(to, options);
            }

            resolve(clearTimeout(redirectTimeoutId.current));
          }, timeoutMs);
        });
      });
    },
    [timeoutMs, push, router, to, options]
  );

  return { isRedirecting: isPending, redirect };
}
