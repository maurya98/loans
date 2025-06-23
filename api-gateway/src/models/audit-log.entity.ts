import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  method!: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  path!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  userId!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  clientId!: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  @Index()
  ipAddress!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'int' })
  statusCode!: number;

  @Column({ type: 'int', nullable: true })
  responseTime!: number | null; // in milliseconds

  @Column({ type: 'bigint', nullable: true })
  requestSize!: number | null; // in bytes

  @Column({ type: 'bigint', nullable: true })
  responseSize!: number | null; // in bytes

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  service!: string | null;

  @Column({ type: 'json', nullable: true })
  requestHeaders!: Record<string, string> | null;

  @Column({ type: 'json', nullable: true })
  responseHeaders!: Record<string, string> | null;

  @Column({ type: 'text', nullable: true })
  requestBody!: string | null;

  @Column({ type: 'text', nullable: true })
  responseBody!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  errorType!: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
} 