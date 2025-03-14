const globalOptions: {
  baseUrl: string;
  options: RequestInit;
} = {
  baseUrl: typeof window !== "undefined" ? window.location.origin : "",
  options: {
    headers: {},
  },
};

interface GlobalQueryOptions {
  baseUrl: string;
  options: RequestInit;
}

interface QueryOptions<T = string, ResponseType = any, RequestData = any>
  extends RequestInit {
  url: T;
  params?: Record<string, string | number | undefined>;
  query?: Record<string, string | number | null | undefined | boolean>;
  cookies?: Record<string, string | void>;
  parse?: (data: ResponseType) => ResponseType;
  tag?: (requestData: RequestData) => string;
  successMessage?: string;
  errorMessage?: string;
}

export type QueryFetchError = {
  type: ErrorType.Fetch;
  error: unknown;
  _isQueryError: true;
};
export type QueryResponseStatusError<T> = {
  type: ErrorType.ResponseStatus;
  error: T;
  _isQueryError: true;
};
export type QueryResponseError = {
  type: ErrorType.Response;
  error: unknown;
  _isQueryError: true;
};

export type QueryError<T> =
  | QueryFetchError
  | QueryResponseStatusError<T>
  | QueryResponseError;

type TransformFn<T, TransformedError> = (
  queryError: QueryError<T>
) => TransformedError;

type QueryResponseFail<ResponseError> = {
  data: undefined;
  error: QueryError<ResponseError>;
  status: {
    errorMessage: string;
    isError: true;
    isSuccess: false;
    successMessage: string;
  };
};

type QueryResponseSuccess<ResponseType> = {
  data: ResponseType;
  error: null;
  status: {
    errorMessage: string;
    isError: false;
    isSuccess: true;
    successMessage: string;
  };
};

export type QueryResponse<ResponseType, ResponseError> =
  | QueryResponseFail<ResponseError>
  | QueryResponseSuccess<ResponseType>;

export enum ErrorType {
  ResponseStatus,
  Fetch,
  Response,
}

export const defaultRequestStatus = {
  isError: false,
  isSuccess: false,
  errorMessage: "",
  successMessage: "",
} as const;

export const defaultResult = {
  data: undefined,
  error: null,
  status: defaultRequestStatus,
} as const;

async function handleResponse<
  ResponseType,
  ResponseError,
  Endpoint extends string = string
>(
  this: any,
  response: Response,
  { parse = (data) => data, ...config }: QueryOptions<Endpoint, ResponseType>
): Promise<QueryResponse<ResponseType, ResponseError>> {
  try {
    const data = await response.json();

    if (response.status >= 399 && response.status <= 599) {
      const error = {
        type: ErrorType.ResponseStatus,
        error: data,
        _isQueryError: true,
      } as const;

      return {
        ...defaultResult,
        error,
        status: {
          ...defaultResult.status,
          errorMessage: this.errorMessageFactory(error, config),
          isError: true,
        },
      };
    }

    const parsedData = parse(data);

    return {
      ...defaultResult,
      status: {
        ...defaultResult.status,
        isSuccess: true,
        successMessage: this.successMessageFactory(data, config),
      },
      data: parsedData,
    };
  } catch (nativeError) {
    console.error(nativeError);

    const error = {
      type: ErrorType.Response,
      error: nativeError,
      _isQueryError: true,
    } as const;

    return {
      ...defaultResult,
      error,
      status: {
        ...defaultResult.status,
        errorMessage: this.errorMessageFactory(error, config) as string,
        isError: true,
      },
    };
  }
}

type QueryFactory<RequestData, ResponseType, Endpoint> = (
  requstData: RequestData
) => QueryOptions<Endpoint, ResponseType, RequestData>;
export type QueryFunction<RequestData, ResponseError, ResponseType> = ((
  requestData: RequestData
) => Promise<QueryResponse<ResponseType, ResponseError>>) & {
  abortController: AbortController;
  revalidate: (requestData: RequestData) => void;
};

interface Query<Endpoint> {
  errorMessageFactory: (
    _queryError: any,
    _config: QueryOptions<Endpoint>
  ) => string;
  successMessageFactory: (
    _data: any,
    _config: QueryOptions<Endpoint>
  ) => string;
  getNormalizedHeaders(headers: HeadersInit | undefined): Headers;
  create<RequestData, ResponseType, ResponseError>(
    queryFactory: QueryFactory<RequestData, ResponseType, Endpoint>
  ): QueryFunction<RequestData, ResponseError, ResponseType> & {
    abortController: AbortController;
  };
  createErrorMessageFactory(
    factory: (queryError: any, _config: QueryOptions<Endpoint>) => string
  ): void;
  createSuccessMessageFactory(
    factory: (data: any, config: QueryOptions<Endpoint>) => string
  ): void;
  global(options: GlobalQueryOptions): void;
  isQueryError<T>(error: any): error is QueryError<T>;
}

