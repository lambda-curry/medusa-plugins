/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false, isolatedModules: true }
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  verbose: false,
  collectCoverage: false,
  // Ignore compiled medusa build output
  testPathIgnorePatterns: ['/node_modules/', '/.medusa/'],
};


