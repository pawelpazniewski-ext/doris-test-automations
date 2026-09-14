import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { CreateEventModel } from './models/event.model.js';
import { RelatedRecordsModel } from './models/relatedRecords.model.js';
import { WorkflowModel } from './models/workflow.model.js';

type CompleteTaskOptions = {
  verdict?: string;
  fieldValue?: string;
  affiliateUser?: string;
};

export class EventPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private eventTypeOption(eventType: string): Locator {
    return this.page.getByLabel('Create Event').getByTitle(eventType);
  }

  private get selectEventTextbox(): Locator {
    return this.page.getByRole('dialog', { name: 'Create Event' }).getByRole('textbox');
  }

  private get changeObjectStatusDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Change Object Status' });
  }

  public get allEventsTitle(): Locator {
    return this.page.getByTitle('All Events');
  }

  private get acceptTaskLink(): Locator {
    return this.page.locator('a.acceptTask').first();
  }

  private get completeTaskLink(): Locator {
    return this.page.locator('a.completeTask').first();
  }

  private get productFamiliesSection(): Locator {
    return this.page.getByText('Event Product Families', { exact: false }).first();
  }

  private get productFamiliesAddButton(): Locator {
    return this.page.getByRole('button', { name: 'Add', exact: true }).last();
  }

  private get applicationsInput(): Locator {
    return this.page.locator('form input.multiItemSelectInput.ui-autocomplete-input:visible');
  }

  private get submitWorkflowDialog(): Locator {
    return this.dialog('Start');
  }

  private get submitWorkflowDelegateInput(): Locator {
    return this.submitWorkflowDialog.locator('input.multiItemSelectInput.ui-autocomplete-input');
  }

  private get submitWorkflowSelect(): Locator {
    return this.submitWorkflowDialog.locator('[data-corgix-internal="SINGLE-SELECT"] input[type="search"]');
  }

  private get submitWorkflowDueDate(): Locator {
    return this.submitWorkflowDialog.getByRole('textbox', { name: 'Due Date*' });
  }

  private get submitWorkflowDateToday(): Locator {
    return this.page.locator('.ui-datepicker-today');
  }

  public async selectEventType(eventType: 'CMC Event' | 'Label Event' | 'Regulatory Event'): Promise<void> {
    await this.page.waitForLoadState();
    await this.button('Create (Ctrl + Shift + C)').click();
    await expect(async () => {
      await this.selectEventTextbox.click();
    }).toPass({
      intervals: [1000],
      timeout: 15_000,
    });
    await this.eventTypeOption(eventType).click();
    await expect(this.selectEventTextbox).toHaveValue(eventType, { timeout: 2000 });
    await this.link('Continue').click();
  }

  public async createEventType(createEvent: CreateEventModel): Promise<void> {
    type MultiSelect = { key: keyof CreateEventModel; label: string; type: 'multiselect' };
    type Searchbox = { key: keyof CreateEventModel; label: string; type: 'searchbox' };
    type RadioButton = { key: keyof CreateEventModel; label: string; type: 'radio' };

    const fields: (RadioButton | Searchbox | MultiSelect)[] = [
      { key: 'applicableProductType', label: 'Applicable Product Type', type: 'multiselect' },
      { key: 'keyword', label: 'Keyword', type: 'searchbox' },
      { key: 'projectType', label: 'Project Type', type: 'searchbox' },
      { key: 'safetyRelated', label: 'Safety Related?', type: 'radio' },
      { key: 'locallyInitiated', label: 'Locally Initiated?', type: 'radio' },
      { key: 'labelingImpact', label: 'Labeling Impact', type: 'radio' },
      { key: 'haExpectedDueDateAvailable', label: 'HA Expected Due Date Available?', type: 'radio' },
    ];

    await this.fillFormByTemplate(createEvent, fields);

    await expect(async () => {
      const saveButton = this.button('Save', true);
      await saveButton.click();
      await expect(saveButton).toBeHidden();
    }).toPass({
      intervals: [1000],
      timeout: 15_000,
    });
  }

  public async changeEventState(state: string): Promise<void> {
    await this.button('Workflow and State Change').click();
    await this.elementByText(`Change State to ${state}`).first().click();
    await expect(this.changeObjectStatusDialog).toBeVisible();
    await this.changeObjectStatusDialog.getByRole('button', { name: 'Yes', exact: true }).click();
  }

  public async startWorkflow(workflow: string): Promise<void> {
    await this.button('Workflow and State Change').click();
    await this.elementByText(workflow).first().click();
  }

  public async submitWorkflow(workflow: WorkflowModel): Promise<string> {
    const { isTaskUrgent, rplDelegate, createGlobalContentPlanAs, globalApplication, contentPlanTemplate, dueDate, CMCDGroupManagement, CMCDGroupManagementInstructions, SME } = workflow;

    if (isTaskUrgent) {
      await this.submitWorkflowDialog.getByLabel(isTaskUrgent, { exact: true }).check();
    }
    if (rplDelegate) {
      await this.submitWorkflowDelegateInput.click();
      await this.submitWorkflowDelegateInput.pressSequentially(rplDelegate);
      await this.page.locator('ul.ui-menu:visible').getByText(rplDelegate).first().click();
    }
    if (createGlobalContentPlanAs) {
      await this.selectDialogLookupValue(this.submitWorkflowDialog, 'Global Application', globalApplication);
      await this.selectDialogLookupValue(this.submitWorkflowDialog, 'Content Plan Template', contentPlanTemplate);
      await this.submitWorkflowSelect.click();
      await this.option(createGlobalContentPlanAs).first().click();
    }
    if (dueDate) {
      await this.submitWorkflowDueDate.click();
      await this.submitWorkflowDateToday.click();
    }
    if (CMCDGroupManagement) {
      await this.submitWorkflowDialog.locator('#part_all_quality_authors__c').getByRole('textbox').click();
      await this.submitWorkflowDialog.getByText(CMCDGroupManagement).click();
    }
    if (CMCDGroupManagementInstructions) {
      await this.submitWorkflowDialog.getByPlaceholder('Please add your instructions').fill(CMCDGroupManagementInstructions);
    }
    if (SME) {
      await this.submitWorkflowDialog.locator('#part_sme__c').getByRole('textbox').click();
      await this.submitWorkflowDialog.getByText(SME).click();
    }

    await this.link('Start').click();
    return this.page.url();
  }

  public async createRelatedRecords(createRelatedRecords: RelatedRecordsModel): Promise<void> {
    type Lookup = { key: keyof RelatedRecordsModel; label: string; type: 'lookup' };
    type NativeRadio = { key: keyof RelatedRecordsModel; label: string; type: 'nativeRadio' };

    await this.button('Create Related Records').click();

    const marketFields: Lookup[] = [
      { key: 'countries', label: 'Countries', type: 'lookup' },
      { key: 'submissionType', label: 'Submission Type', type: 'lookup' },
    ];
    await this.fillFormByTemplate(createRelatedRecords, marketFields);
    await this.button('Next').last().click();

    await this.applicationsInput.click();
    await this.applicationsInput.pressSequentially(createRelatedRecords.applications);
    await this.page.locator('ul.ui-menu:visible').last().getByText(createRelatedRecords.applications, { exact: true }).first().click();

    const publishingFields: NativeRadio[] = [{ key: 'publishingRequired', label: 'Publishing Required', type: 'nativeRadio' }];
    await this.fillFormByTemplate(createRelatedRecords, publishingFields);
    await this.button('Next').last().click();

    await this.button('Finish').last().click();
  }

  public async acceptTask(): Promise<void> {
    await this.acceptTaskLink.click();
  }

  public async completeTask(taskDialog: string, options?: CompleteTaskOptions): Promise<string> {
    await this.completeTaskLink.click();
    const dialog = this.dialog(taskDialog);

    if (options?.verdict) {
      await dialog.getByRole('radio', { name: options.verdict, exact: true }).check();
    }

    if (options?.fieldValue) {
      await dialog.getByRole('textbox', { name: 'URL' }).fill(options.fieldValue);
    }

    if (options?.affiliateUser) {
      await dialog.locator('#part_all_affiliate_users__c').getByRole('textbox').click();
      await dialog.getByText(options.affiliateUser).click();
    }

    await dialog.getByRole('link', { name: 'Complete', exact: true }).click();

    return this.page.url();
  }

  public async addProductFamily(productFamily: string): Promise<void> {
    await expect(async () => {
      await this.page.keyboard.press('End');
      await expect(this.productFamiliesSection).toBeVisible({ timeout: 30_000 });
      await this.productFamiliesSection.scrollIntoViewIfNeeded();
    }).toPass({ timeout: 30_000, intervals: [1_000] });
    await this.productFamiliesSection.click();
    await this.productFamiliesAddButton.click();

    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Search: Product Family' });
    await dialog.getByText(productFamily, { exact: true }).first().click();
    await this.button('OK', true).click();
  }

  public async cancelEvent(): Promise<void> {
    await this.button('Workflow and State Change').click();
    const cancelEvent = this.page.getByText('Cancel Event', { exact: true });
    await cancelEvent.waitFor({ state: 'visible', timeout: 3_000 });
    await cancelEvent.click();
    await this.textbox('Reason for Cancellation*').fill('reason');
    await this.link('Start').click();
    await expect(this.page.getByText('Successfully completed "Cancel Event"')).toBeVisible();
    await expect(this.page.getByText('Approve/Reject Event Cancelation Request')).toBeVisible();
    await expect(this.page.getByTitle('Object Lifecycle: Events')).toBeVisible();
  }

  public async cancelGROEvent() {
    await this.button('Workflow and State Change').click();
    const cancelEvent = this.page.getByText('Cancel Event (GRO)', { exact: true });
    await cancelEvent.waitFor({ state: 'visible', timeout: 3_000 });
    await cancelEvent.click();
    await this.textbox('Reason for Cancellation*').fill('reason');
    await this.link('Start').click();
    await expect(this.page.getByText('Successfully completed "Cancel Event (GRO)"')).toBeVisible();
    await expect(this.button('Cancelled')).toBeVisible();
  }

  public async completeCancelationRequest(verdict: 'approve' | 'reject') {
    const completeEvent = this.label('Approve/Reject Event').getByRole('link', { name: 'Complete' });
    await this.page.getByText('Accept').click();
    await this.page.getByText('Complete').click();
    await completeEvent.click();
    if (verdict === 'reject') {
      await this.label('Reject, do not change state').check();
      await this.page.getByRole('textbox', { name: 'Reason for Rejection' }).fill('reason');
      await completeEvent.click();
      await expect(this.button('Planned')).toBeVisible();
    } else {
      await this.label('Approve, change state to Canceled').check();
      await completeEvent.click();
      await expect(this.button('Cancelled')).toBeVisible();
    }
  }
}
