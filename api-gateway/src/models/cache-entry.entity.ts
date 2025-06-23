import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('cache_entries')
export class CacheEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  type!: string | null; // 'memory', 'redis', 'database'

  @Column({ type: 'int', nullable: true })
  ttl!: number | null; // time to live in seconds

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'simple-array', default: [] })
  tags!: string[];

  @Column({ type: 'int', default: 0 })
  hitCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt!: Date | null;

  @Column({ type: 'bigint', nullable: true })
  size!: number | null; // size in bytes

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: any | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 