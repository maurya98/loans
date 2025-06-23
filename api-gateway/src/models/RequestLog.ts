import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User';
import { Route } from './Route';

@Entity('request_logs')
@Index(['timestamp'])
@Index(['routeId'])
@Index(['statusCode'])
@Index(['userId'])
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  routeId!: string | null;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ type: 'varchar', length: 255 })
  path!: string;

  @Column({ type: 'integer' })
  statusCode!: number;

  @Column({ type: 'integer' })
  responseTime!: number;

  @Column({ type: 'varchar', length: 45 })
  ip!: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null = null;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp!: Date;

  // Relationships
  @ManyToOne(() => Route, route => route.requestLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routeId' })
  route!: Route | null;

  @ManyToOne(() => User, user => user.requestLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: User | null;
} 