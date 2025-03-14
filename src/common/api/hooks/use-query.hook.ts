import {
  DefaultError,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  useQuery as _useQuery,
} from "@tanstack/react-query";
import { defaultResult, QueryResponse } from "../query.factory";
import { useMemo } from "react";

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(useQueryOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const query = _useQuery({
    ...useQueryOptions,
  });

  return useMemo(
    () =>
      ({
        ...query,
        data: {
          ...defaultResult,
          ...query.data,
        } as TData,
      } as const),
    [query]
  );
}
