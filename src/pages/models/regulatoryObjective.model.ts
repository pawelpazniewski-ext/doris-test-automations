export interface RegulatoryObjectiveModel {
  regulatoryObjectiveName: string;
  globalRegulatoryObjectiveType: string;
  XEVMPDSubmissionNeeded: string;
  safetyRelated?: string;
  labelingImpact: string;
  worksharing: string;
}

export const NEW_REGULATORY_OBJ = {
  REGULATORY_OBJ_DEFAULT: {
    regulatoryObjectiveName: '',
    globalRegulatoryObjectiveType: 'Notification',
    XEVMPDSubmissionNeeded: 'Completed',
    safetyRelated: 'Yes',
    labelingImpact: 'No',
    worksharing: 'No',
  },
} as const;

export function createRegulatoryObjectiveData(overrides?: Partial<RegulatoryObjectiveModel>): RegulatoryObjectiveModel {
  const timestamp = Date.now();

  return {
    ...NEW_REGULATORY_OBJ.REGULATORY_OBJ_DEFAULT,

    regulatoryObjectiveName: `REG-${timestamp}`,

    ...overrides,
  };
}
