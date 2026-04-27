import { expect, test } from '../fixtures/fixtures.js';
import { createDocumentData } from '../src/pages/models/documentInfo.model.js';
import { DOCUMENT_TYPES } from '../src/pages/models/documentType.model.js';

import { Utils } from '../utils/utils.js';

test.describe('Doc General Lifecycle', () => {
  test.beforeEach(async ({ page, loginAs, homePage }) => {
    await loginAs('admin');
    await page.goto('/ui/');
    await expect(homePage.navbarBrand).toBeVisible();
    await homePage.link('Library').click();
    await homePage.createDocumentBtn.click();
  });

  test('Generate from template - doc approved', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create document from template', async () => {
      await homePage.chooseDocumentType('Document from Template');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.CLINICAL_INSURANCE);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and approve document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Approved');
    });
  });

  test('Placeholder - doc approved', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create placeholder document', async () => {
      await Utils.generateTestFile(test.info());
      await homePage.chooseDocumentType('Placeholder');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.CLINICAL_INSURANCE);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Upload document', async () => {
      await docInfoPage.uploadGeneratedFile(Utils.generatedFilePath);
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and approve document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Approved');
    });
  });

  test('Upload - doc approved', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create uploaded document', async () => {
      await Utils.generateTestFile(test.info());
      await homePage.chooseDocumentType('Upload');
      await templatePage.createDocTypeAndUploadFile(DOCUMENT_TYPES.CLINICAL_INSURANCE, Utils.generatedFilePath);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and approve document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Approved');
    });
  });

  test('Placeholder - doc rejected', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create placeholder document', async () => {
      await Utils.generateTestFile(test.info());
      await homePage.chooseDocumentType('Placeholder');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.CLINICAL_INSURANCE);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Upload document', async () => {
      await docInfoPage.uploadGeneratedFile(Utils.generatedFilePath);
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and reject document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Not Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Rejected');
    });
  });

  test('Upload - doc rejected', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create uploaded document', async () => {
      await Utils.generateTestFile(test.info());
      await homePage.chooseDocumentType('Upload');
      await templatePage.createDocTypeAndUploadFile(DOCUMENT_TYPES.CLINICAL_INSURANCE, Utils.generatedFilePath);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and reject document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Not Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Rejected');
    });
  });

  test('Generate from template - doc rejected', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create document from template', async () => {
      await homePage.chooseDocumentType('Document from Template');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.CLINICAL_INSURANCE);
      await templatePage.fillBlankDocTemplate(docData, 'CLINICAL_INSURANCE');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalProcessGeneralDoc('Editor 10');
    });

    await test.step('Switch to Editor and reject', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Not Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Rejected');
    });
  });
});
