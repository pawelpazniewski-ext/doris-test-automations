import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';
import { DocumentInfoModelStore } from './docInfo.page.js';
import { MethodLogger } from '../../utils/framework.js';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // region Locators
  get navbarBrand(): Locator {
    return this.page.locator('#navbarBrand');
  }
  get createDocumentBtn(): Locator {
    return this.page.getByRole('button', { name: 'Create (Ctrl + Shift + C)' });
  }
  get createDocDialog(): Locator {
    return this.page.locator('[role="dialog"]');
  }
  get createDocTemplateIcon(): Locator {
    return this.page.locator(`[data-icon="plus"]`);
  }
  get searchDocumentsInput(): Locator {
    return this.textbox('Search documents');
  }

  get notificationsButton(): Locator {
    return this.button('New Notifications');
  }

  get allNotificationsListLocator(): Locator {
    return this.page.locator(`[class="vv-notification-panel-item-description"]`);
  }

  private docTypeOption(domValue: string): Locator {
    return this.page.locator(`[value="${domValue}"]`);
  }

  private documentHeader(docName: string): Locator {
    return this.header(`${docName}`, true);
  }

  // endregion

  @MethodLogger.logMethod
  public async chooseDocumentType(docType: 'Placeholder' | 'Document from Template' | 'Upload' | 'Binder' | 'CrossLink'): Promise<void> {
    const docInfoStore = DocumentInfoModelStore.getInstance();
    const domValue = this.templateMap[docType];

    if (!domValue) {
      throw new Error(`${docType} doesn't exist`);
    }

    await this.page.waitForLoadState('networkidle');

    await expect(async () => {
      const isVisible = await this.createDocDialog.isVisible();

      if (!isVisible) {
        await this.page.reload();
        await this.selectMenuItem('Library').click();
        await this.page.waitForLoadState('networkidle');
        await this.createDocTemplateIcon.click();
      }

      await expect(this.createDocDialog).toBeVisible({ timeout: 2000 });
    }).toPass({
      timeout: 15_000,
      intervals: [1000],
    });

    await this.docTypeOption(domValue).click();
    await this.button('Continue').click();

    docInfoStore.uiFields.set('DocumentTypeModel', docType);
  }

  @MethodLogger.logMethod
  public async searchDocumentToApprove(): Promise<void> {
    const docInfoStore = DocumentInfoModelStore.getInstance();
    const docName = docInfoStore.uiFields.get('docName') ?? '[NOT SET]';

    await this.searchDocumentsInput.fill(docName);
    await this.documentHeader(docName).click();
  }

  @MethodLogger.logMethod
  public async verifyNotifications(): Promise<void> {
    await this.notificationsButton.click();
    await expect(this.allNotificationsListLocator.first()).toBeVisible();
    let content = await this.allNotificationsListLocator.first().textContent();
    expect(content).toContain(`The Submission Wizard has completed for Application WID-0812 MAA Estonia 1600155`);
  }

  private readonly templateMap: Record<string, string> = {
    Placeholder: 'NAVIGATE_CREATE_PLACEHOLDER',
    'Document from Template': 'CreateDocFromTemplate',
    Upload: 'NavigateToUpload',
    Binder: 'NAVIGATE_CREATE_BINDER',
    CrossLink: 'NAVIGATE_CREATE_CROSSLINK',
  };
}
