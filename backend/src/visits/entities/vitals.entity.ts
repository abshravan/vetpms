import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Visit } from './visit.entity';
import { User } from '../../users/entities/user.entity';

@Entity('vitals')
export class Vitals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  visitId: string;

  @ManyToOne(() => Visit, (v) => v.vitals, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'visitId' })
  visit: Visit;

  @Column({ type: 'uuid' })
  recordedById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recordedById' })
  recordedBy: User;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  temperature: number | null;

  @Column({ length: 5, nullable: true, comment: 'F or C' })
  temperatureUnit: string | null;

  @Column({ type: 'int', nullable: true, comment: 'beats per minute' })
  heartRate: number | null;

  @Column({ type: 'int', nullable: true, comment: 'breaths per minute' })
  respiratoryRate: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight: number | null;

  @Column({ length: 5, nullable: true })
  weightUnit: string | null;

  @Column({ type: 'int', nullable: true, comment: '1-9 body condition score' })
  bodyConditionScore: number | null;

  @Column({ type: 'int', nullable: true, comment: '0-4 pain score' })
  painScore: number | null;

  @Column({ length: 20, nullable: true, comment: 'e.g. pink, pale, cyanotic' })
  mucousMembraneColor: string | null;

  @Column({ type: 'int', nullable: true, comment: 'capillary refill time in seconds' })
  capillaryRefillTime: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  recordedAt: Date;
}
