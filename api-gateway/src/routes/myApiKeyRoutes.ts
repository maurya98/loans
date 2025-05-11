import { Router } from 'express';
import APIKey from '../models/APIKey';
import { authenticate } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// List user's API keys
router.get('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const keys = await APIKey.findAll({ where: { userId } });
  res.json(keys);
});

// Create a new API key for the user
router.post('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const { apiId } = req.body;
  const key = uuidv4();
  const apiKey = await APIKey.create({ key, userId, apiId, status: 'active' });
  res.status(201).json(apiKey);
});

// Revoke (delete) an API key
router.delete('/:id', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const apiKey = await APIKey.findOne({ where: { id: req.params.id, userId } });
  if (!apiKey) {
    res.status(404).json({ message: 'API Key not found' });
    return;
  }
  await apiKey.destroy();
  res.status(204).send();
});

export default router; 