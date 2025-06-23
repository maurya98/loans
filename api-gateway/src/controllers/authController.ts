import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/authentication';
import authService from '../middleware/authentication';
import db from '../database/connection';
import logger from '../utils/logger';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // Validate input
      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        res.status(409).json({ error: 'User with this email or username already exists' });
        return;
      }

      // Create user
      const user = await authService.createUser(username, email, password, role);
      
      // Generate tokens
      const accessToken = authService.generateToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Store refresh token
      await db.query(
        'INSERT INTO api_keys (user_id, key, name, permissions) VALUES ($1, $2, $3, $4)',
        [user.id, refreshToken, 'Refresh Token', ['refresh']]
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.authenticateUser(email, password);

      if (!result.isValid) {
        res.status(401).json({ error: result.error });
        return;
      }

      const user = result.user!;
      
      // Generate tokens
      const accessToken = authService.generateToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Store refresh token
      await db.query(
        'INSERT INTO api_keys (user_id, key, name, permissions) VALUES ($1, $2, $3, $4)',
        [user.id, refreshToken, 'Refresh Token', ['refresh']]
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      logger.error('Login failed:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Validate refresh token
      const result = await authService.validateApiKey(refreshToken);

      if (!result.isValid) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      const user = result.user!;

      // Generate new tokens
      const newAccessToken = authService.generateToken(user);
      const newRefreshToken = authService.generateRefreshToken(user);

      // Update refresh token in database
      await db.query(
        'UPDATE api_keys SET key = $1 WHERE key = $2',
        [newRefreshToken, refreshToken]
      );

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      logger.error('Token refresh failed:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  public async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Invalidate refresh token
        await db.query(
          'DELETE FROM api_keys WHERE key = $1',
          [refreshToken]
        );
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout failed:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  public async createApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, permissions = [], expiresAt } = req.body;
      const userId = req.user!.id;

      if (!name) {
        res.status(400).json({ error: 'API key name is required' });
        return;
      }

      const apiKey = uuidv4();

      const result = await db.query(
        `INSERT INTO api_keys (user_id, key, name, permissions, expires_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, key, name, permissions, expires_at, created_at`,
        [userId, apiKey, name, permissions, expiresAt]
      );

      res.status(201).json({
        message: 'API key created successfully',
        apiKey: result.rows[0]
      });
    } catch (error) {
      logger.error('API key creation failed:', error);
      res.status(500).json({ error: 'API key creation failed' });
    }
  }

  public async getApiKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await db.query(
        'SELECT id, name, permissions, is_active, expires_at, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json({
        apiKeys: result.rows
      });
    } catch (error) {
      logger.error('Failed to get API keys:', error);
      res.status(500).json({ error: 'Failed to get API keys' });
    }
  }

  public async revokeApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await db.query(
        'UPDATE api_keys SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'API key not found' });
        return;
      }

      res.json({ message: 'API key revoked successfully' });
    } catch (error) {
      logger.error('API key revocation failed:', error);
      res.status(500).json({ error: 'API key revocation failed' });
    }
  }

  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Failed to get profile:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username, email } = req.body;
      const userId = req.user!.id;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (username) {
        updates.push(`username = $${paramCount++}`);
        values.push(username);
      }

      if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      values.push(userId);

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${paramCount} RETURNING id, username, email, role, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      logger.error('Profile update failed:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  }

  public async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long' });
        return;
      }

      // Get current user with password
      const userResult = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = userResult.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Hash new password
      const hashedNewPassword = await authService.hashPassword(newPassword);

      // Update password
      await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Password change failed:', error);
      res.status(500).json({ error: 'Password change failed' });
    }
  }
}

export default new AuthController(); 