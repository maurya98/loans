import { Request, Response } from 'express';
import { AuthService, LoginCredentials, RegisterData } from '../../core/services/AuthService';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      const result = await this.authService.login(credentials);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error instanceof Error ? error.message : 'Authentication failed' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterData = req.body;
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile' });
    }
  }
} 