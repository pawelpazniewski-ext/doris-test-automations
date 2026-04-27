import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 120_000,

  use: {
    baseURL: process.env.BASE_URL,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 30_000,
    trace: 'on-first-retry',
    video: 'off',
    screenshot: 'only-on-failure',
  },

  expect: {
    timeout: 30_000,
  },

  projects: [
    {
      name: 'setup',
      testDir: './utils',
      testMatch: /utils\/auth\.ts/,
    },
    {
      name: 'chromium',
      testDir: './tests',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
