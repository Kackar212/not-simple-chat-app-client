import "server-only";

import { headers } from "next/headers";
import { URL } from "url";

export async function getUrl() {
  const readonlyHeaders = await headers();
  const url = readonlyHeaders.get("referer");

  if (!url) {
    return null;
  }

  return new URL(url);
}
