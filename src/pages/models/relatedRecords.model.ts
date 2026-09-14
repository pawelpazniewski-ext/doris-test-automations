export interface RelatedRecordsModel {
  countries: string;
  submissionType: string;
  applications: string;
  publishingRequired: string;
  productFamily: string;
}

export const CREATE_RELATED_RECORDS = {
  DEFAULT: {
    countries: 'United Kingdom',
    submissionType: 'Planned Type (to be updated)',
    applications: 'WID-0812 MAA United Kingdom 1600155',
    publishingRequired: 'No',
    productFamily: 'DEXPANTHENOL',
  },
} as const;
