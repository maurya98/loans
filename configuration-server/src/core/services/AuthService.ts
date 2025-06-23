import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, UserRole, UserAttributes } from '../../infrastructure/database/models/User';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  role?: UserRole;
}

export class AuthService {
  private readonly JWT_SECRET: Secret;
  private readonly JWT_EXPIRES_IN: number;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 86400;
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; }> {
    const user = await User.findOne({ where: { username: credentials.username } });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(credentials.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = this.generateToken(user);

    return { token };
  }

  async register(data: RegisterData): Promise<{ token: string; user: Partial<User> }> {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
      isActive: true
    } as UserAttributes);

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user.toJSON();

    return { token, user: userWithoutPassword };
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
      algorithm: 'HS256'
    };

    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 