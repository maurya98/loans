import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import APIKey from '../models/APIKey';
import User from '../models/User';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // API Key authentication
  const apiKey = req.header('x-api-key');
  if (apiKey) {
    APIKey.findOne({ where: { key: apiKey, status: 'active' } })
      .then(keyRecord => {
        if (!keyRecord) {
          res.status(401).json({ message: 'Invalid API Key' });
          return;
        }
        return User.findByPk(keyRecord.userId).then(user => {
          if (!user) {
            res.status(401).json({ message: 'User not found for API Key' });
            return;
          }
          (req as any).user = user;
          next();
        });
      })
      .catch(err => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        res.status(401).json({ message: 'Authentication failed', error: errorMsg });
      });
    return;
  }
  // JWT authentication
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      (req as any).user = payload;
      next();
      return;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(401).json({ message: 'Authentication failed', error: errorMsg });
      return;
    }
  }
  res.status(401).json({ message: 'No authentication provided' });
} 