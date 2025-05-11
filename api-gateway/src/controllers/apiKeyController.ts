import { Request, Response } from 'express';
import APIKey from '../models/APIKey';
import { v4 as uuidv4 } from 'uuid';

export const getAllAPIKeys = async (req: Request, res: Response): Promise<void> => {
  const keys = await APIKey.findAll();
  res.json(keys);
};

export const getAPIKeyById = async (req: Request, res: Response): Promise<void> => {
  const key = await APIKey.findByPk(req.params.id);
  if (!key) {
    res.status(404).json({ message: 'API Key not found' });
    return;
  }
  res.json(key);
};

export const createAPIKey = async (req: Request, res: Response): Promise<void> => {
  const { userId, apiId } = req.body;
  const key = uuidv4();
  const apiKey = await APIKey.create({ key, userId, apiId, status: 'active' });
  res.status(201).json(apiKey);
};

export const updateAPIKey = async (req: Request, res: Response): Promise<void> => {
  const apiKey = await APIKey.findByPk(req.params.id);
  if (!apiKey) {
    res.status(404).json({ message: 'API Key not found' });
    return;
  }
  await apiKey.update(req.body);
  res.json(apiKey);
};

export const deleteAPIKey = async (req: Request, res: Response): Promise<void> => {
  const apiKey = await APIKey.findByPk(req.params.id);
  if (!apiKey) {
    res.status(404).json({ message: 'API Key not found' });
    return;
  }
  await apiKey.destroy();
  res.status(204).send();
}; 