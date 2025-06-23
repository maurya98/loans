import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm';

export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

@Entity('alerts')
@Index(['isResolved'])
@Index(['createdAt'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: AlertType
  })
  type!: AlertType;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  service: string | null = null;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean = false;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolvedAt: Date | null = null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
} 