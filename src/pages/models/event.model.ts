export interface CreateEventModel {
  applicableProductType: string;
  keyword: string;
  projectType: string;
  safetyRelated: string;
  locallyInitiated: string;
  labelingImpact: string;
  haExpectedDueDateAvailable: string;
}

export const CREATE_EVENT = {
  DEFAULT_LABEL_EVENT: {
    applicableProductType: 'Cosmetic',
    keyword: 'Adverse Drug Reactions',
    projectType: 'CCDS Variation (Global)',
    safetyRelated: 'Yes',
    locallyInitiated: 'Yes',
    labelingImpact: 'Yes',
    haExpectedDueDateAvailable: 'Yes',
  },
} as const;
