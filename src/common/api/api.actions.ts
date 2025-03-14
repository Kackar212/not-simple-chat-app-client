"use server";

import { QueryFunction } from "@common/api/query.factory";
import { revalidateTag } from "next/cache";

export async function revalidateQuery(tag: string) {
  revalidateTag(tag);
}
