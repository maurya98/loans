import { Router } from 'express';
import path from 'path';

const router = Router();

// Serve the upload page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export const uploadRouter = router; 