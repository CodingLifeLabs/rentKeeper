import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transformIgnorePatterns: [
    "node_modules/(?!(@supabase)/)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^nanoid$": "<rootDir>/src/__mocks__/nanoid.ts",
    "^next/headers$": "<rootDir>/__mocks__/next-headers.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
};

export default config;
