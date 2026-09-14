import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { MethodLogger } from '../../utils/framework.js';
import { NEW_APPLICATION, NewApplicationModel } from './models/application.model.js';
import { WizardAppStore } from './application-wizard.page.js';

export class ApplicationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get currentAppNameLocator(): Locator {
    return this.page.locator(`[class='multiItemSelectAutoComplete label vv_item_label']`);
  }

  get changeAppDropdown(): Locator {
    return this.page.getByRole('dialog', { name: 'Create Application' }).getByRole('textbox');
  }

  get spinnerIcon(): Locator {
    return this.page.locator(`[data-icon="spinner"]`);
  }

  get applicationHeader(): Locator {
    return this.page.locator(`.vv-vof-detail-header-items`);
  }

  get menuItemLoadingIcon(): Locator {
    return this.page.locator(`[data-corgix-internal="MENU-ITEM-LOADING"]`);
  }

  get submisionWizardCreateIcon(): Locator {
    return this.page.getByRole('listbox').getByText('Submission Wizard');
  }

  private gridItems(): Locator {
    return this.page.locator('[data-corgix-internal="DATA-GRID"]').locator(`[data-target="name__v"]`);
  }

  @MethodLogger.logMethod
  public async createAppIfNeeded(appNumber: string, expectedAppType: string): Promise<void> {
    await this.textbox('Search All Applications').fill(appNumber);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState();
    await expect(this.spinnerIcon).not.toBeVisible();
    const rowCount = await this.gridItems().count();

    if (rowCount < 1) {
      await this.enterToAppCreationProcess(expectedAppType);
      await this.configureNewApp(NEW_APPLICATION.MARKETING_DRUG_APP);
    }
  }

  @MethodLogger.logMethod
  public async enterAlreadyCreatedApp(appNumber: string): Promise<void> {
    await this.textbox('Search All Applications').fill(appNumber);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState();
    await expect(this.spinnerIcon).not.toBeVisible();
    await this.link(appNumber).click();
    await this.getCurrentItemNumber('Regulatory Objectives');
    await this.getCurrentItemNumber('Submissions');
  }

  @MethodLogger.logMethod
  public async configureNewApp(newAppModel: NewApplicationModel): Promise<void> {
    type ValueField = { key: keyof NewApplicationModel; label: string; type: 'value' };
    type SearchField = { key: keyof NewApplicationModel; label: string; type: 'search'; objectName: string };
    type DropDown = { key: keyof NewApplicationModel; label: string; type: 'dropdown' };

    const fields: (ValueField | SearchField | DropDown)[] = [
      { key: 'appNumber', label: 'Application Number', type: 'value' },
      { key: 'appName', label: 'Application Name', type: 'value' },
      { key: 'applicableProductType', label: 'Applicable Product Type', type: 'dropdown' },
      { key: 'leadCountry', label: 'Lead Country', type: 'search', objectName: 'country__v' },
      { key: 'productFamily', label: 'Product Family', type: 'search', objectName: 'product__v' },
      { key: 'appType', label: 'Application Type', type: 'search', objectName: 'controlled_vocabulary__rim' },
      { key: 'procedureType', label: 'Procedure Type', type: 'search', objectName: 'controlled_vocabulary__rim' },
      { key: 'dossierFormat', label: 'Dossier Format', type: 'search', objectName: 'controlled_vocabulary__rim' },
    ];

    await this.fillFormByTemplate(newAppModel, fields);
    await this.button('Save', true).click();
  }

  @MethodLogger.logMethod
  public async startCreatingSubmissionByWizard(): Promise<void> {
    await expect(this.button('All Actions')).toBeVisible();
    await expect(async () => {
      const isMenuVisible = await this.submisionWizardCreateIcon.isVisible();

      if (!isMenuVisible) {
        await this.button('All Actions').click();
        await expect(this.submisionWizardCreateIcon).toBeVisible({ timeout: 5_000 });
      }
      await expect(this.menuItemLoadingIcon).not.toBeVisible();
    }).toPass({
      timeout: 15_000,
      intervals: [1000],
    });
    await this.submisionWizardCreateIcon.click();
  }

  @MethodLogger.logMethod
  public async verifyCurrentLeftMenuObjNumber(leftMenuItemTocheck: string): Promise<void> {
    const wizardAppStore = WizardAppStore.getInstance();
    const menuToTargetMap: Record<string, string> = {
      'Regulatory Objectives': 'submission_groups__c',
      Submissions: 'submissions__c',
    };

    const target = menuToTargetMap[leftMenuItemTocheck];

    if (!target) {
      throw new Error(`There is no data-target value for: ${leftMenuItemTocheck} in map`);
    }

    await expect(this.page.locator(`[data-target="${target}"]`)).toBeVisible();

    const startedCounter = Number(wizardAppStore.uiFields.get(`${leftMenuItemTocheck} current counter`) ?? 0);
    const visibleCounter = await this.getCurrentItemNumber(leftMenuItemTocheck);

    expect(visibleCounter).toBe(startedCounter + 1);
  }

  //#region private methods

  private async enterToAppCreationProcess(expectedAppType: string): Promise<void> {
    await this.page.keyboard.press('Control+Shift+C');
    await expect(this.elementByText('Create Application')).toBeVisible();
    let currentApp = await this.currentAppNameLocator.textContent();

    if (currentApp !== expectedAppType) {
      await this.changeAppDropdown.click();
      await this.page.locator(`a[title="${expectedAppType}"]`).click();
    }

    await this.link('Continue').click();
  }

  @MethodLogger.logMethod
  private async getCurrentItemNumber(itemName: string): Promise<number> {
    const wizardAppStore = WizardAppStore.getInstance();
    let finalCount = 0;

    await expect(async () => {
      const fullText = (await this.listItemLocator(itemName).textContent()) ?? '';
      const match = fullText.match(/\d+/);

      if (!match) {
        throw new Error(`Counter for ${itemName} not loaded. Retrying...`);
      }

      finalCount = parseInt(match[0], 10);
    }).toPass({
      timeout: 10_000,
      intervals: [500],
    });

    wizardAppStore.uiFields.set(`${itemName} current counter`, finalCount);

    return finalCount;
  }
  //#endregion
}
