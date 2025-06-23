import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User';

@Entity('api_keys')
@Index(['key'], { unique: true })
@Index(['userId'])
@Index(['isActive'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[] = [];

  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User, user => user.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
} 