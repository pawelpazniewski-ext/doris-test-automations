import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { MethodLogger } from '../../utils/framework.js';

export class DocInfoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // region Locators
  get docTypeLabel(): Locator {
    return this.page.locator(`div[attrkey="documentType"]`);
  }
  get docSubTypeLabel(): Locator {
    return this.page.locator(`div[attrkey="documentSubType"]`);
  }
  get docClassificationLabel(): Locator {
    return this.page.locator(`div[attrkey="documentClassification"]`);
  }
  get startWorkflowHeader(): Locator {
    return this.page.getByText('Start Workflow');
  }
  get approverCombo(): Locator {
    return this.page.locator(`[name='approvers__c']:visible`);
  }
  get approverInstructionsTextbox(): Locator {
    return this.page.getByPlaceholder('Please add your instructions');
  }
  get dueDateTextbox(): Locator {
    return this.textbox('Due Date*');
  }
  get approveOrRejectDocHeader(): Locator {
    return this.page.locator(`[role="dialog"]`).getByText('Approve or Reject Document', { exact: true });
  }
  get capacityCombo(): Locator {
    return this.page.getByRole('dialog', { name: 'Approve or Reject Document' }).getByRole('textbox');
  }
  get docStatusBannerLocator(): Locator {
    return this.page.locator(`div[data-corgix-internal='PICKER']`);
  }
  get completeBtnInDialog(): Locator {
    return this.page.locator(`[role="dialog"]`).getByRole('link', { name: 'Complete' });
  }
  get completeBtnOnDoc(): Locator {
    return this.page.locator(`[tasktype="content"]`).getByRole('link', { name: 'Complete' });
  }
  get notApprovedOption(): Locator {
    return this.page.getByText('Not Approved', { exact: true });
  }
  get rejectionReasonTextbox(): Locator {
    return this.textbox('Reason for rejection*');
  }

  private docVersionName(name: string, version: string): Locator {
    return this.page.getByText(`${name}(${version})`);
  }
  // endregion

  @MethodLogger.logMethod
  public async verifyCreatedDoc(): Promise<void> {
    const docInfoStore = DocumentInfoModelStore.getInstance();
    const expectedName = docInfoStore.uiFields.get('docName') ?? '[NOT SET]';
    const docType = docInfoStore.uiFields.get('DocumentTypeModel') ?? '[NOT SET]';

    switch (docType) {
      case 'Document from Template':
      case 'Upload':
        await expect(this.docVersionName(expectedName, 'v0.1')).toBeVisible();
        break;
      case 'Placeholder':
        await expect(this.docVersionName(expectedName, 'v0.2')).toBeVisible();
        break;
      default:
        throw new Error(`${docType} is not configured`);
    }

    const verifications = [
      { locator: this.docTypeLabel, expected: docInfoStore.uiFields.get('type') },
      { locator: this.docSubTypeLabel, expected: docInfoStore.uiFields.get('subtype') },
      { locator: this.docClassificationLabel, expected: docInfoStore.uiFields.get('classification') },
    ];

    for (const { locator, expected } of verifications) {
      await expect(locator).toHaveText(expected ?? '[NOT SET]');
    }
    await this.checkDocStatusAfterApprovalProcess('Draft');
  }

  @MethodLogger.logMethod
  public async performApprovalProcessGeneralDoc(approver: string): Promise<void> {
    const day = new Date().getDate();
    await this.button('Workflow Actions').click();
    await this.option('Start Approval').click();
    await expect(this.startWorkflowHeader).toBeVisible();
    await this.approverCombo.pressSequentially(approver);
    await this.elementByTitle(approver).click();
    await this.approverInstructionsTextbox.fill('instructions for approver');
    await this.dueDateTextbox.click();
    await this.link(day.toString(), true).click();
    await this.link('Start').click();
    await this.checkDocStatusAfterApprovalProcess('In Approval');
  }

  @MethodLogger.logMethod
  public async performApprovalMasterLabelDoc(approver: string): Promise<void> {
    const day = new Date().getDate();
    await this.button('Workflow Actions').click();
    await this.option('Start Internal Approval').click();
    await expect(this.startWorkflowHeader).toBeVisible();
    await this.approverCombo.pressSequentially(approver);
    await this.elementByTitle(approver).click();
    await this.approverInstructionsTextbox.fill('instructions for approver');
    await this.dueDateTextbox.click();
    await this.link(day.toString(), true).click();
    await this.link('Start').click();
    await this.checkDocStatusAfterApprovalProcess('In Internal Approval');
  }

  @MethodLogger.logMethod
  public async approveOrRejectDocument(approvalStatus: 'Approved' | 'Not Approved'): Promise<void> {
    await this.completeBtnOnDoc.click();
    await expect(this.approveOrRejectDocHeader).toBeVisible();

    if (approvalStatus === 'Approved') {
      await this.elementByText('Approved', true).click();
      await this.capacityCombo.click();
      await this.elementByTitle('Clinical', true).click();
    } else if (approvalStatus === 'Not Approved') {
      await this.notApprovedOption.click();
      await this.rejectionReasonTextbox.fill('Reject test');
    } else {
      throw new Error(`Incorrect state: ${approvalStatus}`);
    }
    await this.completeBtnInDialog.click();
  }

  @MethodLogger.logMethod
  public async checkDocStatusAfterApprovalProcess(expectedStatus: string): Promise<void> {
    await expect(async () => {
      const currentDocStatus = await this.docStatusBannerLocator.innerText();
      expect(currentDocStatus).toEqual(expectedStatus);
    }).toPass({
      timeout: 15_000,
      intervals: [1000],
    });
  }

  @MethodLogger.logMethod
  public async uploadGeneratedFile(filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');

    await this.link('Upload File').click();
    await this.button('Choose a file').click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await this.button('Upload', true).click();
    await this.checkDocStatusAfterApprovalProcess('Draft');
  }
}

export class DocumentInfoModelStore {
  private static instance: DocumentInfoModelStore | null = null;
  public uiFields = new Map<string, string>();
  public static getInstance(): DocumentInfoModelStore {
    if (!DocumentInfoModelStore.instance) {
      DocumentInfoModelStore.instance = new DocumentInfoModelStore();
    }
    return DocumentInfoModelStore.instance;
  }

  public static resetInstance(): void {
    DocumentInfoModelStore.instance = null;
  }
}
