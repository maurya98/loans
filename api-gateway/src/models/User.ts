import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { ApiKey } from './ApiKey';
import { RequestLog } from './RequestLog';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole = UserRole.USER;

  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys!: ApiKey[];

  @OneToMany(() => RequestLog, requestLog => requestLog.user)
  requestLogs!: RequestLog[];

  // Helper methods
  toJSON(): Partial<User> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
} 