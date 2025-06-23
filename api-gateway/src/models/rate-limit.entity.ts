import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('rate_limits')
export class RateLimit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  identifier!: string; // client_id, user_id, or ip_address

  @Column({ type: 'varchar', length: 50 })
  @Index()
  type!: string; // 'client', 'user', 'ip', 'global'

  @Column({ type: 'varchar', length: 500, nullable: true })
  @Index()
  endpoint!: string;

  @Column({ type: 'int' })
  limit!: number;

  @Column({ type: 'int' })
  window!: number; // in seconds

  @Column({ type: 'int', default: 0 })
  currentCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  windowStart!: Date;

  @Column({ type: 'timestamp', nullable: true })
  windowEnd!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 