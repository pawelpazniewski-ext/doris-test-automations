export interface WorkflowModel {
  isTaskUrgent?: string;
  rplDelegate?: string;
  globalApplication?: string;
  contentPlanTemplate?: string;
  createGlobalContentPlanAs?: string;
  dueDate?: string;
  CMCDGroupManagement?: string;
  CMCDGroupManagementInstructions?: string;
  SME?: string;
}

export const START_WORKFLOW = {
  REQUEST_EVENT_JOINS: {
    isTaskUrgent: 'No',
    rplDelegate: 'Admin 3',
  },
  REQUEST_GLOBAL_APPLICATION: {
    isTaskUrgent: 'No',
  },
  REQUEST_IMPACT_ASSESSMENT_REPORT: {
    rplDelegate: 'Admin 3',
  },
  REQUEST_RA_IMPLEMENTATION: {
    isTaskUrgent: 'No',
  },
  CREATE_GLOBAL_CONTENT_PLAN: {
    globalApplication: 'GA - ACETYLSALICYLIC ACID (PAIN AND FEVER)',
    contentPlanTemplate: 'Regulatory Use - Medicinal Product Template',
    createGlobalContentPlanAs: 'Active',
  },
  REQUEST_ADMIN_DOCUMENTS: {
    dueDate: 'today',
  },
  REQUEST_TECHNICAL_DOCUMENTS: {
    CMCDGroupManagement: 'Admin 3',
    CMCDGroupManagementInstructions: 'test',
    SME: 'Admin 4',
    dueDate: 'today',
  },
} as const;

export const IAR_URL = 'https://example.com/request-impact-assessment-report';
