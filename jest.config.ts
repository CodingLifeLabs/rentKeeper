import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^nanoid$": "<rootDir>/src/__mocks__/nanoid.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
};

export default config;
