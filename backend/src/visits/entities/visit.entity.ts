import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Vitals } from './vitals.entity';
import { ClinicalNote } from './clinical-note.entity';

export enum VisitStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Index()
  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'uuid' })
  vetId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vetId' })
  vet: User;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string | null;

  @ManyToOne(() => Appointment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment | null;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.OPEN,
  })
  status: VisitStatus;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string | null;

  @OneToMany(() => Vitals, (v) => v.visit)
  vitals: Vitals[];

  @OneToMany(() => ClinicalNote, (n) => n.visit)
  clinicalNotes: ClinicalNote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
