import { QueryError } from "@common/api";
import { Status } from "@common/enums";
import { Statuses } from "@common/hooks/query/statuses.type";

export type QueryResultAborted<ResponseError extends QueryError<any> | null> =
  Omit<Statuses, "isAborted"> & {
    data: undefined;
    error: ResponseError;
    isAborted: true;
    status: Status.Aborted;
    errorMessage: string;
    successMessage: string;
  };

export type QueryResultError<ResponseError extends QueryError<any> | null> =
  Omit<Statuses, "isError"> & {
    data: undefined;
    error: ResponseError;
    isError: true;
    status: Status.Error;
    errorMessage: string;
    successMessage: string;
  };

export type QueryResultSuccess<Response> = {
  data: NonNullable<Response>;
  error: null;
  isError: false;
  status: Status.Success;
  errorMessage: string;
  successMessage: string;
  isSuccess: true;
} & Omit<Statuses, "isSuccess">;

export type QueryResultInit = Omit<Statuses, "isUninitialized"> & {
  data: undefined;
  error: null;
  isError: false;
  status: Status.Uninitialized;
  errorMessage: string;
  successMessage: string;
  isUninitialized: true;
};

export type QueryResultLoading = Omit<Statuses, "isLoading"> & {
  data: undefined;
  error: null;
  isError: false;
  status: Status.Loading;
  errorMessage: string;
  successMessage: string;
  isLoading: true;
};

export type QueryResultPending<
  Response,
  ResponseError extends QueryError<any> | null
> = Omit<Statuses, "isPending"> & {
  data: Response;
  error: ResponseError | null;
  isError: boolean;
  status: Status.Pending;
  errorMessage: string;
  successMessage: string;
  isPending: true;
};

export type QueryResult<
  Response,
  ResponseError extends QueryError<any> | null
> =
  | QueryResultAborted<ResponseError>
  | QueryResultError<ResponseError>
  | QueryResultSuccess<Response>
  | QueryResultInit
  | QueryResultPending<Response, ResponseError>
  | QueryResultLoading;
