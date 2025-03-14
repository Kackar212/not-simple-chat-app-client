import { getProfile } from "@common/api";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { useMemo, useState } from "react";

interface UseGetProfileProps {
  userId: number;
  serverId?: number;
  isOpen?: boolean;
}

export function useGetProfile({
  userId,
  serverId,
  isOpen,
}: UseGetProfileProps) {
  const queryKey = useMemo(
    () => ["profile", userId, serverId],
    [userId, serverId]
  );

  const {
    refetch,
    data: { data },
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => getProfile({ userId, serverId }),
    enabled: isOpen === true,
  });

  return { data, isLoading, queryKey, refetch };
}
