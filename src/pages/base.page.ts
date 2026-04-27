import { expect, Locator, Page } from '@playwright/test';

export abstract class BasePage {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async switchUser(role: 'ADMIN' | 'EDITOR'): Promise<void> {
    const user = process.env[`USER_${role}`];
    const pass = process.env[`PASS_${role}`];
    const domain = process.env.BASE_URL;

    if (!user || !pass) {
      throw new Error(`Credentials for role ${role} not found in process.env`);
    }

    console.log(`--- Switching user to ${role} (${user}) ---`);

    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
    await this.page.goto(`${domain}/ui/`);

    await this.page.locator('#j_username').fill(user);
    await this.button('Continue').click();

    const passwordInput = this.page.locator('.vv-input-focused');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.pressSequentially(pass);

    await this.button('Log In').click();
    await this.page.waitForURL(/.*ui.*/, { waitUntil: 'networkidle', timeout: 60_000 });
    console.log(`Successfully switched and logged in as ${role}`);
  }

  public async verifyVisibilityWithReload(locator: Locator, timeout = 15_000): Promise<void> {
    await expect(async () => {
      const isVisible = await locator.isVisible();
      if (!isVisible) {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
      }
      await expect(locator).toBeVisible({ timeout: 2000 });
    }).toPass({
      timeout: timeout,
      intervals: [1000],
    });
  }

  get searchInput(): Locator {
    return this.page.getByRole('search');
  }
  //#region fill forms

  public async fillFormByTemplate(formData: any, fields: any): Promise<void> {
    const formFieldsStore = FormFieldsStore.getInstance();

    for (const field of fields) {
      const value = formData[field.key];
      if (!value) continue;
      console.log(`[DEBUG] Filling field: "${field.label}" (Type: ${field.type}) with value: "${value}"`);

      if (field.type === 'value') {
        await this.fillValueField(field.label, value);
      } else if (field.type === 'radio') {
        await this.checkRadio(field.label, value);
      } else if (field.type === 'dropdown') {
        await this.selectDropdownValue(field.label, value);
      } else if (field.type === 'multiselect') {
        await this.selectMultiselect(field.label, value);
      } else {
        console.log(`[DEBUG] Special search for object: ${field.objectName}`);
        await this.fillSearchField(field.label, value, field.objectName);
      }

      formFieldsStore.uiFields.set(field.key, value);
    }
  }

  protected async checkRadio(label: string, value: string): Promise<void> {
    const fieldLocator = this.page.locator('.vv_field_row').filter({ hasText: label }).locator(`[data-corgix-internal="RADIO"]`).filter({ hasText: value });
    await fieldLocator.click();
    console.log(`[DEBUG] I fill field: ${label} with value: ${value}`);
  }

  protected async selectDropdownValue(label: string, value: string): Promise<void> {
    const fieldLocator = this.page.locator('.vv_field_row').filter({ hasText: label }).locator(`[data-corgix-internal="INPUT"]`);
    await fieldLocator.click();
    const optionLocator = this.page.locator('[role="option"]').filter({ hasText: value });
    await optionLocator.click();
    console.log(`[DEBUG] I fill field: ${label} with value: ${value}`);
  }

  protected async selectMultiselect(label: string, value: string): Promise<void> {
    const fieldLocator = this.page.locator('.vv_field_row').filter({ hasText: label }).locator('[data-corgix-internal="MULTI-SELECT"]');
    await fieldLocator.click();
    const optionLocator = this.page.locator('[role="option"]').filter({ hasText: value });
    await optionLocator.click();
    console.log(`[DEBUG] I fill field: ${label} with value: ${value}`);
  }

  protected async fillSearchField(label: string, value: string, objectName: string): Promise<void> {
    const fieldLocator = this.page.locator('.vv_field_row').filter({ hasText: label }).locator(`[data-corgix-internal="INPUT"]`);

    await fieldLocator.click();
    await fieldLocator.locator('[title="More search options"]').click();

    await this.searchInput.fill(value);
    await this.searchInput.press('Enter');

    const result = this.page.locator(`[objectname="${objectName}"]`).filter({ hasText: value });
    await result.first().click();
    await this.button('Close').click();

    console.log(`[DEBUG] I fill field: ${label} with value: ${value}`);
  }

  protected async fillValueField(label: string, value: string): Promise<void> {
    const fieldLocator = this.page.locator('.vv_field_row').filter({ hasText: label }).locator(`[data-corgix-internal="FIELD"]`);
    await fieldLocator.click();
    await fieldLocator.pressSequentially(value);
    console.log(`[DEBUG] I fill field: ${label} with value: ${value}`);
  }

  //#end region
  //#region elemens helpers

  button = (value: string | RegExp, exact = false): Locator => this.page.getByRole('button', { name: value, exact });
  link = (value: string | RegExp, exact = false): Locator => this.page.getByRole('link', { name: value, exact });
  label = (value: string | RegExp, exact = false): Locator => this.page.getByLabel(value, { exact });
  searchbox = (value: string | RegExp, exact = false): Locator => this.page.getByRole('searchbox', { name: value, exact });
  option = (value: string | RegExp, exact = false): Locator => this.page.getByRole('option', { name: value, exact });
  textarea = (value: string | RegExp): Locator => this.page.locator(`textarea[name="${value}"]`);
  textbox = (value: string | RegExp, exact = false): Locator => this.page.getByRole('textbox', { name: value, exact });
  header = (value: string | RegExp, exact = false): Locator => this.page.getByRole('heading', { name: value, exact });
  elementByText = (value: string | RegExp, exact = false): Locator => this.page.getByText(value, { exact });
  elementByTitle = (value: string | RegExp, exact = false): Locator => this.page.getByTitle(value, { exact });
  selectMenuItem = (value: string | RegExp): Locator => this.page.locator(`.vv-navbar-item`).filter({ hasText: value });
  selectSubMenuItem = (value: string | RegExp, exact = false): Locator => this.page.locator('.vv-navbar-dropdown-menu').getByRole('menuitem', { name: value, exact });
  checkbox = (value: string | RegExp, exact = false): Locator => this.page.getByRole('checkbox', { name: value, exact });
  listItemLocator = (value: string | RegExp): Locator => this.page.getByRole('listitem').filter({ hasText: value });
}

//#end region

export class FormFieldsStore {
  private static instance: FormFieldsStore | null = null;
  public uiFields = new Map<string, string | number>();
  public static getInstance(): FormFieldsStore {
    if (!FormFieldsStore.instance) {
      FormFieldsStore.instance = new FormFieldsStore();
    }
    return FormFieldsStore.instance;
  }

  public static resetInstance(): void {
    FormFieldsStore.instance = null;
  }
}
