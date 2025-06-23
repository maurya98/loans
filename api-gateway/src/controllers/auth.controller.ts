import { Router, Request, Response } from 'express';
import { AuthenticationMiddleware } from '../middleware/authentication';

export class AuthController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.post('/login', this.login);
    this.router.post('/refresh', this.refreshToken);
    this.router.get('/me', AuthenticationMiddleware.requireAuth(), this.me);
  }

  public getRouter(): Router {
    return this.router;
  }

  private login(req: Request, res: Response): Response {
    // Example: Accept username/password and return JWT
    const { username, password } = req.body;
    // TODO: Validate user from DB
    if (username === 'admin' && password === 'password') {
      const token = AuthenticationMiddleware.generateJWT({ username, roles: ['admin'] });
      const refreshToken = AuthenticationMiddleware.generateRefreshToken({ username });
      return res.json({ token, refreshToken });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  private refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    // TODO: Validate refresh token
    try {
      const payload = AuthenticationMiddleware.validateJWT(refreshToken);
      const token = AuthenticationMiddleware.generateJWT(payload);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  private me(req: Request, res: Response) {
    res.json({ user: req.user });
  }
} 