interface CreateRequestURLProps {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  query?: Record<string, string | number | null | undefined | boolean>;
  base?: string;
}

export const createURL = ({
  endpoint,
  base,
  params = {},
  query = {},
}: CreateRequestURLProps) => {
  let requestEndpoint = endpoint;

  Object.keys(query).forEach((key) => {
    if (typeof query[key] !== "undefined") {
      query[key] = String(query[key]);

      return;
    }

    delete query[key];
  });

  const urlSearchParams = new URLSearchParams(query as Record<string, string>);

  Object.entries(params).forEach(([paramName, paramValue]) => {
    requestEndpoint = requestEndpoint.replace(
      new RegExp(`\\[${paramName}\\]`),
      !paramValue ? "" : String(paramValue)
    );
  });

  const requestUrl = new URL(requestEndpoint, base);
  requestUrl.search = urlSearchParams.toString();

  return requestUrl;
};

export function createQuery<Endpoint extends string>(): Query<Endpoint> {
  const query: Query<Endpoint> = {
    errorMessageFactory: (_queryError: any, _config: QueryOptions<Endpoint>) =>
      "",
    successMessageFactory: (_data: any, _config: QueryOptions<Endpoint>) => "",
    getNormalizedHeaders(headers) {
      if (!headers) {
        return new Headers();
      }

      if (typeof headers === "object") {
        return new Headers(headers);
      }

      if (Array.isArray(headers)) {
        return new Headers(Object.fromEntries(headers));
      }

      return headers;
    },
    create<RequestData, ResponseType, ResponseError>(
      queryFactory: QueryFactory<RequestData, ResponseType, Endpoint>
    ): QueryFunction<RequestData, ResponseError, ResponseType> {
      const abort = {
        controller: new AbortController(),
      };

      const queryFunction = async (requestData: RequestData) => {
        const requestOptions = queryFactory(requestData);
        const cookies = Object.entries(requestOptions.cookies || {}).reduce(
          (serializedCookies, [cookieName, cookieValue]) => {
            if (typeof cookieValue === "undefined") {
              return serializedCookies;
            }

            serializedCookies += `${cookieName}=${cookieValue};`;

            return serializedCookies;
          },
          ""
        );

        const { options } = globalOptions;
        const { headers } = options;

        const globalNormalizedHeaders = this.getNormalizedHeaders(headers);
        const requestNormalizedHeaders = this.getNormalizedHeaders(
          requestOptions.headers
        );
        const normalizedHeaders = this.getNormalizedHeaders([
          ...globalNormalizedHeaders,
          ...requestNormalizedHeaders,
        ]);

        normalizedHeaders.set("Cookie", cookies);

        if (requestOptions.body instanceof FormData) {
          normalizedHeaders.delete("content-type");
        }

        const config = {
          ...options,
          ...requestOptions,
          headers: normalizedHeaders,
          signal: abort.controller.signal,
        };

        const { params, url: endpoint, query: searchParams } = config;

        try {
          const response = await fetch(
            new Request(
              createURL({
                endpoint,
                params,
                query: searchParams,
                base: globalOptions.baseUrl,
              }).toString(),
              config
            )
          );

          const handler = handleResponse<ResponseType, ResponseError, Endpoint>;

          const result = await handler.call(query, response, config);

          return result;
        } catch (fetchError) {
          console.error(fetchError);

          const error = {
            type: ErrorType.Fetch,
            error: fetchError,
            _isQueryError: true,
          } as const;

          return {
            ...defaultResult,
            error,
            errorMessage: this.errorMessageFactory(error, config),
            isError: true,
          };
        }
      };

      Object.defineProperty(queryFunction, "abortController", {
        value: abort.controller,
        configurable: true,
        writable: true,
      });

      return new Proxy(
        queryFunction as QueryFunction<
          RequestData,
          ResponseError,
          ResponseType
        >,
        {
          apply(target, thisArg, args: [RequestData]) {
            abort.controller = new AbortController();

            Object.defineProperty(target, "abortController", {
              value: abort.controller,
            });

            return target.bind(thisArg)(...args);
          },
        }
      );
    },
    createErrorMessageFactory(
      factory: (queryError: any, _config: QueryOptions<Endpoint>) => string
    ) {
      this.errorMessageFactory = factory;
    },
    createSuccessMessageFactory(
      factory: (data: any, config: QueryOptions<Endpoint>) => string
    ) {
      this.successMessageFactory = factory;
    },
    global(options: GlobalQueryOptions) {
      Object.assign(globalOptions, options);
    },
    isQueryError<T>(error: any): error is QueryError<T> {
      return "_isQueryError" in error;
    },
  };

  return query;
}
