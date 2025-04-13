"use client";

import { getAriaCurrent } from "@common/utils";
import _Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export interface LinkProps
  extends PropsWithChildren<Parameters<typeof _Link>[0]> {
  optionalPathSegments?: unknown[];
}

export function Link({
  children,
  optionalPathSegments = [],
  ...attrs
}: LinkProps) {
  const { href, className } = attrs;
  const isHrefString = typeof href === "string";
  const normalizedHref = isHrefString
    ? new URL(href, process.env.NEXT_PUBLIC_APP_URL)
    : href;

  const currentPathname = usePathname();

  if (normalizedHref.href?.includes("blob:")) {
    return (
      <a {...attrs} href={normalizedHref.href} className={className}>
        {children}
      </a>
    );
  }

  optionalPathSegments.filter(Boolean).forEach((optionalPathSegment) => {
    if (normalizedHref.pathname && !normalizedHref.pathname.endsWith("/")) {
      normalizedHref.pathname += "/";
    }

    normalizedHref.pathname += `${optionalPathSegment}`;
  });

  const ariaCurrent = getAriaCurrent(currentPathname, normalizedHref.pathname);

  return (
    <_Link
      {...attrs}
      aria-current={ariaCurrent}
      href={href}
      className={className}
    >
      {children}
    </_Link>
  );
}
