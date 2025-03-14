import { ApiError, ApiErrorCode } from "./api.service";
import {
  ErrorType,
  QueryError,
  QueryResponseStatusError,
} from "./query.factory";

export function isResponseStatusError(
  error: QueryError<ApiError> | null | undefined,
  type?: ApiErrorCode
): error is QueryResponseStatusError<ApiError> {
  if (!error) {
    return false;
  }

  if (error.type !== ErrorType.ResponseStatus) {
    return false;
  }

  if (!type) {
    return true;
  }

  return error.error.error === type || error.error.code === type;
}

export function isNotFound(error: QueryError<ApiError> | null | undefined) {
  return isResponseStatusError(error, ApiErrorCode.NotFound);
}

export function isUnauthorized(error: QueryError<ApiError> | null | undefined) {
  return isResponseStatusError(error, ApiErrorCode.Unauthorized);
}

export function isForbidden(error: QueryError<ApiError> | null | undefined) {
  return isResponseStatusError(error, ApiErrorCode.Forbidden);
}

export function isInvalidToken(error: QueryError<ApiError> | null | undefined) {
  return isResponseStatusError(error, ApiErrorCode.InvalidToken);
}

export function isUserBlocked(error: QueryError<ApiError> | null | undefined) {
  return isResponseStatusError(error, ApiErrorCode.UserBlocked);
}
