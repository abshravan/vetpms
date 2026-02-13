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

export enum VaccinationStatus {
  SCHEDULED = 'scheduled',
  ADMINISTERED = 'administered',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

@Entity('vaccinations')
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'uuid', nullable: true })
  visitId: string | null;

  @ManyToOne(() => Visit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'visitId' })
  visit: Visit | null;

  @Column({ type: 'uuid', nullable: true })
  administeredById: string | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'administeredById' })
  administeredBy: User | null;

  @Column({ length: 150 })
  vaccineName: string;

  @Column({ length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ length: 100, nullable: true })
  lotNumber: string | null;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date | null;

  @Column({ length: 50, nullable: true, comment: 'e.g. SC, IM, intranasal' })
  route: string | null;

  @Column({ length: 50, nullable: true, comment: 'e.g. Right rear leg, Left forelimb' })
  site: string | null;

  @Column({ type: 'date', nullable: true })
  dateAdministered: Date | null;

  @Index()
  @Column({ type: 'date', nullable: true })
  nextDueDate: Date | null;

  @Column({
    type: 'enum',
    enum: VaccinationStatus,
    default: VaccinationStatus.SCHEDULED,
  })
  status: VaccinationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
