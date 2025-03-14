import { ApiError, QueryError } from "@common/api";

export class NotFoundError extends Error {
  constructor({ error }: QueryError<ApiError>) {
    super("not found", { cause: error });
  }
}

export function notFoundError(error: QueryError<ApiError>) {
  return new NotFoundError(error);
}
