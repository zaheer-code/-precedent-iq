import { Router } from 'express';
import {
  uploadDocuments,
  getMatterDocuments,
  getDocumentById,
  deleteDocument,
  reprocessDocument,
  updateDocumentCategory
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireDocumentOwnership } from '../middleware/ownershipMiddleware.js';
import { upload, handleUploadErrors } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateDocumentCategorySchema } from '../schemas/documentSchemas.js';

// Router for nested matter documents: /api/matters/:matterId/documents
const nestedRouter = Router({ mergeParams: true });
nestedRouter.post('/', upload.array('files', 10), handleUploadErrors, uploadDocuments);
nestedRouter.get('/', getMatterDocuments);

// Router for direct document operations: /api/documents/:documentId
export const directDocumentRouter = Router();
directDocumentRouter.use(authenticateToken);
directDocumentRouter.get('/:documentId', requireDocumentOwnership, getDocumentById);
directDocumentRouter.delete('/:documentId', requireDocumentOwnership, deleteDocument);
directDocumentRouter.post('/:documentId/reprocess', requireDocumentOwnership, reprocessDocument);
directDocumentRouter.patch('/:documentId/category', requireDocumentOwnership, validate(updateDocumentCategorySchema), updateDocumentCategory);

export default nestedRouter;
