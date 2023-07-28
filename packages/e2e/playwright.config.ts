import { defineConfig } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html']],
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,

  use: {
    baseURL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    // run traces on the first retry of a failed test
    trace: 'on-first-retry',
  },

  projects: [
    // this matches all tests ending with .setup.ts
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    // this project depends on the setup project and matches all tests ending with loggedin.spec.ts
    {
      name: 'e2e tests logged in',
      testMatch: '**/*loggedin.spec.ts',
      dependencies: ['setup'],
    },
    // this project runs all tests except the setup and logged in tests
    {
      name: 'e2e tests',
      testIgnore: ['**/*loggedin.spec.ts', '**/*.setup.ts'],
    },
  ],
  webServer: {
    command: 'mkdir -p playwright/.auth && yarn --cwd="../.." dev',
    port: 3000,
  },
});
