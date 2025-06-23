import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('api_routes')
export class APIRoute {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  path!: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  method!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  backend!: string;

  @Column({ type: 'boolean', default: false })
  authentication!: boolean;

  @Column({ type: 'json', nullable: true })
  rateLimit!: any;

  @Column({ type: 'json', nullable: true })
  cache!: any;

  @Column({ type: 'json', nullable: true })
  headers!: Record<string, string>;

  @Column({ type: 'json', nullable: true })
  pathRewrite!: Record<string, string>;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 