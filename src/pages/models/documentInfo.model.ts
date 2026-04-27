export interface DocumentInfoModel {
  name: string;
  annotatedClean?: string;
  products?: string;
  productFamily?: string;
  country?: string;
}

export const DOCUMENT_TEMPLATES = {
  LABELING_PRODUCT_INFORMATION: {
    name: 'Doc-Naboo-Template',
    annotatedClean: 'Clean',
    products: 'A&D - VANDOL',
    productFamily: 'DEXPANTHENOL',
    country: 'Austria',
  },
  CLINICAL_CLINICALARCH_INSURANCEPCKG: {
    title: 'Doc-clinical-templte',
  },
} as const;

export function createDocumentData(overrides?: Partial<DocumentInfoModel>, template: DocumentInfoModel = DOCUMENT_TEMPLATES.LABELING_PRODUCT_INFORMATION): DocumentInfoModel {
  const timestamp = Date.now();
  return {
    ...template,
    name: `Doc-Auto-${timestamp}`,
    ...overrides,
  };
}
