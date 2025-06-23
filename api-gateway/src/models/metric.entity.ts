import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  type!: string; // 'counter', 'gauge', 'histogram', 'summary'

  @Column({ type: 'double precision' })
  value!: number;

  @Column({ type: 'json', nullable: true })
  labels!: Record<string, string> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  service!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  endpoint!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  method!: string | null;

  @Column({ type: 'int', nullable: true })
  statusCode!: number | null;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
} 