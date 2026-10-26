/**
 * Deliberately NOT jest-expo: everything under test here (lib/walk/) is
 * plain TypeScript with no React Native or Expo imports, so the heavy
 * RN-environment preset buys nothing. (jest-expo also has no stable
 * release for SDK 57 yet, only canary builds — another reason to skip it.)
 * If component tests get added later, reconsider then.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/lib/walk/**/*.test.ts'],
};
