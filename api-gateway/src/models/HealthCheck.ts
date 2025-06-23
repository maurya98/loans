import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm';

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}

@Entity('health_checks')
@Index(['service'])
@Index(['checkedAt'])
export class HealthCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  service!: string;

  @Column({
    type: 'enum',
    enum: HealthStatus
  })
  status!: HealthStatus;

  @Column({ type: 'integer', nullable: true })
  responseTime: number | null = null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  checkedAt!: Date;
} 