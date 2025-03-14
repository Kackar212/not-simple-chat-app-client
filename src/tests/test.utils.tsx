import { act, render, RenderOptions } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";
import { loadEnvConfig } from "@next/env";
import { AppRouterProviderMock } from "./app-router-provider.mock";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Providers from "@/app/providers";

interface ProvidersProps {
  router?: Partial<AppRouterInstance>;
  pathname?: string;
  searchParams?: string;
  params?: Record<string, string | string[]>;
}

const AllTheProviders = ({
  children,
  router,
  params,
  searchParams,
  pathname,
}: PropsWithChildren<ProvidersProps>) => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);

  return (
    <AppRouterProviderMock
      router={router}
      params={params}
      searchParams={searchParams}
      pathname={pathname}
    >
      <Providers>{children}</Providers>
    </AppRouterProviderMock>
  );
};

const customRender = (
  ui: ReactNode,
  options: RenderOptions & { wrapperProps?: ProvidersProps } = {}
) =>
  act(() =>
    render(ui, {
      wrapper: (props) => (
        <AllTheProviders {...props} {...options.wrapperProps} />
      ),
      ...options,
    })
  );

export * from "@testing-library/react";

export { customRender as render };
