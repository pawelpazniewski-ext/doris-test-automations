import { expect, test } from '../fixtures/fixtures.js';
import { DOCUMENT_TYPES } from '../src/pages/models/documentType.model.js';
import { createDocumentData } from '../src/pages/models/documentInfo.model.js';

test.describe('Master Label Lifecycle', () => {
  test.beforeEach(async ({ page, loginAs, homePage }) => {
    await loginAs('admin');
    await page.goto('/ui/');
    await expect(homePage.navbarBrand).toBeVisible();
    await homePage.selectMenuItem('Library').click();
    await homePage.createDocumentBtn.click();
  });

  test('Generate from template - doc approved', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create document from template', async () => {
      await homePage.chooseDocumentType('Document from Template');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.LABELING_PRODUCTINF);
      await templatePage.fillBlankDocTemplate(docData, 'LABELING_DATA');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalMasterLabelDoc('Editor 10');
    });

    await test.step('Switch to Editor and approve document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Internally Approved');
    });
  });

  test('Generate from template - doc rejected', async ({ homePage, templatePage, docInfoPage }) => {
    const docData = createDocumentData();

    await test.step('Create document from template', async () => {
      await homePage.chooseDocumentType('Document from Template');
      await templatePage.createDocAndSelectTemplate(DOCUMENT_TYPES.LABELING_PRODUCTINF);
      await templatePage.fillBlankDocTemplate(docData, 'LABELING_DATA');
    });

    await test.step('Verify document and start approval process', async () => {
      await docInfoPage.verifyCreatedDoc();
      await docInfoPage.performApprovalMasterLabelDoc('Editor 10');
    });

    await test.step('Switch to Editor and approve document', async () => {
      await docInfoPage.switchUser('EDITOR');
      await homePage.searchDocumentToApprove();
      await docInfoPage.approveOrRejectDocument('Not Approved');
      await docInfoPage.checkDocStatusAfterApprovalProcess('Rejected');
    });
  });
});
