/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./src/Config/jestSetup.ts"],
  globalTeardown: "<rootDir>/globalteardown.ts",
};
