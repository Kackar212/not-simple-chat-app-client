import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  rootDir: __dirname,
  coverageProvider: "v8",
  testEnvironment: "jest-fixed-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
};

const jestConfigWithOverrides = async (...args: any[]) => {
  const configFn = createJestConfig(config);
  // @ts-ignore
  const res = await configFn(...args);

  res.moduleNameMapper = {
    "\\.svg": "<rootDir>/src/tests/svgr.mock.ts",
    ...res.moduleNameMapper,
  };

  return res;
};

export default jestConfigWithOverrides;
