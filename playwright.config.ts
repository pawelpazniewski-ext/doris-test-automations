import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [['html', { open: 'never' }]],
  timeout: 120_000,

  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: process.env.BASE_URL,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 30_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    launchOptions: {
      args: ['--deny-permission-prompts', '--disable-features=Translate,TranslationService,ChromeTranslate,TranslateWebPage', '--no-first-run', '--disable-first-run-ui', '--lang=en-US'],
    },
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
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
