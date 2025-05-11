import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import multer from 'multer';

const router = Router();
const documentController = new DocumentController();
const upload = multer({ storage: multer.memoryStorage() });

// Document routes
router.post('/upload', upload.single('file'), documentController.upload.bind(documentController));
router.get('/:id/signed-url/:operation', documentController.getSignedUrl.bind(documentController));
router.get('/:id/download', documentController.download.bind(documentController));
router.delete('/:id', documentController.delete.bind(documentController));
router.get('/', documentController.list.bind(documentController));

export const documentRouter = router; 