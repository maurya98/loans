import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('services')
@Index(['name'], { unique: true })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'jsonb' })
  hosts: Record<string, any>[] = [];

  @Column({ type: 'varchar', length: 255, nullable: true })
  healthCheck: string | null = null;

  @Column({ type: 'boolean', default: true })
  isHealthy: boolean = true;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastHealthCheck: Date | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

export interface CreateServiceRequest {
  name: string;
  hosts: string[];
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
}

export interface UpdateServiceRequest {
  name?: string;
  hosts?: string[];
  healthCheck?: {
    path: string;
    interval: number;
    timeout: number;
  };
  isActive?: boolean;
} 