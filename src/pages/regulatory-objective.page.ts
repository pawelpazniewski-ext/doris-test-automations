import { expect, Locator, Page } from '@playwright/test';
import { BasePage, FormFieldsStore } from './base.page.js';
import { MethodLogger } from '../../utils/framework.js';
import { WizardAppStore } from './application-wizard.page.js';

export class RegulatoryObjectivePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get loadingGridIcon(): Locator {
    return this.page.locator('[class="loading-section-content"]');
  }

  get activeSubstanceItemLocator(): Locator {
    return this.page.locator('[data-column-name="active_substance__v"]');
  }
  get inactiveIngredientItemLocator(): Locator {
    return this.page.locator('[data-column-name="inactive_ingredient__v"]');
  }
  get submissionTypeItemLocator(): Locator {
    return this.page.locator('[data-column-name="submission__vr.submission_type__rim"]');
  }

  @MethodLogger.logMethod
  public async verifyCreatedRegulatoryObject(): Promise<void> {
    const formFieldsStore = FormFieldsStore.getInstance();
    const wizardAppStore = WizardAppStore.getInstance();
    const regulatoryObjectiveName = formFieldsStore.uiFields.get('regulatoryObjectiveName')?.toString() ?? '';

    const expectedActiveSubstance = wizardAppStore.uiFields.get('Active Substances');
    const expectedInactiveIngredient = wizardAppStore.uiFields.get('Inactive Ingredients');
    const expectedSubmissionType = formFieldsStore.uiFields.get('submissionType');

    await this.listItemLocator('Regulatory Objectives').click();
    await this.page.getByRole('search').pressSequentially(regulatoryObjectiveName);
    await this.page.keyboard.press('Enter');
    await this.link('REG-').click();

    await this.listItemLocator('Active Substances').click();
    await expect(this.loadingGridIcon).toHaveCount(0, { timeout: 10_000 });
    const currentActiveSubstance = await this.activeSubstanceItemLocator.textContent();
    expect(currentActiveSubstance).toEqual(expectedActiveSubstance);

    await this.listItemLocator('Inactive Ingredient').click();
    await expect(this.loadingGridIcon).not.toBeVisible();
    const currentInactiveIngredient = await this.inactiveIngredientItemLocator.textContent();
    expect(currentInactiveIngredient).toEqual(expectedInactiveIngredient);

    await this.listItemLocator('Submissions').click();
    await expect(this.loadingGridIcon).not.toBeVisible();
    const currentSubmissionType = await this.submissionTypeItemLocator.textContent();
    expect(currentSubmissionType).toEqual(expectedSubmissionType);

    WizardAppStore.resetInstance();
    FormFieldsStore.resetInstance();
  }
}
