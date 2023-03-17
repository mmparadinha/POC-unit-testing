export default {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleDirectories: ["node_modules", "src"],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.(spec|test).ts"],
  transform: {
    ".+\\.ts$": "ts-jest",
  },
};
