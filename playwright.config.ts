import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://southside.brandonslab.work',
    trace: 'on-first-retry',
  },

  projects: [
    // Setup project - runs once to authenticate and save state
    {
      name: 'setup',
      testMatch: /auth\.(setup|manual)\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Main tests - use saved authentication state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load saved authentication state
        storageState: 'tests/.auth/user.json',
      },
      // Depend on setup project
      dependencies: ['setup'],
    },
  ],

  // No webServer needed - testing against production URL
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'https://southside.brandonslab.work',
  //   reuseExistingServer: !process.env.CI,
  // },
});
