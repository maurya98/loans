import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

@Entity('circuit_breakers')
@Index(['service'], { unique: true })
export class CircuitBreaker {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  service!: string;

  @Column({
    type: 'enum',
    enum: CircuitBreakerState
  })
  state!: CircuitBreakerState;

  @Column({ type: 'integer', default: 0 })
  failureCount: number = 0;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastFailureTime: Date | null = null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextAttemptTime: Date | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
} 