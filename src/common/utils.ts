"use client";

import { User } from "@common/api/schemas/user.schema";
import { InfiniteData } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { MessagesResponseWithCursor } from "./api/schemas/message.schema";
import { ApiError, QueryResponse } from "./api";

export function isIterable<T>(value: object): value is Iterable<T> {
  return typeof Reflect.get(value, Symbol.iterator) === "function";
}

export function toArray<T>(arrayLike: ArrayLike<T>): T[] {
  if (typeof arrayLike !== "object") {
    throw new Error("arrayLike must be of type ArrayLike");
  }

  if (isIterable(arrayLike)) {
    return Array.from(arrayLike) as T[];
  }

  const arr = [];

  for (let index = 0; index < arrayLike.length - 1; index++) {
    arr.push(arrayLike[index]);
  }

  return arr;
}

export function getAriaCurrent(
  currentPathname: string,
  linkPathname?: string | null
) {
  return currentPathname === linkPathname ? "page" : false;
}

export function getRandomUUID() {
  const url = URL.createObjectURL(new Blob());

  URL.revokeObjectURL(url);

  return url.substring(url.length - 36);
}

export function getFileSizeWithUnit(
  bytes: number
): `${number} ${"B" | "KB" | "MB"}` {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const size = {
    megabytes: Number((bytes / 1024 ** 2).toFixed(2)),
    kilobytes: Number((bytes / 1024).toFixed(2)),
  };

  if (Math.trunc(size.megabytes) > 0) {
    return `${size.megabytes} MB`;
  }

  return `${size.kilobytes} KB`;
}

export async function download(url: string, name: string = "") {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const fileUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.download = name;
    anchor.href = fileUrl;
    anchor.className = "sr-only";
    anchor.onclick = () => {
      anchor.remove();
    };

    document.body.appendChild(anchor);

    anchor.click();
  } catch {
    return true;
  }
}

export function getPage(
  pages: InfiniteData<
    QueryResponse<MessagesResponseWithCursor, ApiError>
  >["pages"],
  messageId: number
) {
  const result = pages
    .map((page) => [
      page,
      page.data?.messages.findIndex(({ id }) => messageId === id),
    ])
    .find(([_page, messageIndex]) => messageIndex !== -1) as [
    QueryResponse<MessagesResponseWithCursor, ApiError>,
    number
  ];

  return (
    result || [
      {
        data: {
          messages: [],
          cursor: null,
          hasNextCursor: false,
          hasPreviousCursor: false,
        },
      },
      -1,
    ]
  );
}

export interface MicrophoneEvents {
  speaking: (stopped: boolean) => void;
}

export function createImagePlaceholder(base64?: string | null) {
  if (typeof base64 === "undefined") {
    return;
  }

  return `data:image/webp;base64,${base64}` as const;
}

export function _plural(
  singular: string,
  suffixes: Partial<Record<Intl.LDMLPluralRule, string>>,
  count: number
) {
  const pluralRules = new Intl.PluralRules("en-US");
  const pluralRule = pluralRules.select(count);

  if (pluralRule === "one") {
    return singular;
  }

  return singular + suffixes[pluralRule];
}

export const formatCount = (count: number, word: (count: number) => string) => {
  return `There ${plural.toBe(count)} ${count} ${word(count)}`;
};

export const plural = {
  toBe(count: number) {
    return count === 1 ? "is" : "are";
  },
  server(count: number) {
    return _plural("server", { other: "s" }, count);
  },
  member(count: number) {
    return _plural("member", { other: "s" }, count);
  },
  friend(count: number) {
    return _plural("friend", { other: "s" }, count);
  },
  channel(count: number) {
    return _plural("channel", { other: "s" }, count);
  },
  reaction(count: number) {
    _plural("reaction", { other: "s" }, count);
  },
};

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
