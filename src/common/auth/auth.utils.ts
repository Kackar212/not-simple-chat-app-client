import { User } from "@common/api/schemas/user.schema";
import { SESSION_COOKIE_NAME } from "@common/constants";
import { cookies } from "next/headers";

export const getSessionId = async () => {
  const cookiesStore = await cookies();

  return cookiesStore.get(SESSION_COOKIE_NAME)?.value;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const cookiesStore = await cookies();

  return JSON.parse(cookiesStore.get("user")?.value || "null");
};
