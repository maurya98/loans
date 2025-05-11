import { Request, Response } from 'express';
import Log from '../models/Log';
import API from '../models/API';
import { Op } from 'sequelize';

export const getApiUsage = async (req: Request, res: Response) => {
  const usage = await Log.findAll({
    attributes: ['apiId', [Log.sequelize!.fn('COUNT', Log.sequelize!.col('id')), 'count']],
    group: ['apiId'],
  });
  res.json(usage);
};

export const getApiErrorRates = async (req: Request, res: Response) => {
  const errors = await Log.findAll({
    attributes: ['apiId', [Log.sequelize!.fn('SUM', Log.sequelize!.literal('CASE WHEN statusCode >= 400 THEN 1 ELSE 0 END')), 'errorCount'], [Log.sequelize!.fn('COUNT', Log.sequelize!.col('id')), 'totalCount']],
    group: ['apiId'],
  });
  res.json(errors);
};

export const getApiLatency = async (req: Request, res: Response) => {
  const latency = await Log.findAll({
    attributes: ['apiId', [Log.sequelize!.fn('AVG', Log.sequelize!.col('latencyMs')), 'avgLatencyMs']],
    group: ['apiId'],
  });
  res.json(latency);
};

export const getMyApiKeyUsage = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const usage = await Log.findAll({
    where: { userId },
    attributes: ['apiId', [Log.sequelize!.fn('COUNT', Log.sequelize!.col('id')), 'count']],
    group: ['apiId'],
  });
  res.json(usage);
}; 