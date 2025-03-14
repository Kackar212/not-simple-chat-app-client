"use client";

import {
  UseMutationOptions,
  useMutation as _useMutation,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { defaultResult, QueryError, QueryResponse } from "../query.factory";
import { ApiError } from "../api.service";

export function useMutation<
  TData = unknown,
  TError = QueryError<ApiError>,
  TVariables = void,
  TContext = unknown
>(
  useMutationOptions: UseMutationOptions<
    QueryResponse<TData, TError>,
    TError,
    TVariables,
    TContext
  >
) {
  const mutation = _useMutation(useMutationOptions);

  return useMemo(
    () => ({
      ...mutation,
      isError: Boolean(mutation.data?.status.isError),
      error: mutation.data?.error,
      data: { ...defaultResult, ...mutation.data },
    }),
    [mutation]
  );
}
