import { z } from 'zod';

export const DOCUMENT_CATEGORIES = [
  'Case Law',
  'Statute',
  'Regulation',
  'Contract',
  'Deposition',
  'Complaint',
  'Answer',
  'Motion',
  'Brief',
  'Judgment',
  'Order',
  'Exhibit',
  'Legal Memorandum',
  'Policy',
  'Compliance Document',
  'Other'
];

export const updateDocumentCategorySchema = z.object({
  category: z.enum(DOCUMENT_CATEGORIES)
});
