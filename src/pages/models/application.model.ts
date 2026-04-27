export interface NewApplicationModel {
  appNumber: string;
  appName: string;
  applicableProductType: string;
  leadCountry: string;
  productFamily: string;
  appType: string;
  dossierFormat: string;
  procedureType: string;
}

export const NEW_APPLICATION = {
  MARKETING_DRUG_APP: {
    appNumber: 'CorusantAutoTest',
    appName: 'MarketingDrugApp-Naboo',
    applicableProductType: 'Food',
    leadCountry: 'European Union',
    productFamily: 'ACETYLSALICYLIC ACID (PAIN AND FEVER)',
    appType: 'Marketing Authorisation Application (MAA)',
    dossierFormat: 'eCTD',
    procedureType: 'Decentralised Procedure',
  },
} as const;

export function createApplicationData(overrides?: Partial<NewApplicationModel>): NewApplicationModel {
  return {
    ...NEW_APPLICATION.MARKETING_DRUG_APP,

    ...overrides,
  };
}
