import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 50 })
  action: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ nullable: true })
  resourceId: string | null;

  @Index()
  @Column({ nullable: true })
  userId: string | null;

  @Column({ length: 255, nullable: true })
  userEmail: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
