import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roles = ['ADMIN', 'EDITOR'];
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

const AUTH_DIR = path.resolve(__dirname, '../playwright/.auth');

for (const role of roles) {
  setup(`Login check for ${role}`, async ({ page }) => {
    const user = process.env[`USER_${role}`];
    const pass = process.env[`PASS_${role}`];
    const domain = process.env.BASE_URL;

    const fileName = `${role.toLowerCase()}_${user?.replace(/[^a-z0-9]/gi, '_')}.json`;
    const authFile = path.join(AUTH_DIR, fileName);

    console.log(`--- DEBUG FOR ${role} ---`);
    console.log(`Target Auth File: ${authFile}`);

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    if (fs.existsSync(authFile)) {
      const stats = fs.statSync(authFile);
      if (Date.now() - stats.mtimeMs < SESSION_TIMEOUT_MS) {
        console.log(`[${role}] Session for ${user} is fresh.`);
        return;
      }
    }

    console.log(`[${role}] Logging in as ${user}...`);

    await page.goto(`${domain}/ui/`);
    await page.locator('#j_username').fill(user!);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('.vv-input-focused').waitFor({ state: 'visible' });
    await page.locator('.vv-input-focused').pressSequentially(pass!);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForURL(/.*ui.*/, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.context().storageState({ path: authFile });
    console.log(`[${role}] Session saved at: ${authFile}`);
  });
}
