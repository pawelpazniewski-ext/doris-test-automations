import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';
import { DocumentInfoModelStore } from './docInfo.page.js';
import { MethodLogger } from '../../utils/framework.js';
import { DocumentInfoModel } from './models/documentInfo.model.js';
import { DocumentTypeModel } from './models/documentType.model.js';

export class TemplatePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // region Locators
  get typeSelect(): Locator {
    return this.page.locator('#uploadTypeSelect');
  }
  get subTypeSelect(): Locator {
    return this.page.locator('#uploadSubTypeSelect');
  }
  get classificationSelect(): Locator {
    return this.page.locator('#uploadClassification');
  }
  get binocularsBtn(): Locator {
    return this.page.locator('.binoculars');
  }
  get classifyNowRadio(): Locator {
    return this.page.locator('#now');
  }
  get templateListbox(): Locator {
    return this.page.locator(`ul[role='listbox']`);
  }
  get submissionReadySelect(): Locator {
    return this.elementByTitle('Choose eSubmission Ready');
  }
  get confirmESubmissionReadyOption(): Locator {
    return this.elementByTitle('Yes');
  }
  get sourceFileImg(): Locator {
    return this.page.getByRole('img', { name: 'Choose a source file for the' });
  }

  private fieldByTitle(title: string): Locator {
    return this.page.locator(`[title="${title}"]:visible`);
  }

  private optionByTitle(title: string): Locator {
    return this.page.locator(`[title="${title}"]`);
  }
  // endregion

  @MethodLogger.logMethod
  public async createDocAndSelectTemplate(documentScheme: DocumentTypeModel): Promise<void> {
    const docInfoStore = DocumentInfoModelStore.getInstance();
    const docType = docInfoStore.uiFields.get('DocumentTypeModel') ?? '[NOT SET]';

    await this.createNewDocType(documentScheme);
    if (docType === 'Document from Template') {
      await this.selectDocumentTemplate('Blank document');
    }
    await this.page.waitForLoadState('networkidle');
    await this.link('Next').click();
  }

  @MethodLogger.logMethod
  public async createDocTypeAndUploadFile(documentScheme: DocumentTypeModel, pathToFile: string): Promise<void> {
    await this.createNewDocType(documentScheme);
    await this.uploadFilyByDragnDrop(pathToFile);
    await this.page.waitForLoadState('networkidle');
    await this.link('Next').click();
  }

  @MethodLogger.logMethod
  public async fillBlankDocTemplate(docInfo: DocumentInfoModel, docType: string): Promise<void> {
    const docInfoStore = DocumentInfoModelStore.getInstance();
    const finalName = await this.handleDocumentName(docInfo.name);
    docInfoStore.uiFields.set('docName', finalName);

    const templateConfigs: Record<string, any[]> = {
      CLINICAL_INSURANCE: [{ key: 'title', label: 'Title', type: 'value' }],
      LABELING_DATA: [
        { key: 'annotatedClean', label: 'Choose Annotated/ Clean', type: 'dropdown' },
        { key: 'products', label: 'Choose Products', type: 'search', objectName: 'drug_product__v' },
        { key: 'productFamily', label: 'Choose Product Family', type: 'search', objectName: 'product__v' },
        { key: 'country', label: 'Choose Country', type: 'search', objectName: 'country__v' },
      ],
    };

    const fieldsToFill = templateConfigs[docType];
    if (!fieldsToFill) {
      throw new Error(`[ERROR] Typ dokumentu "${docType}" nie został zdefiniowany w fillBlankDocTemplate!`);
    }

    await expect(this.submissionReadySelect).toBeVisible({ timeout: 10000 });
    await this.submissionReadySelect.click();
    await this.confirmESubmissionReadyOption.click();

    for (const field of fieldsToFill) {
      const value = docInfo[field.key as keyof DocumentInfoModel];

      if (value) {
        await this.fillFieldByType(field, value);
      }
    }

    await this.page.waitForLoadState('networkidle');
    await this.link('Save').first().click();
    console.log(`[DEBUG] Document "${finalName}" saved.`);
  }

  //#region private methods

  private async fillFieldByType(field: any, value: any): Promise<void> {
    console.log(`[DEBUG] Filling ${field.label} (Type: ${field.type}) with: ${value}`);

    switch (field.type) {
      case 'value':
        await this.fieldByTitle(field.label).click();
        await this.optionByTitle(String(value)).click();
        break;

      case 'dropdown':
        await this.page.locator(`[title="${field.label}"]:visible`).click();
        await this.page.locator(`[title="${value}"]`).click();
        break;

      case 'search':
        await this.fillDocSearchField(field.label, String(value), field.objectName);
        break;

      default:
        throw new Error(`Step for field type "${field.type}" is not configured in fillFieldByType`);
    }
  }

  private async fillDocSearchField(label: string, value: string, objectName: string): Promise<void> {
    const fieldLocator = this.fieldByTitle(label);

    await fieldLocator.click();
    await fieldLocator.locator('[title="More search options"]').click();

    await this.searchInput.fill(value);
    await this.searchInput.press('Enter');

    const result = this.page.locator(`[objectname="${objectName}"]`).filter({ hasText: value });
    await result.first().click();

    await this.button('Close').click();
  }

  private async handleDocumentName(providedName: string): Promise<string> {
    const nameField = this.textarea('name');
    const predefinedDocName = (await nameField.textContent()) ?? '';

    if (predefinedDocName.trim() === '') {
      await nameField.fill(providedName);
      return providedName;
    }

    return predefinedDocName;
  }

  private async createNewDocType(DocumentTypeModel: DocumentTypeModel): Promise<void> {
    await this.classifyNowRadio.check();
    await this.verifyVisibilityWithReload(this.binocularsBtn);
    await this.binocularsBtn.click();
    await this.typeSelect.click();
    await this.typeSelect.selectOption(DocumentTypeModel.type);
    await this.subTypeSelect.click();
    await this.subTypeSelect.selectOption(DocumentTypeModel.subtype);
    await this.classificationSelect.click();
    await this.classificationSelect.selectOption(DocumentTypeModel.classification);
    await this.link('OK').click();

    const store = DocumentInfoModelStore.getInstance();
    store.uiFields.set('type', DocumentTypeModel.type);
    store.uiFields.set('subtype', DocumentTypeModel.subtype);
    store.uiFields.set('classification', DocumentTypeModel.classification);
  }

  private async uploadFilyByDragnDrop(filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.sourceFileImg.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  private async selectDocumentTemplate(template: string): Promise<void> {
    const dropdown = this.searchbox('Select a document template');
    const targetOption = this.option(template);

    await expect(async () => {
      const isListVisible = await this.templateListbox.isVisible();

      if (!isListVisible) {
        await dropdown.click();
        await this.page.waitForTimeout(300);
      }

      if (await targetOption.isVisible()) {
        await targetOption.click();
      } else {
        throw new Error(`Option ${template} is not visible`);
      }

      await expect(this.templateListbox).toBeHidden({ timeout: 1000 });
    }).toPass({
      timeout: 20_000,
      intervals: [500],
    });
  }
  //#endregion
}
