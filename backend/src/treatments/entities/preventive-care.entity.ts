import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum PreventiveCareType {
  FLEA_TICK = 'flea_tick',
  HEARTWORM = 'heartworm',
  DEWORMING = 'deworming',
  DENTAL = 'dental',
  WELLNESS_EXAM = 'wellness_exam',
  BLOOD_WORK = 'blood_work',
  URINALYSIS = 'urinalysis',
  OTHER = 'other',
}

export enum PreventiveCareStatus {
  ACTIVE = 'active',
  DUE = 'due',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  DISCONTINUED = 'discontinued',
}

@Entity('preventive_care')
export class PreventiveCare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: PreventiveCareType,
  })
  careType: PreventiveCareType;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 100, nullable: true })
  productName: string | null;

  @Column({ type: 'date', nullable: true })
  lastAdministered: Date | null;

  @Index()
  @Column({ type: 'date', nullable: true })
  nextDueDate: Date | null;

  @Column({ type: 'int', nullable: true, comment: 'Frequency in days between doses' })
  frequencyDays: number | null;

  @Column({
    type: 'enum',
    enum: PreventiveCareStatus,
    default: PreventiveCareStatus.ACTIVE,
  })
  status: PreventiveCareStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
