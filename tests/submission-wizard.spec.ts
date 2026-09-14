import { test, expect } from '../fixtures/fixtures.js';
import { createRegulatoryObjectiveData } from '../src/pages/models/regulatoryObjective.model.js';
import { createSubmissionData } from '../src/pages/models/submission.model.js';

test.describe('Submission wizard', () => {
  test.beforeEach(async ({ page, loginAs, homePage }) => {
    await loginAs('editor10');
    await page.goto('/ui/');
    await expect(homePage.navbarBrand).toBeVisible();
    await homePage.selectMenuItem('Applications').click();
    await homePage.selectSubMenuItem('Applications', true).click();
  });

  test('Submission wizard - Marketing Drug Application', async ({ applicationPage, applicationWizardPage, homePage, regulatoryObjectivePage }) => {
    const submissionData = createSubmissionData();
    const regulatoryObjData = createRegulatoryObjectiveData();

    await test.step('Enter to the Marketing Drug Application ', async () => {
      await applicationPage.enterAlreadyCreatedApp('WID-0812 MAA Estonia 1600155');
    });

    await test.step('Create new submission wizard', async () => {
      await applicationPage.startCreatingSubmissionByWizard();
      await applicationWizardPage.createNewSubmission();
      await applicationWizardPage.configureNewSubmission(submissionData);
    });

    await test.step('Create new regulatory objective', async () => {
      await applicationWizardPage.createRegulatoryObjective();
      await applicationWizardPage.configureRegulatoryObjective(regulatoryObjData);
      await applicationWizardPage.configureSubmissionComponents();
    });

    await test.step('Verify created item', async () => {
      await applicationWizardPage.verifySummaryScreen();
      await applicationPage.verifyCurrentLeftMenuObjNumber('Regulatory Objectives');
      await applicationPage.verifyCurrentLeftMenuObjNumber('Submissions');
      await regulatoryObjectivePage.verifyCreatedRegulatoryObject();
      await homePage.verifyNotifications();
    });
  });
});
