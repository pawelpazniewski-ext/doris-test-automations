export interface SubmissionModel {
  submissionName: string;
  applicant: string;
  LRAContact: string;
  submissionType: string;
  changeControlNumber: string;
  contentPlan: string;
  publishingRequired: string;
  sequenceId?: string;
  submissionUnit?: string;
  workingDocumentsNeeded?: string;
  publisher?: string;
}

export const NEW_SUBMISSION = {
  MARKETING_DRUG_SUBMISSION: {
    submissionName: 'submission-naboo',
    applicant: 'Bayer AS (Norway)',
    LRAContact: 'Admin 3',
    submissionType: 'Paediatric submission, Article 46',
    changeControlNumber: '456864',
    contentPlan: 'AFM France 1614974 - Regulatory Event-004254',
    publishingRequired: 'Yes',
    sequenceId: '',
    submissionUnit: 'Consolidating',
    workingDocumentsNeeded: 'Yes',
    publisher: 'Editor 10',
  },
} as const;

export function createSubmissionData(overrides?: Partial<SubmissionModel>): SubmissionModel {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  const formattedSequenceId = randomNum.toString().padStart(4, '0');

  return {
    ...NEW_SUBMISSION.MARKETING_DRUG_SUBMISSION,

    submissionName: `Sub-${timestamp}`,
    sequenceId: formattedSequenceId,

    ...overrides,
  };
}
