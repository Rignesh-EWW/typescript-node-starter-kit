module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@scripts/(.*)$': '<rootDir>/scripts/$1',
  },
  moduleFileExtensions: ["ts", "js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
