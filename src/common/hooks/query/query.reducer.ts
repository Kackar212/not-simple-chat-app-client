import { QueryError } from "@common/api";
import { Status } from "@common/enums";
import { QueryResult } from "@common/hooks/query/query-result.type";
import { isAborted } from "zod";

type LoadingAction = {
  type: Status.Loading;
};

type UninitializedAction = {
  type: Status.Uninitialized;
};

type AbortedAction<ResponseError> = {
  type: Status.Aborted;
  payload: {
    error: ResponseError;
    errorMessage: string;
  };
};

type ErrorAction<ResponseError> = {
  type: Status.Error;
  payload: {
    error: ResponseError;
    errorMessage: string;
  };
};

type SuccessAction<Response> = {
  type: Status.Success;
  payload: {
    data: NonNullable<Response>;
    successMessage: string;
  };
};

type PendingAction = {
  type: Status.Pending;
};

const statuses = {
  isLoading: false,
  isUninitialized: false,
  isPending: false,
  isSuccess: false,
  isError: false,
  isAborted: false,
} as const;

export const initialState = {
  ...statuses,
  data: undefined,
  error: null,
  isError: false,
  status: Status.Uninitialized,
  errorMessage: "",
  successMessage: "",
  isUninitialized: true,
} as const;

export const queryReducer = <
  ResponseType,
  ResponseErr extends QueryError<any> | null
>(
  state: QueryResult<ResponseType, ResponseErr>,
  action:
    | LoadingAction
    | AbortedAction<ResponseErr>
    | ErrorAction<ResponseErr>
    | SuccessAction<ResponseType>
    | PendingAction
    | UninitializedAction
): QueryResult<ResponseType, ResponseErr> => {
  switch (action.type) {
    case Status.Loading: {
      return {
        ...state,
        ...statuses,
        status: Status.Loading,
        error: null,
        data: undefined,
        isLoading: true,
      } as const;
    }

    case Status.Aborted: {
      return {
        ...state,
        ...statuses,
        data: undefined,
        status: Status.Aborted,
        isAborted: true,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage,
      } as const;
    }

    case Status.Error: {
      return {
        ...state,
        ...statuses,
        data: undefined,
        status: Status.Error,
        isError: true,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage,
      } as const;
    }

    case Status.Success: {
      return {
        ...state,
        ...statuses,
        status: Status.Success,
        data: action.payload.data,
        isError: false,
        error: null,
        errorMessage: "",
        isSuccess: true as const,
        successMessage: action.payload.successMessage,
      } as const;
    }

    case Status.Pending: {
      return {
        ...state,
        ...statuses,
        status: Status.Pending,
        isPending: true,
        data: state.data as ResponseType,
      } as const;
    }

    case Status.Uninitialized: {
      return initialState;
    }

    default: {
      throw new Error(
        `Unknown action, expected one of ${Object.values(Status)}`
      );
    }
  }
};
