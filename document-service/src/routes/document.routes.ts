import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import multer from 'multer';

const router = Router();
const documentController = new DocumentController();
const upload = multer({ storage: multer.memoryStorage() });

// Document routes
router.post('/upload/:token?', upload.single('file'), documentController.upload.bind(documentController));
router.post('/signed-url/upload', documentController.generateUploadSignedUrl.bind(documentController));
router.get('/:id/signed-url/download', documentController.getSignedUrl.bind(documentController));
router.get('/:id/download', documentController.download.bind(documentController));
router.delete('/:id', documentController.delete.bind(documentController));
router.get('/', documentController.list.bind(documentController));
router.post('/upload-callback', documentController.handleUploadCallback.bind(documentController));

export { router as documentRouter }; 