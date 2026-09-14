import { expect, test } from '../fixtures/fixtures.js';
import { CREATE_EVENT } from '../src/pages/models/event.model.js';
import { CREATE_RELATED_RECORDS } from '../src/pages/models/relatedRecords.model.js';
import { START_WORKFLOW, IAR_URL } from '../src/pages/models/workflow.model.js';

test.describe('Label Event Lifecycle', () => {
  test.beforeEach(async ({ page, loginAs, homePage, eventPage }) => {
    await loginAs('admin');
    await page.goto('/ui/');
    await homePage.closeTooltipAfterLogin();
    await expect(homePage.navbarBrand).toBeVisible();
    await homePage.selectMenuItem('Registrations').click();
    await homePage.selectSubMenuItem('Events', true).click();
    await expect(eventPage.allEventsTitle).toBeVisible();
    await eventPage.selectEventType('Label Event');
    await eventPage.createEventType(CREATE_EVENT.DEFAULT_LABEL_EVENT);
  });

  test('1. Change Label Event to In Progress', async ({ eventPage }) => {
    await test.step('Change State to In Progress', async () => {
      await eventPage.changeEventState('In Progress');
    });
  });

  test('2. Request Event Joins population', async ({ eventPage }) => {
    await test.step('Start Request Event Joins population workflow', async () => {
      await eventPage.startWorkflow('Request Event Joins population');
      await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_EVENT_JOINS);
    });

    await test.step('Create related records', async () => {
      await eventPage.createRelatedRecords(CREATE_RELATED_RECORDS.DEFAULT);
    });

    await test.step('Complete Event Joins Population task', async () => {
      await eventPage.completeTask('Event Joins Population', {
        verdict: 'Completed',
      });
    });

    await test.step('Add product family', async () => {
      await eventPage.addProductFamily(CREATE_RELATED_RECORDS.DEFAULT.productFamily);
    });
  });

  test('3. Request Global Application', async ({ eventPage }) => {
    await test.step('Start Request Global Application workflow', async () => {
      await eventPage.startWorkflow('Request Global Application');
      await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_GLOBAL_APPLICATION);
    });

    await test.step('Accept Request Global Application task', async () => {
      await eventPage.acceptTask();
    });

    await test.step('Complete task with Completed verdict', async () => {
      await eventPage.completeTask('Request Global Application', {
        verdict: 'Completed',
      });
    });
  });

  test('4. Request Impact Assessment Report', async ({ eventPage }) => {
    await test.step('Start Request Impact Assessment Report workflow', async () => {
      await eventPage.startWorkflow('Request Impact Assessment Report');
      await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_IMPACT_ASSESSMENT_REPORT);
    });

    await test.step('Accept Request Impact Assessment Report task', async () => {
      await eventPage.acceptTask();
    });

    await test.step('Complete task with Completed verdict and IAR URL', async () => {
      await eventPage.completeTask('Request Impact Assessment Report', { verdict: 'Completed', fieldValue: IAR_URL });
    });

    await test.step("Complete RPL Delegate's review task", async () => {
      await eventPage.completeTask("RPL Delegate's review", { verdict: 'Agreed, no changes needed' });
    });
  });

  test('5. Request Admin Documents', async ({ eventPage, homePage }) => {
    let createdTaskUrl: string;
    await test.step('Start Request Admin Documents workflow', async () => {
      await eventPage.startWorkflow('Request Admin Documents');
      createdTaskUrl = await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_ADMIN_DOCUMENTS);
    });

    await test.step('Switch to Editor 7 and open the last Label Event task', async () => {
      await eventPage.switchUser('EDITOR7');
      await homePage.openCreatedTask(createdTaskUrl!);
    });

    await test.step('Accept and complete Affiliate Specialist task', async () => {
      await eventPage.acceptTask();
      await eventPage.completeTask('Affiliate Specialist', { affiliateUser: 'Editor 7' });
    });

    await test.step('Accept and complete Reassignment to Affiliate Specialist', async () => {
      await eventPage.acceptTask();
      await eventPage.completeTask('Reassignment to Affiliate Specialist', {
        verdict: 'Completed',
      });
    });
  });

  test('6. Request RA Implementation', async ({ eventPage, homePage }) => {
    let createdTaskUrl: string;
    await test.step('Start Request RA Implementation workflow', async () => {
      await eventPage.startWorkflow('Request RA Implementation');
      createdTaskUrl = await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_RA_IMPLEMENTATION);
    });

    await test.step('Switch to Admin 4 and open the last Label Event task', async () => {
      await eventPage.switchUser('ADMIN4');
      await homePage.openCreatedTask(createdTaskUrl!);
    });

    await test.step('Accept and complete Request RA Implementation task', async () => {
      await eventPage.acceptTask();
      await eventPage.completeTask('Request RA Implementation', {
        verdict: 'Completed',
      });
    });
  });

  test('7. Related Records creation', async ({ eventPage }) => {
    await test.step('Start Related Records creation workflow', async () => {
      await eventPage.startWorkflow('Related Records creation');
      await eventPage.submitWorkflow({});
    });

    await test.step('Accept Request Related Records creation task', async () => {
      await eventPage.acceptTask();
    });

    await test.step('Complete task with Completed verdict', async () => {
      await eventPage.completeTask('Request Related Records creation', {
        verdict: 'Completed',
      });
    });
  });

  test('8. Request Technical Documents', async ({ eventPage, homePage }) => {
    let createdTaskUrl: string;
    await test.step('Start Request Technical Documents workflow', async () => {
      await eventPage.startWorkflow('Request Technical Documents');
      await eventPage.submitWorkflow(START_WORKFLOW.REQUEST_TECHNICAL_DOCUMENTS);
    });

    await test.step('Accept and complete Request Technical Documents task', async () => {
      await eventPage.acceptTask();
      createdTaskUrl = await eventPage.completeTask('Request Technical Documents', {
        verdict: 'Completed',
      });
    });

    await test.step('Switch to Admin 4 and open the last Label Event task', async () => {
      await eventPage.switchUser('ADMIN4');
      await homePage.openCreatedTask(createdTaskUrl!);
    });

    await test.step('Click Complete then Accept and complete SME Document Management', async () => {
      await eventPage.completeTask('SME Document Management', {
        verdict: 'Completed',
      });
    });
  });

  test('9. Create Global Content Plan', async ({ eventPage }) => {
    await test.step('Start Create Global Content Plan workflow', async () => {
      await eventPage.startWorkflow('Create Global Content Plan');
      await eventPage.submitWorkflow(START_WORKFLOW.CREATE_GLOBAL_CONTENT_PLAN);
    });
  });

  test('10. Creation + Cancel Event', async ({ eventPage, homePage }) => {
    await test.step('Creation and Cancel of the event', async () => {
      await eventPage.startWorkflow('Request Event Joins population');
      await homePage.button('Close').click();
      await expect(homePage.button('Close')).toBeHidden();
      await eventPage.cancelEvent();
    });

    await test.step('Reject Event Cancelation Request', async () => {
      await eventPage.completeCancelationRequest('reject');
    });

    await test.step('Approve Event Cancelation Request', async () => {
      await eventPage.startWorkflow('Request Event Joins population');
      await homePage.button('Close').click();
      await expect(homePage.button('Close')).toBeHidden();
      await eventPage.cancelEvent();
      await eventPage.completeCancelationRequest('approve');
    });
  });

  test('11. Creation + Cancel Event (GRO)', async ({ eventPage, homePage }) => {
    await test.step('Creation and Cancel of the event', async () => {
      await eventPage.startWorkflow('Request Event Joins population');
      await homePage.button('Close').click();
      await expect(homePage.button('Close')).toBeHidden();
      await eventPage.cancelGROEvent();
    });
  });
});
