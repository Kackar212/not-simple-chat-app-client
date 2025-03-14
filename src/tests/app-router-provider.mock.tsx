import { Params } from "next/dist/server/request/params";
import { SearchParams } from "next/dist/server/request/search-params";
import {
  AppRouterContext,
  AppRouterInstance,
  NavigateOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  PathParamsContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

export type AppRouterProviderMockProps = {
  router?: Partial<AppRouterInstance>;
  params?: Params;
  pathname?: string;
  searchParams?: string;
  children: React.ReactNode;
};

export const location = {
  href: "",
};

export const AppRouterProviderMock = ({
  router = {},
  params = {},
  searchParams = "",
  pathname = "/channels/me/friends",
  children,
}: AppRouterProviderMockProps): React.ReactNode => {
  const mockedRouter: AppRouterInstance = {
    back: jest.fn(),
    forward: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    ...router,
  };

  const url = new URL(pathname, process.env.NEXT_PUBLIC_APP_URL);

  return (
    <PathParamsContext.Provider value={params}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider
          value={new ReadonlyURLSearchParams(searchParams)}
        >
          <AppRouterContext.Provider value={mockedRouter}>
            {children}
          </AppRouterContext.Provider>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </PathParamsContext.Provider>
  );
};
