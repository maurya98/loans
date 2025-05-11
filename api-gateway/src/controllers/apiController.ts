import { Request, Response } from 'express';
import API from '../models/API';

export const getAllAPIs = async (req: Request, res: Response): Promise<void> => {
  const apis = await API.findAll();
  res.json(apis);
};

export const getAPIById = async (req: Request, res: Response): Promise<void> => {
  const api = await API.findByPk(req.params.id);
  if (!api) {
    res.status(404).json({ message: 'API not found' });
    return;
  }
  res.json(api);
};

export const createAPI = async (req: Request, res: Response): Promise<void> => {
  if (req.body.defaultVersion) {
    await API.update({ defaultVersion: false }, { where: { basePath: req.body.basePath } });
  }
  const api = await API.create(req.body);
  res.status(201).json(api);
};

export const updateAPI = async (req: Request, res: Response): Promise<void> => {
  const api = await API.findByPk(req.params.id);
  if (!api) {
    res.status(404).json({ message: 'API not found' });
    return;
  }
  if (req.body.defaultVersion) {
    await API.update({ defaultVersion: false }, { where: { basePath: api.basePath } });
  }
  await api.update(req.body);
  res.json(api);
};

export const deleteAPI = async (req: Request, res: Response): Promise<void> => {
  const api = await API.findByPk(req.params.id);
  if (!api) {
    res.status(404).json({ message: 'API not found' });
    return;
  }
  await api.destroy();
  res.status(204).send();
}; 