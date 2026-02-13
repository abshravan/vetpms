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
import { Visit } from '../../visits/entities/visit.entity';
import { User } from '../../users/entities/user.entity';

export enum TreatmentStatus {
  ORDERED = 'ordered',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TreatmentCategory {
  MEDICATION = 'medication',
  PROCEDURE = 'procedure',
  SURGERY = 'surgery',
  LAB_TEST = 'lab_test',
  IMAGING = 'imaging',
  FLUID_THERAPY = 'fluid_therapy',
  OTHER = 'other',
}

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  visitId: string;

  @ManyToOne(() => Visit, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'visitId' })
  visit: Visit;

  @Index()
  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'uuid' })
  administeredById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'administeredById' })
  administeredBy: User;

  @Column({
    type: 'enum',
    enum: TreatmentCategory,
    default: TreatmentCategory.MEDICATION,
  })
  category: TreatmentCategory;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Medication-specific fields
  @Column({ length: 100, nullable: true })
  dosage: string | null;

  @Column({ length: 50, nullable: true })
  dosageUnit: string | null;

  @Column({ length: 100, nullable: true })
  route: string | null;

  @Column({ length: 100, nullable: true })
  frequency: string | null;

  @Column({ type: 'int', nullable: true, comment: 'Duration in days' })
  durationDays: number | null;

  @Column({
    type: 'enum',
    enum: TreatmentStatus,
    default: TreatmentStatus.ORDERED,
  })
  status: TreatmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
