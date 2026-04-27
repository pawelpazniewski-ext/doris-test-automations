export interface DocumentTypeModel {
  type: string;
  subtype: string;
  classification: string;
}

export const DOCUMENT_TYPES = {
  CLINICAL_INSURANCE: {
    type: 'Clinical',
    subtype: 'Clinical Archive',
    classification: 'Insurance Package',
  },
  LABELING_PRODUCTINF: {
    type: 'Labeling',
    subtype: 'Product Information',
    classification: 'Patient Information Leaflet (PIL)',
  },
} as const;

export function createDocumentType(overrides?: Partial<DocumentTypeModel>): DocumentTypeModel {
  return {
    ...DOCUMENT_TYPES.LABELING_PRODUCTINF,
    ...overrides,
  };
}
