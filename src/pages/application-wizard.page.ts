import { expect, Locator, Page } from '@playwright/test';
import { BasePage, FormFieldsStore } from './base.page.js';
import { SubmissionModel } from './models/submission.model.js';
import { MethodLogger } from '../../utils/framework.js';
import { RegulatoryObjectiveModel } from './models/regulatoryObjective.model.js';

export class ApplicationWizardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get submissionCreatorHeader(): Locator {
    return this.page.locator(`[class="ui-dialog-title"]`);
  }

  get createRegulatoryObjButton(): Locator {
    return this.elementByText('Create Regulatory Objective');
  }

  get submissionSearchField(): Locator {
    return this.page.locator(`[class='vv_field_row vv_editable_row']`).filter({ hasText: 'Submission' }).locator(`[data-corgix-internal="FIELD"]`);
  }

  get regulatoryObjectiveSearchField(): Locator {
    return this.page.locator(`[class='vv_field_row vv_editable_row']`).filter({ hasText: 'Regulatory Objective' }).locator(`[data-corgix-internal="FIELD"]`);
  }
  get currentSummaryRegulatoryObjName(): Locator {
    return this.page.locator(`[class='vv-submission-wizard-summary-object-section']`).filter({ hasText: 'Regulatory Objective' });
  }
  get currentSubmissionName(): Locator {
    return this.page.locator(`[class='vv-submission-wizard-summary-object-section']`).filter({ hasText: 'Submission' });
  }

  private relationshipLocator(relationShip: string): Locator {
    return this.page.locator('label').filter({ hasText: relationShip });
  }

  WIZARD_RELATIONSHIPS = ['Active Substances', 'Products', 'Inactive Ingredients', 'Packaging', 'Shelf Lifes', 'Therapeutic Indications'];

  @MethodLogger.logMethod
  public async createNewSubmission(): Promise<void> {
    await this.submissionSearchField.click();
    await this.elementByText('Create Submission').click();
    await expect(this.submissionCreatorHeader).toHaveText(`Create Marketed Drug Submission`);
  }

  @MethodLogger.logMethod
  public async configureNewSubmission(SubmissionModel: SubmissionModel): Promise<void> {
    type ValueField = { key: keyof SubmissionModel; label: string; type: 'value' };
    type SearchField = { key: keyof SubmissionModel; label: string; type: 'search'; objectName: string };
    type RadioButton = { key: keyof SubmissionModel; label: string; type: 'radio' };
    type DropDown = { key: keyof SubmissionModel; label: string; type: 'dropdown' };

    const fields: (ValueField | SearchField | RadioButton | DropDown)[] = [
      { key: 'submissionName', label: 'Submission Name', type: 'value' },
      { key: 'applicant', label: 'Applicant', type: 'search', objectName: 'organization__rim' },
      { key: 'submissionType', label: 'Submission Type', type: 'search', objectName: 'controlled_vocabulary__rim' },
      { key: 'changeControlNumber', label: 'Change Control Number', type: 'value' },
      { key: 'contentPlan', label: 'Content Plan', type: 'search', objectName: 'edl__v' },
      { key: 'publishingRequired', label: 'Publishing Required', type: 'radio' },
      { key: 'sequenceId', label: 'Sequence ID', type: 'value' },
      { key: 'submissionUnit', label: 'Submission Unit', type: 'dropdown' },
      { key: 'workingDocumentsNeeded', label: 'Working Documents Needed?', type: 'radio' },
      { key: 'publisher', label: 'Publisher', type: 'search', objectName: 'user__sys' },
    ];

    await this.fillFormByTemplate(SubmissionModel, fields);
    await this.link('Save', true).click();
  }

  @MethodLogger.logMethod
  public async createRegulatoryObjective(): Promise<void> {
    await this.regulatoryObjectiveSearchField.click();
    await this.createRegulatoryObjButton.click();
  }

  @MethodLogger.logMethod
  public async configureRegulatoryObjective(RegulatoryObjective: RegulatoryObjectiveModel): Promise<void> {
    type ValueField = { key: keyof RegulatoryObjectiveModel; label: string; type: 'value' };
    type SearchField = { key: keyof RegulatoryObjectiveModel; label: string; type: 'search'; objectName: string };
    type RadioButton = { key: keyof RegulatoryObjectiveModel; label: string; type: 'radio' };
    type DropDown = { key: keyof RegulatoryObjectiveModel; label: string; type: 'dropdown' };
    type Multiselect = { key: keyof RegulatoryObjectiveModel; label: string; type: 'multiselect' };

    const fields: (ValueField | SearchField | RadioButton | DropDown | Multiselect)[] = [
      { key: 'regulatoryObjectiveName', label: 'Regulatory Objective Name', type: 'value' },
      { key: 'globalRegulatoryObjectiveType', label: 'Global Regulatory Objective Type', type: 'multiselect' },
      // { key: 'XEVMPDSubmissionNeeded', label: 'XEVMPD Submission Needed', type: 'dropdown' },
      { key: 'safetyRelated', label: 'Safety Related?', type: 'radio' },
      { key: 'labelingImpact', label: 'Labeling Impact', type: 'radio' },
      { key: 'worksharing', label: 'Worksharing', type: 'radio' },
    ];

    await this.fillFormByTemplate(RegulatoryObjective, fields);

    await this.link('Save', true).click();
    await this.checkbox('Relate Registrations to Regulatory Objective').check();
    for (const relationShip of this.WIZARD_RELATIONSHIPS) {
      await expect(this.relationshipLocator(relationShip)).toBeVisible({ timeout: 5_000 });
      console.log(`[DEBUG] I am veryfing visibility of ${relationShip} item on checkbox list`);
    }
    await this.checkbox('Select All').check();
    await expect(this.checkbox('Select All')).toBeChecked();
    await this.page.waitForLoadState();
    await this.button('Next').last().click();
  }

  @MethodLogger.logMethod
  public async configureSubmissionComponents(): Promise<void> {
    const wizardAppStore = WizardAppStore.getInstance();
    const relationshipToColumName: Record<string, string> = {
      'Active Substances': 'active_substance__v',
      Products: 'pharmaceutical_product__v',
      'Inactive Ingredients': 'inactive_ingredient__v',
      Packaging: 'packaging__v',
      'Shelf Lifes': 'packaging__v',
      'Therapeutic Indications': 'therapeutic_indication__rim',
    };

    await expect(this.header('Registrations')).toBeVisible();
    await this.page.getByRole('checkbox').nth(1).click();
    await this.page.waitForLoadState();
    await this.button('Next').last().click();

    for (const relationShip of this.WIZARD_RELATIONSHIPS) {
      await expect(this.header(relationShip)).toBeVisible({ timeout: 10_000 });
      console.log(`[DEBUG] Processing ${relationShip} screen`);

      const columnName = relationshipToColumName[relationShip];

      if (columnName) {
        const cellLocator = this.page.locator(`[data-column-name="${columnName}"]`).last();
        await expect(cellLocator).not.toBeEmpty({ timeout: 5_000 });
        const value = (await cellLocator.textContent())?.trim() ?? '';
        wizardAppStore.uiFields.set(relationShip, value);
        console.log(`[DEBUG] Captured value for ${relationShip}: ${value}`);
      } else {
        console.warn(`[WARN] No column mapping found for relationship: ${relationShip}`);
      }

      await this.page.getByRole('checkbox').filter({ visible: true }).last().click();
      await this.page.waitForLoadState();
      await this.button('Next').last().click();
    }
  }

  @MethodLogger.logMethod
  public async verifySummaryScreen(): Promise<void> {
    const formFieldsStore = FormFieldsStore.getInstance();
    const regulatoryObjectiveName = formFieldsStore.uiFields.get('regulatoryObjectiveName');
    const submissionName = formFieldsStore.uiFields.get('submissionName');

    await expect(this.header('Summary')).toBeVisible();
    for (const item of this.WIZARD_RELATIONSHIPS) {
      await expect(this.page.getByText(`1${item}`)).toBeVisible();
      console.log(`[DEBUG] I am veryfing ${item} visibility on the screen`);
    }

    expect(await this.currentSummaryRegulatoryObjName.textContent()).toContain(regulatoryObjectiveName);
    expect(await this.currentSubmissionName.textContent()).toContain(submissionName);
    await this.button('Finish').last().click();
  }
}

export class WizardAppStore {
  private static instance: WizardAppStore | null = null;
  public uiFields = new Map<string, string | number>();
  public static getInstance(): WizardAppStore {
    if (!WizardAppStore.instance) {
      WizardAppStore.instance = new WizardAppStore();
    }
    return WizardAppStore.instance;
  }

  public static resetInstance(): void {
    WizardAppStore.instance = null;
  }
}
