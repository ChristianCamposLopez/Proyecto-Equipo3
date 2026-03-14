module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/tests'],

  testMatch: ['**/*.test.ts', '**/*.test.tsx'],

  moduleFileExtensions: ['ts', 'js', 'json'],

  collectCoverage: true,

  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    'services/**/*.ts',
    'models/**/*.ts'
  ],

  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/test-env.ts'],

};