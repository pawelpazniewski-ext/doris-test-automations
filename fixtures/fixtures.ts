import { test as base, expect } from '@playwright/test';
import { EventPage } from '../src/pages/event.page.js';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { DocInfoPage } from '../src/pages/docInfo.page.js';
import { HomePage } from '../src/pages/home.page.js';
import { TemplatePage } from '../src/pages/template.page.js';
import { ApplicationPage } from '../src/pages/application.page.js';
import { ApplicationWizardPage } from '../src/pages/application-wizard.page.js';
import { RegulatoryObjectivePage } from '../src/pages/regulatory-objective.page.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getStoragePath = (role: string, userEmail: string | undefined) => {
  const cleanUser = userEmail?.replace(/[^a-z0-9]/gi, '_') || 'default';
  return path.resolve(__dirname, `../playwright/.auth/${role.toLowerCase()}_${cleanUser}.json`);
};

type MyFixtures = {
  loginAs: (role: 'admin' | 'editor') => Promise<void>;
  homePage: HomePage;
  docInfoPage: DocInfoPage;
  templatePage: TemplatePage;
  applicationPage: ApplicationPage;
  applicationWizardPage: ApplicationWizardPage;
  regulatoryObjectivePage: RegulatoryObjectivePage;
  eventPage: EventPage;
};

export const test = base.extend<MyFixtures>({
  loginAs: async ({ page }, use) => {
    const loginFn = async (role: 'admin' | 'editor') => {
      const email = role === 'admin' ? process.env.USER_ADMIN : process.env.USER_EDITOR;
      const storageState = getStoragePath(role, email);

      const auth = JSON.parse(await fs.readFile(storageState, 'utf8'));
      await page.context().addCookies(auth.cookies);

      await page.context().addInitScript((storage: any) => {
        if (storage) {
          storage.forEach((item: any) => window.localStorage.setItem(item.name, item.value));
        }
      }, auth.origins[0]?.localStorage);
    };
    await use(loginFn);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  docInfoPage: async ({ page }, use) => {
    await use(new DocInfoPage(page));
  },

  templatePage: async ({ page }, use) => {
    await use(new TemplatePage(page));
  },

  applicationPage: async ({ page }, use) => {
    await use(new ApplicationPage(page));
  },
  applicationWizardPage: async ({ page }, use) => {
    await use(new ApplicationWizardPage(page));
  },

  regulatoryObjectivePage: async ({ page }, use) => {
    await use(new RegulatoryObjectivePage(page));
  },

  eventPage: async ({ page }, use) => {
    await use(new EventPage(page));
  },
});

export { expect };
