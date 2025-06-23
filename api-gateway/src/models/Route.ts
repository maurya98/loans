import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { RequestLog } from './RequestLog';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD'
}

@Entity('routes')
@Index(['path', 'method'], { unique: true })
@Index(['isActive'])
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  path!: string;

  @Column({
    type: 'enum',
    enum: HttpMethod
  })
  method!: HttpMethod;

  @Column({ type: 'varchar', length: 255 })
  upstream!: string;

  @Column({ type: 'jsonb', default: {} })
  loadBalancerConfig: Record<string, any> = {};

  @Column({ type: 'jsonb', nullable: true })
  rateLimitConfig: Record<string, any> | null = null;

  @Column({ type: 'boolean', default: false })
  authentication: boolean = false;

  @Column({ type: 'jsonb', nullable: true })
  authorization: Record<string, any> | null = null;

  @Column({ type: 'jsonb', default: [] })
  plugins: any[] = [];

  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => RequestLog, requestLog => requestLog.route)
  requestLogs!: RequestLog[];
}

export interface CreateRouteRequest {
  name: string;
  path: string;
  method: string;
  upstream: string;
  authentication?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  plugins?: string[];
}

export interface UpdateRouteRequest {
  name?: string;
  path?: string;
  method?: string;
  upstream?: string;
  authentication?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  plugins?: string[];
  isActive?: boolean;
} 