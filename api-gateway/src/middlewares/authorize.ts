import { Request, Response, NextFunction } from 'express';

export function authorize(roles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      res.status(403).json({ message: 'No user authenticated' });
      return;
    }
    if (roles.length && !roles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
} 